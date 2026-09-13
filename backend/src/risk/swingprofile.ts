import { q, exec, audit, getTradingEnv, setExitPolicy, setTradeDefaults } from '../db.js';
import type { TradingEnv } from '../config.js';
import {
  HARD_STOP_PCT, FLEX_STOP_PCT, MIN_ENTRY_DTE, MAX_ENTRY_DTE, MAX_HOLD_SESSIONS,
} from './exitpolicy.js';

/** DTE risk bands for the swing desk. tp=25 soft goal. sl=10 cut losers. trail=12
 *  post-lock giveback (ratchet tightens further). Never 0DTE. Size smaller on short DTE. */
export const DTE_BANDS: Record<number, { tp: number; sl: number; trail: number; max_position_usd: number; qty: number }> = {
  1: { tp: 0, sl: HARD_STOP_PCT, trail: 12, max_position_usd: 700, qty: 1 }, // kept for old JSON; never searched
  2: { tp: 0, sl: HARD_STOP_PCT, trail: 12, max_position_usd: 2500, qty: 1 },
  3: { tp: 0, sl: HARD_STOP_PCT, trail: 12, max_position_usd: 3500, qty: 1 },
  4: { tp: 0, sl: HARD_STOP_PCT, trail: 12, max_position_usd: 5000, qty: 1 },
  5: { tp: 0, sl: HARD_STOP_PCT, trail: 12, max_position_usd: 7000, qty: 1 },
  7: { tp: 0, sl: HARD_STOP_PCT, trail: 12, max_position_usd: 10000, qty: 1 },
  10: { tp: 0, sl: HARD_STOP_PCT, trail: 12, max_position_usd: 10000, qty: 1 },
  14: { tp: 0, sl: HARD_STOP_PCT, trail: 12, max_position_usd: 10000, qty: 1 },
};

export const QUICK_DTES = [2, 3, 4, 5, 7, 10, 14];

export function clampEntryDte(dte: number): number {
  const n = Math.round(Number(dte));
  if (QUICK_DTES.includes(n)) return n;
  if (!Number.isFinite(n)) return 7;
  return QUICK_DTES.reduce((best, x) => (Math.abs(x - n) < Math.abs(best - n) ? x : best), 7);
}

export function bandForDte(dte: number, robust?: boolean): { tp: number; sl: number; trail: number; max_position_usd: number; qty: number } {
  const d = clampEntryDte(dte);
  const b = { ...(DTE_BANDS[d] || DTE_BANDS[7]) };
  if (robust) b.sl = FLEX_STOP_PCT;
  return b;
}

export function isLeapsBot(action: any, name?: string): boolean {
  const exp = String(action?.expiration || '').toLowerCase();
  if (exp === 'leaps') return true;
  if (/leap/i.test(String(name || ''))) return true;
  if (/^\d{4}-\d{2}-\d{2}$/.test(exp)) {
    const days = (Date.parse(exp + 'T00:00:00Z') - Date.now()) / 864e5;
    if (days > 21) return true;
  }
  return false;
}

function parse(v: any): any {
  if (v == null) return {};
  if (typeof v === 'object') {
    try { return JSON.parse(JSON.stringify(v)); } catch { return {}; }
  }
  try { return JSON.parse(v); } catch { return {}; }
}

function retunePlay(p: any): any {
  const dte = clampEntryDte(p?.dte);
  const band = bandForDte(dte, !!p?.robust);
  let name = p?.name;
  if (typeof name === 'string') name = name.replace(/\d+\s*DTE/i, `${dte}DTE`);
  return {
    ...p,
    name,
    dte,
    risk: { ...p?.risk, tp: 25, sl: band.sl, trail: band.trail, max_position_usd: band.max_position_usd, qty: Number(p?.risk?.qty) || 1 },
  };
}

export function shapeSwingBot(bot: { name?: string; asset_class?: string; action: any; risk: any; rules?: any }): { action: any; risk: any; skip?: string; mode?: 'observe' } {
  const action = parse(bot.action);
  const risk = parse(bot.risk);
  if (String(bot.asset_class || '').toLowerCase() !== 'option') {
    return { action, risk, skip: 'not option' };
  }
  if (action._observe_only || parse(bot.rules)._observe_only) {
    return { action, risk, skip: 'observe-only' };
  }
  if (action.side === 'sell' || action.covered || /covered-?call/i.test(String(bot.name || ''))) {
    action.side = 'sell';
    action.covered = true;
    action.expiration = 'monthly';
    action._observe_only = true;
    delete action._dte;
    delete action._max_hold_bars;
    return { action, risk: { max_position_usd: 0, _observe_only: true }, skip: 'covered-call', mode: 'observe' };
  }
  if (isLeapsBot(action, bot.name)) {
    risk.hold_overnight = true;
    risk.hold_over_weekend = true;
    risk.allow_0dte = false;
    return { action, risk, skip: 'leaps', mode: 'observe' };
  }

  action.expiration = 'weekly';
  const dte = clampEntryDte(Number(action._dte) || 7);
  action._dte = dte;
  action._max_hold_bars = MAX_HOLD_SESSIONS;

  if (Array.isArray(action.plays)) action.plays = action.plays.map(retunePlay);
  if (action.symbol_plays && typeof action.symbol_plays === 'object') {
    for (const s of Object.keys(action.symbol_plays)) {
      action.symbol_plays[s] = (action.symbol_plays[s] || []).map(retunePlay);
    }
  }

  const band = bandForDte(dte);
  const nextBands: any = {};
  for (const k of Object.keys(DTE_BANDS)) nextBands[k] = { ...DTE_BANDS[Number(k)] };
  // Desk $ cap is a CEILING. Never copy it onto 2-DTE bands.
  if (risk.dte_bands && typeof risk.dte_bands === 'object') {
    for (const [k, band0] of Object.entries<any>(risk.dte_bands)) {
      const d = Number(k);
      const fresh = DTE_BANDS[d] || band;
      const cap = Number(risk.max_position_usd) > 0 ? Number(risk.max_position_usd) : fresh.max_position_usd;
      nextBands[k] = { ...fresh, ...band0, tp: 25, sl: HARD_STOP_PCT, trail: 12, max_position_usd: Math.min(Number(band0?.max_position_usd) || fresh.max_position_usd, cap, fresh.max_position_usd) };
    }
  }

  const ceiling = Number(risk.max_position_usd) > 0 ? Number(risk.max_position_usd) : 10000;
  risk.take_profit_pct = 25; // soft goal — close when hit; trail still rides winners
  risk.stop_loss_pct = HARD_STOP_PCT;
  risk.trailing_stop_pct = 12;
  risk.hold_overnight = false; // Eric: no overnight unless LEAPS
  risk.hold_over_weekend = false;
  risk.allow_0dte = false;
  risk.dte_bands = nextBands;
  risk.max_position_usd = ceiling;
  return { action, risk };
}

const attempted = new Set<string>();

/** Idempotent: rewrite the active option fleet onto the swing profile. LEAPS stay untouched. */
export async function applySwingFleet(env?: TradingEnv): Promise<{ updated: number; skipped: number; env: string }> {
  if (!env) env = await getTradingEnv();
  attempted.delete(env);
  await setExitPolicy({ holdOvernight: false, holdOverWeekend: false, closeBufferMin: 15 });
  await setTradeDefaults({ take_profit_pct: 25, stop_loss_pct: HARD_STOP_PCT, trailing_stop_pct: 12 });
  const bots = await q<any>('SELECT id, name, mode, asset_class, action, risk, rules FROM bots WHERE env=:env', { env });
  let updated = 0, skipped = 0;
  for (const bot of bots) {
    const shaped = shapeSwingBot(bot);
    if (shaped.skip === 'covered-call') {
      await exec("UPDATE bots SET enabled=0, mode='observe', action=CAST(:a AS JSON), risk=CAST(:r AS JSON) WHERE id=:id AND env=:env", {
        a: JSON.stringify(shaped.action), r: JSON.stringify(shaped.risk), id: bot.id, env,
      });
      updated++;
      continue;
    }
    if (shaped.skip === 'leaps' && (bot.mode === 'full_auto' || bot.mode === 'auto')) {
      await exec("UPDATE bots SET mode='observe' WHERE id=:id AND env=:env", { id: bot.id, env });
      updated++;
      continue;
    }
    if (shaped.skip) { skipped++; continue; }
    const prevA = JSON.stringify(parse(bot.action));
    const prevR = JSON.stringify(parse(bot.risk));
    const nextA = JSON.stringify(shaped.action);
    const nextR = JSON.stringify(shaped.risk);
    if (prevA === nextA && prevR === nextR) { skipped++; continue; }
    await exec('UPDATE bots SET action=CAST(:a AS JSON), risk=CAST(:r AS JSON) WHERE id=:id AND env=:env', {
      a: nextA, r: nextR, id: bot.id, env,
    });
    updated++;
  }
  await audit('swing.fleet', `swing profile on ${env}: ${updated} bots updated, ${skipped} skipped`, { updated, skipped });
  attempted.add(env);
  return { updated, skipped, env };
}

export async function ensureSwingFleet(env: TradingEnv): Promise<void> {
  if (attempted.has(env)) return;
  await applySwingFleet(env);
}
