// Shared exit policy — the ONE place that decides when a long position exits, used by BOTH
// the live monitor (risk/monitor.ts) and the backtest simulator (quickbot.ts). Keeping them
// identical is a hard rule: if backtest and live disagree, the backtest numbers are lies.
//
// Profile: 2–14 day OPTIONS (2026-09-12, Eric). Never 0DTE. Cut losers fast, trail once
// up ~10%+, close on goal / trail, and flatten before the close unless LEAPS:
//   1. HARD STOP −10% from entry. Thesis is wrong; get out.
//   2. NEVER buy 0–1 DTE. Window is 2–14 trading days. allow_0dte is dead.
//   3. FLEX before +10% — no trailing stop yet. Robust plays may use a 15% stop; nothing wider.
//   4. GAIN LOCK at +10% peak — never close below +0% (breakeven) once armed.
//   5. PROGRESSIVE TRAIL after lock (12 → 10 → 8 pts as peak grows). Soft take-profit goal 25%.
//   6. NO OVERNIGHT / NO WEEKEND on the swing fleet. Flatten in the close buffer. LEAPS only
//      may hold overnight (per-bot risk.hold_overnight=true).
//   7. Time-stop: 1 session for swings (same-day). LEAPS use their own horizon.

export type ExitBand = { tp: number; sl: number; trail: number };
export type ExitOpts = { zeroDte?: boolean; option?: boolean; flex?: boolean };

export const HARD_STOP_PCT = 10;     // cut losers here
export const FLEX_STOP_PCT = 15;      // robust / high-conviction setups only
export const ZERO_DTE_STOP_PCT = HARD_STOP_PCT;

export const GAIN_LOCK_ARM_PCT = 10;  // once the trade has been up this much…
export const GAIN_LOCK_FLOOR_PCT = 0; // …it may never close below this (breakeven lock)

export const RATCHET_0 = { at: 10, trail: 12 };
export const RATCHET_1 = { at: 40, trail: 10 };
export const RATCHET_2 = { at: 80, trail: 8 };

/** @deprecated use GAIN_LOCK_ARM_PCT — kept so older analysis copy still compiles */
export const BREAKEVEN_ARM_PCT = GAIN_LOCK_ARM_PCT;
export const BREAKEVEN_FLOOR_PCT = GAIN_LOCK_FLOOR_PCT;

export const MIN_ENTRY_DTE = 2;       // never buy 0–1 DTE — hard law, no exceptions
export const MAX_ENTRY_DTE = 14;      // up to ~3 trading weeks
export const MAX_HOLD_SESSIONS = 1;   // swings: same-day only (no overnight)

export function etDay(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

export function occExpiration(occ: string | null | undefined): string | null {
  const m = /^[A-Z]+(\d{2})(\d{2})(\d{2})[CP]\d{8}$/.exec(String(occ || '').toUpperCase());
  if (!m) return null;
  return `20${m[1]}-${m[2]}-${m[3]}`;
}

export function expirationIsZeroDte(expiration: string | null | undefined, today: string = etDay()): boolean {
  if (!expiration) return false;
  return String(expiration).slice(0, 10) <= today;
}

export function occIsZeroDte(occ: string | null | undefined, today: string = etDay()): boolean {
  return expirationIsZeroDte(occExpiration(occ), today);
}

/** Trading days from `today` (exclusive) to `expiration` (inclusive). Weekends skipped.
 *  Friday → Monday expiry is 1. Friday → Tuesday is 2. */
export function weekdayDte(expiration: string | null | undefined, today: string = etDay()): number {
  if (!expiration) return 0;
  const start = new Date(`${today}T12:00:00Z`);
  const end = new Date(`${String(expiration).slice(0, 10)}T12:00:00Z`);
  if (!(end.getTime() > start.getTime())) return 0;
  let n = 0;
  const d = new Date(start);
  while (d < end) {
    d.setUTCDate(d.getUTCDate() + 1);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) n++;
  }
  return n;
}

export function buyDteAllowed(dte: number, _allow0dte: boolean = false): { ok: boolean; detail: string } {
  // Eric 2026-09-12: NEVER 0DTE / 1DTE. The allow0dte arg is ignored (kept for call-site compat).
  if (dte < MIN_ENTRY_DTE) {
    return { ok: false, detail: `${dte} DTE blocked — never 0DTE/1DTE (window is ${MIN_ENTRY_DTE}–${MAX_ENTRY_DTE} trading days)` };
  }
  if (dte > MAX_ENTRY_DTE) {
    return { ok: false, detail: `${dte} DTE is past ${MAX_ENTRY_DTE} trading days (2–14 day window)` };
  }
  return { ok: true, detail: `${dte} DTE in ${MIN_ENTRY_DTE}–${MAX_ENTRY_DTE} window` };
}

/** Trail width in effect for a given peak gain. Off until the gain lock arms, then tightens. */
export function effectiveTrail(peakPct: number, baseTrail: number): number {
  if (baseTrail <= 0) return 0;
  if (peakPct < GAIN_LOCK_ARM_PCT) return 0;
  let cap = RATCHET_0.trail;
  if (peakPct >= RATCHET_2.at) cap = RATCHET_2.trail;
  else if (peakPct >= RATCHET_1.at) cap = RATCHET_1.trail;
  return Math.min(baseTrail, cap);
}

/** Effective stop %: options never hold past −10% (15% only when flex/robust). Equity uses the band. */
export function effectiveStop(bandSl: number, opts: boolean | ExitOpts = false): number {
  const o: ExitOpts = typeof opts === 'boolean' ? { zeroDte: opts } : (opts || {});
  const isOption = !!(o.option || o.zeroDte);
  if (!isOption) return bandSl > 0 ? bandSl : 0;
  const cap = o.zeroDte ? HARD_STOP_PCT : (o.flex ? FLEX_STOP_PCT : HARD_STOP_PCT);
  const want = bandSl > 0 ? bandSl : HARD_STOP_PCT;
  return Math.min(want, cap);
}

/** Exit decision for a LONG position. `fav` = current gain % vs entry, `peak` = max gain % seen.
 *  Returns the exit reason, or null to keep holding. Identical in backtest and live. */
export function exitReason(fav: number, peak: number, band: ExitBand, opts?: ExitOpts): string | null {
  if (band.tp > 0 && fav >= band.tp) return 'take-profit';
  const sl = effectiveStop(band.sl, opts);
  if (sl > 0 && fav <= -sl) return opts?.zeroDte ? 'stop-loss: 0dte' : 'stop-loss';
  if (peak >= GAIN_LOCK_ARM_PCT && fav <= GAIN_LOCK_FLOOR_PCT) return 'gain-lock';
  const t = effectiveTrail(peak, band.trail);
  if (t > 0 && peak > 0 && fav <= peak - t) return 'trailing-stop';
  return null;
}
