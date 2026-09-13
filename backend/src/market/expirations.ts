import { MIN_ENTRY_DTE, MAX_ENTRY_DTE } from '../risk/exitpolicy.js';

/** The trading date `dte` trading days ahead (YYYY-MM-DD). resolveContract snaps this to
 *  the nearest listed expiration on/after it (QQQ/SPY etc. list daily expiries).
 *  Lives here (not quickbot.ts or bots/engine.ts) so both can import it without a cycle. */
export function dteToExpiration(dte: number): string {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const want = Math.min(MAX_ENTRY_DTE, Math.max(MIN_ENTRY_DTE, Math.floor(Number(dte) || MIN_ENTRY_DTE)));
  const d = new Date(`${today}T12:00:00Z`);
  let added = 0;
  while (added < want) {
    d.setUTCDate(d.getUTCDate() + 1);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  let iso = d.toISOString().slice(0, 10);
  while (iso <= today) {
    d.setUTCDate(d.getUTCDate() + 1);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) iso = d.toISOString().slice(0, 10);
  }
  return iso;
}
