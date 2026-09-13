/**
 * LEAPS / fundamental Ideas desk — observe by default.
 * Click-to-enable only records intent (enabled_observe). Never places orders or enables bots.
 */
import { getSetting, setSetting, audit } from './db.js';
import { LEAPS_IDEAS, LEAPS_IDEAS_META, type LeapsIdea, type LeapsIdeaStatus } from './seed/leapsIdeas.js';

const STATE_KEY = 'leaps_ideas_state';

type IdeaState = Record<string, { status: LeapsIdeaStatus; enabledAt?: string; note?: string }>;

async function loadState(): Promise<IdeaState> {
  return (await getSetting<IdeaState>(STATE_KEY, {})) || {};
}

export async function listLeapsIdeas(): Promise<{
  meta: typeof LEAPS_IDEAS_META;
  ideas: Array<LeapsIdea & { status: LeapsIdeaStatus; enabledAt?: string }>;
}> {
  const state = await loadState();
  const ideas = LEAPS_IDEAS.map((idea) => {
    const s = state[idea.id];
    return {
      ...idea,
      status: (s?.status || idea.defaultStatus) as LeapsIdeaStatus,
      enabledAt: s?.enabledAt,
    };
  });
  return { meta: LEAPS_IDEAS_META, ideas };
}

/** Intent only: flip card to enabled_observe. No orders, no bot toggles. */
export async function enableLeapsIdea(id: string): Promise<{ ok: boolean; idea?: any; error?: string }> {
  const base = LEAPS_IDEAS.find((i) => i.id === id);
  if (!base) return { ok: false, error: 'unknown idea id' };
  const state = await loadState();
  const enabledAt = new Date().toISOString();
  state[id] = {
    status: 'enabled_observe',
    enabledAt,
    note: 'Intent recorded — observe sleeve only; no orders placed',
  };
  await setSetting(STATE_KEY, state);
  await audit('ideas.leaps.enable_intent', `LEAPS idea ${id} → enabled_observe (no orders)`, {
    id,
    ticker: base.ticker,
    enabledAt,
  });
  const { ideas } = await listLeapsIdeas();
  return { ok: true, idea: ideas.find((i) => i.id === id) };
}

/** Return card to plain observe (clear enable intent). */
export async function observeLeapsIdea(id: string): Promise<{ ok: boolean; idea?: any; error?: string }> {
  const base = LEAPS_IDEAS.find((i) => i.id === id);
  if (!base) return { ok: false, error: 'unknown idea id' };
  const state = await loadState();
  state[id] = { status: 'observe', note: 'Returned to observe' };
  await setSetting(STATE_KEY, state);
  await audit('ideas.leaps.observe', `LEAPS idea ${id} → observe`, { id, ticker: base.ticker });
  const { ideas } = await listLeapsIdeas();
  return { ok: true, idea: ideas.find((i) => i.id === id) };
}
