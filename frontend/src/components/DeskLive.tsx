import { useEffect, useRef, useState } from 'react';
import { Desk, SetDeskPolicy, SetMode } from '../api/client';
import { money, num, pct, signClass, useAsync, Live, costUsd, notionalUsd } from './ui';
import { formatOccShort } from '../lib/options';
import { Icon } from './icons';
import OpenBook, { closeContract, plPct } from './OpenBook';
import './desk.css';

const RUNG_KEY = 'rh.desk.rungs';
const SEEN_ORDERS = 'rh.desk.seenOrders';
const PING_KEY = 'rh.desk.movePing';
const MOVE_COOLDOWN_MS = 5 * 60 * 1000;
const STACK_CAP = 6;

type CloseT = { symbol: string; occ_symbol: string; qty: number };
type Toast = {
  id: string;
  kind: 'fill' | 'move';
  title: string;
  body: string;
  down?: boolean;
  close?: CloseT | null;
};

function loadJson<T>(key: string, d: T): T {
  try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : d; } catch { return d; }
}
function saveJson(key: string, v: any) {
  try { sessionStorage.setItem(key, JSON.stringify(v)); } catch { /* private mode */ }
}

function loadSeen(): Record<string, string> {
  const v = loadJson<any>(SEEN_ORDERS, {});
  if (Array.isArray(v)) {
    const m: Record<string, string> = {};
    for (const id of v) m[String(id)] = 'any';
    return m;
  }
  return v && typeof v === 'object' ? v : {};
}

function notifyDesktop(title: string, body: string, tag: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
    return;
  }
  if (Notification.permission !== 'granted') return;
  try { new Notification(title, { body, tag }); } catch { /* ignored */ }
}

function pushStack(setToasts: (fn: (t: Toast[]) => Toast[]) => void, toast: Toast) {
  setToasts((t) => [toast, ...t.filter((x) => x.id !== toast.id)].slice(0, STACK_CAP));
}

function fillCopy(o: any): { title: string; body: string } {
  const label = formatOccShort(o.occ_symbol) || o.symbol;
  const cash = o.cost_usd != null ? Number(o.cost_usd) : notionalUsd(o.qty, o.filled_price || o.limit_price, o);
  const qty = num(o.qty, 0);
  const cashBit = cash != null ? (o.side === 'sell' ? `${money(cash)} proceeds` : `${money(cash)} cost`) : '';
  const bot = o.bot_name ? ` · ${o.bot_name}` : '';
  if (o.status === 'staged') return { title: `Staged ${label}`, body: `${qty} · needs approval${bot}` };
  if (o.side === 'sell') {
    const title = o.status === 'filled' ? `Sold ${label}` : `Selling ${label}`;
    return { title, body: [qty, cashBit, o.status === 'placed' ? 'working' : ''].filter(Boolean).join(' · ') + bot };
  }
  const title = o.status === 'filled' ? `Bought ${label}` : `Buying ${label}`;
  return { title, body: [qty, cashBit, o.status === 'placed' ? 'working' : ''].filter(Boolean).join(' · ') + bot };
}

function closeFromOrder(o: any, positions: any[]): CloseT | null {
  if (o.side === 'sell') return null;
  const occ = String(o.occ_symbol || '').toUpperCase();
  if (occ) {
    const p = positions.find((x) => String(x.occ_symbol || '').toUpperCase() === occ);
    return { symbol: o.symbol, occ_symbol: occ, qty: Number(p?.qty || o.qty) || 0 };
  }
  const matches = positions.filter((x) => x.symbol === o.symbol && Number(x.qty) > 0 && x.occ_symbol);
  if (matches.length === 1) {
    return { symbol: o.symbol, occ_symbol: String(matches[0].occ_symbol), qty: Number(matches[0].qty) };
  }
  return null;
}

export default function DeskLive({ health, onMode }: { health?: any; onMode?: () => void }) {
  const desk = useAsync<any>(Desk, [], 2000);
  const d = desk.data;
  const [size, setSize] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'err'>('idle');
  const [saveMsg, setSaveStateMsg] = useState('saved');
  const [drawer, setDrawer] = useState<'open' | 'wait' | null>(null);
  const [selling, setSelling] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastsRef = useRef<Toast[]>([]);
  toastsRef.current = toasts;
  const seeded = useRef(false);
  const rungs = useRef<Record<string, number>>(loadJson(RUNG_KEY, {}));
  const seenOrders = useRef<Record<string, string>>(loadSeen());
  const lastPing = useRef<Record<string, number>>(loadJson(PING_KEY, {}));

  useEffect(() => {
    const amt = d?.trade_defaults?.amount_usd;
    if (amt != null && size === '') setSize(String(Math.round(Number(amt))));
  }, [d?.trade_defaults?.amount_usd]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawer(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);

  const positions: any[] = (d?.positions || []).filter((p: any) => Number(p.qty) > 0);
  const waiting: any[] = d?.waiting || [];
  const waitingOn = waiting.filter((b: any) => b.state === 'waiting');
  const openPl = positions.reduce((s, p) => s + Number(p.unrealized_pl || 0), 0);
  const live = health?.env && health.env !== 'alpaca_paper';

  useEffect(() => {
    if (!d) return;
    const orders: any[] = d.orders || [];
    if (!seeded.current) {
      for (const o of orders) seenOrders.current[String(o.id)] = String(o.status || 'any');
      saveJson(SEEN_ORDERS, seenOrders.current);
      for (const p of positions) {
        const key = String(p.occ_symbol || p.symbol);
        const pl = plPct(p);
        if (pl != null) rungs.current[key] = Math.trunc(pl / 5);
      }
      saveJson(RUNG_KEY, rungs.current);
      seeded.current = true;
      return;
    }
    for (const o of orders) {
      const id = String(o.id);
      if (!id || id === 'undefined') continue;
      const prev = seenOrders.current[id];
      const st = String(o.status || '');
      if (prev === st || prev === 'any') {
        seenOrders.current[id] = st;
        continue;
      }
      const isNew = prev == null;
      const becameFill = prev && prev !== 'filled' && st === 'filled';
      if (!isNew && !becameFill) {
        seenOrders.current[id] = st;
        continue;
      }
      seenOrders.current[id] = st;
      const copy = fillCopy(o);
      const toast: Toast = {
        id: `o-${id}`, kind: 'fill', title: copy.title, body: copy.body,
        down: o.side === 'sell', close: closeFromOrder(o, positions),
      };
      pushStack(setToasts, toast);
      notifyDesktop(copy.title, copy.body, toast.id);
    }
    const keep = Object.fromEntries(Object.entries(seenOrders.current).slice(-80));
    seenOrders.current = keep;
    saveJson(SEEN_ORDERS, seenOrders.current);

    const now = Date.now();
    const liveKeys = new Set<string>();
    for (const p of positions) {
      const key = String(p.occ_symbol || p.symbol);
      liveKeys.add(key);
      const pl = plPct(p);
      if (pl == null) continue;
      const rung = Math.trunc(pl / 5);
      const prev = rungs.current[key];
      if (prev == null) { rungs.current[key] = rung; continue; }
      if (rung === prev || Math.abs(rung) < 1) continue;
      const level = rung * 5;
      const label = formatOccShort(p.occ_symbol) || p.symbol;
      const cost = costUsd(p);
      const title = `${label} ${level > 0 ? '+' : ''}${level}%`;
      const body = `${pct(pl)}${p.unrealized_pl != null ? ` · ${money(p.unrealized_pl)}` : ''}${cost != null ? ` on ${money(cost)}` : ''}`;
      const toast: Toast = {
        id: `m-${key}`, kind: 'move', title, body,
        down: rung < prev || pl < 0,
        close: p.occ_symbol ? { symbol: p.symbol, occ_symbol: String(p.occ_symbol), qty: Number(p.qty) } : null,
      };
      rungs.current[key] = rung;
      const inStack = toastsRef.current.some((x) => x.id === toast.id);
      const cooled = now - (lastPing.current[key] || 0) >= MOVE_COOLDOWN_MS;
      if (inStack) {
        pushStack(setToasts, toast);
      } else if (cooled) {
        pushStack(setToasts, toast);
        lastPing.current[key] = now;
        notifyDesktop(title, body, toast.id);
      }
    }
    for (const k of Object.keys(rungs.current)) {
      if (!liveKeys.has(k)) {
        delete rungs.current[k];
        delete lastPing.current[k];
      }
    }
    saveJson(RUNG_KEY, rungs.current);
    saveJson(PING_KEY, lastPing.current);
  }, [d?.ts]);

  const saveSize = async (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 25) return;
    setSaveState('saving'); setSaveStateMsg('saving');
    try {
      await SetDeskPolicy({ amount_usd: n, max_usd: n, maxPositionUsd: n });
      setSaveState('saved'); setSaveStateMsg('saved');
      desk.reload();
      setTimeout(() => setSaveState('idle'), 1800);
    } catch (e: any) {
      setSaveState('err'); setSaveStateMsg(String(e?.message || e).slice(0, 40));
    }
  };

  const armFullAuto = async () => {
    setSaveState('saving'); setSaveStateMsg('saving');
    try {
      const n = Number(size) > 0 ? Number(size) : 10000;
      await SetDeskPolicy({ mode: 'full_auto', amount_usd: n, max_usd: n, maxPositionUsd: n, all_bots_full_auto: true });
      await SetMode('full_auto');
      onMode?.();
      setSaveState('saved'); setSaveStateMsg('saved');
      desk.reload();
      setTimeout(() => setSaveState('idle'), 1800);
    } catch (e: any) {
      setSaveState('err'); setSaveStateMsg(String(e?.message || e).slice(0, 40));
    }
  };

  const closeFromToast = async (t: Toast) => {
    if (!t.close) return;
    const p = positions.find((x) => String(x.occ_symbol).toUpperCase() === t.close!.occ_symbol.toUpperCase()) || t.close;
    setSelling(t.close.occ_symbol);
    try {
      const r = await closeContract(p, !!live);
      if (r.ok && r.orderId) seenOrders.current[String(r.orderId)] = r.status || 'placed';
      if (r.ok) {
        setToasts((x) => x.filter((y) => y.id !== t.id));
        desk.reload();
      }
    } catch (e: any) {
      pushStack(setToasts, { id: `s-${Date.now()}`, kind: 'fill', title: 'Close blocked', body: String(e?.message || e).slice(0, 120), down: true });
    } finally { setSelling(null); }
  };

  return (
    <>
      <div className="desk-bar">
        <button className={health?.mode === 'full_auto' ? 'primary' : ''} onClick={armFullAuto} type="button">
          Full auto · all bots
        </button>
        <label>
          $ / trade
          <input className="desk-size" type="number" inputMode="decimal" min={25} step={100} value={size}
            onChange={(e) => { setSize(e.target.value); setSaveState('idle'); }}
            onBlur={(e) => saveSize(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            aria-label="Dollars per trade" />
        </label>
        <span className={`badge desk-save ${saveState === 'idle' ? '' : saveState}`}>{saveState === 'idle' ? 'live' : saveMsg}</span>
        {d?.live || positions.some((p) => p.live) ? <Live /> : null}
        <span className="muted desk-clock">{d?.market_open ? 'market open' : 'market closed'}</span>
        <div className="desk-bar-sp" />
        <button type="button" className={`desk-chip ${positions.length ? '' : 'empty'}`} aria-expanded={drawer === 'open'} onClick={() => setDrawer(drawer === 'open' ? null : 'open')}>
          <Icon name="positions" size={15} />
          Open {positions.length}
          <span className={signClass(openPl)}>{money(openPl)}</span>
        </button>
        <button type="button" className="desk-chip" aria-expanded={drawer === 'wait'} onClick={() => setDrawer(drawer === 'wait' ? null : 'wait')}>
          <Icon name="bot" size={15} />
          Waiting {waitingOn.length}
        </button>
        <a className="desk-chip desk-chip-link" href="#/orders">Orders</a>
      </div>

      {toasts.length > 0 && (
        <div className="desk-toast-rail" aria-live="assertive">
          {toasts.map((t) => (
            <div key={t.id} className={`desk-toast ${t.down ? 'down' : ''}`}>
              <div className="desk-toast-copy">
                <div className="desk-toast-title">{t.title}</div>
                <div className="desk-toast-body">{t.body}</div>
              </div>
              <div className="desk-toast-actions">
                {t.close && (
                  <button type="button" className="danger" disabled={selling === t.close.occ_symbol} onClick={() => closeFromToast(t)}>
                    {selling === t.close.occ_symbol ? 'Closing…' : 'Close'}
                  </button>
                )}
                <button type="button" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {drawer && (
        <div className="desk-sheet-root">
          <button type="button" className="desk-sheet-scrim" aria-label="Close drawer" onClick={() => setDrawer(null)} />
          <aside className="desk-sheet" role="dialog" aria-modal="true" aria-label={drawer === 'wait' ? 'Waiting bots' : 'Open positions'}>
            <div className="desk-sheet-top">
              <div className="desk-sheet-tabs">
                <button type="button" className={drawer === 'open' ? 'on' : ''} onClick={() => setDrawer('open')}>Open {positions.length}</button>
                <button type="button" className={drawer === 'wait' ? 'on' : ''} onClick={() => setDrawer('wait')}>Waiting {waitingOn.length}</button>
              </div>
              <a href="#/orders" onClick={() => setDrawer(null)}>Full Orders tab</a>
              <button type="button" className="icon-btn desk-sheet-x" aria-label="Close drawer" onClick={() => setDrawer(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="desk-sheet-body">
              {drawer === 'open' ? (
                <OpenBook positions={positions} waiting={[]} live={!!live} onSold={() => desk.reload()} show="open" />
              ) : (
                <OpenBook positions={[]} waiting={waiting} live={!!live} show="wait" />
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
