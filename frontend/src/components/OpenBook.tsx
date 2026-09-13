import { useState } from 'react';
import { PlaceOrder } from '../api/client';
import { money, num, pct, signClass, posLast, costUsd, Badge } from './ui';
import { occToContract, formatOccShort } from '../lib/options';

export function plPct(p: any): number | null {
  const last = posLast(p);
  const avg = Number(p.avg_cost);
  if (last == null || !(avg > 0)) return null;
  return ((last - avg) / avg) * 100;
}

export async function closeContract(p: any, live: boolean): Promise<{ ok: boolean; status?: string; reason: string; orderId?: number }> {
  const occ = String(p.occ_symbol || '');
  const c = occToContract(occ);
  const qty = Math.abs(Number(p.qty) || 0);
  if (!occ || !c || !(qty > 0)) return { ok: false, reason: 'missing contract' };
  const label = formatOccShort(occ);
  if (!confirm(`${live ? 'REAL MONEY. ' : ''}Close ${qty} ${label} at market?`)) return { ok: false, reason: 'cancelled' };
  const r = await PlaceOrder({
    symbol: p.symbol, side: 'sell', qty, asset_class: 'option', order_type: 'market',
    option_type: c.type,
    _contract: { occSymbol: occ, type: c.type, strike: c.strike, expiration: c.expiration },
  });
  return { ok: true, status: r.status, reason: r.reason || r.action, orderId: r.orderId };
}

export function OpenRows({
  positions, live, selling, onClose,
}: {
  positions: any[];
  live?: boolean;
  selling: string | null;
  onClose: (p: any) => void;
}) {
  if (positions.length === 0) {
    return <div className="desk-empty">No open contracts.</div>;
  }
  return (
    <div className="desk-rows">
      {positions.map((p) => {
        const plp = plPct(p);
        const down = Number(p.unrealized_pl) < 0;
        const cost = costUsd(p);
        const occ = String(p.occ_symbol || '');
        return (
          <div key={occ || p.id} className={`desk-row ${down ? 'down' : ''}`}>
            <div className="desk-row-main">
              <div className="desk-sym">{formatOccShort(occ) || p.symbol}</div>
              <div className="desk-meta">
                {p.bot_name || 'manual'} · {num(p.qty, 0)}
                {cost != null ? ` · cost ${money(cost)}` : ''}
                {p.market_value != null ? ` · now ${money(p.market_value)}` : ''}
              </div>
            </div>
            <div className={`desk-pl ${signClass(p.unrealized_pl)}`}>
              <div className="desk-pl-usd">{money(p.unrealized_pl)}</div>
              <div className="desk-pl-pct">{plp == null ? '—' : pct(plp)}</div>
            </div>
            <div className="desk-actions">
              <button type="button" className="danger" disabled={selling === occ} onClick={() => onClose(p)}>
                {selling === occ ? 'Closing…' : 'Close'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WaitingList({ waiting }: { waiting: any[] }) {
  const waitingOn = waiting.filter((b) => b.state === 'waiting');
  const justFired = waiting.filter((b) => b.state === 'fired');
  if (waiting.length === 0) {
    return <div className="desk-empty">No bots are armed.</div>;
  }
  return (
    <ul className="desk-wait-rows">
      {justFired.map((b) => (
        <li key={b.id} className="desk-wait-row fired">
          <Badge kind="green">fired</Badge>
          <div>
            <b>{b.name}</b>
            <div className="why">{b.why}</div>
          </div>
        </li>
      ))}
      {waitingOn.map((b) => (
        <li key={b.id} className="desk-wait-row">
          <span className="dot green" />
          <div>
            <b>{b.name}</b>
            <div className="muted">{(b.symbols || []).join(', ')}</div>
            <div className="why">{b.why}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function OpenBook({
  positions, waiting, live, onSold, show = 'both',
}: {
  positions: any[];
  waiting: any[];
  live?: boolean;
  onSold?: () => void;
  show?: 'open' | 'wait' | 'both';
}) {
  const [selling, setSelling] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const close = async (p: any) => {
    const occ = String(p.occ_symbol || '');
    setErr('');
    setSelling(occ);
    try {
      const r = await closeContract(p, !!live);
      if (r.ok) onSold?.();
      else if (r.reason !== 'cancelled') setErr(r.reason);
    } catch (e: any) {
      setErr(String(e?.message || e).slice(0, 120));
    } finally { setSelling(null); }
  };

  const waitingOn = waiting.filter((b) => b.state === 'waiting');
  const openPl = positions.reduce((s, p) => s + Number(p.unrealized_pl || 0), 0);
  const showOpen = show !== 'wait';
  const showWait = show !== 'open';

  return (
    <div className="open-book">
      {showOpen && (
        <>
          <div className="desk-open-head">
            <h3>Open now ({positions.length})</h3>
            <span className={`desk-open-pl ${signClass(openPl)}`}>{money(openPl)}</span>
          </div>
          <OpenRows positions={positions} live={live} selling={selling} onClose={close} />
          {err && <div className="desk-empty red">{err}</div>}
        </>
      )}
      {showWait && (
        <div className={showOpen ? 'desk-wait' : undefined}>
          <div className="desk-open-head">
            <h3>Waiting for a signal ({waitingOn.length})</h3>
          </div>
          <WaitingList waiting={waiting} />
        </div>
      )}
    </div>
  );
}
