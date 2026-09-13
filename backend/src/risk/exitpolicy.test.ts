import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  exitReason, effectiveStop, effectiveTrail, expirationIsZeroDte, occIsZeroDte, occExpiration,
  weekdayDte, buyDteAllowed, HARD_STOP_PCT, FLEX_STOP_PCT, GAIN_LOCK_ARM_PCT, GAIN_LOCK_FLOOR_PCT,
} from './exitpolicy.js';
import { clampEntryDte, bandForDte, isLeapsBot, QUICK_DTES } from './swingprofile.js';

const opt = { option: true as const };
const band = { tp: 0, sl: 35, trail: 40 };

describe('OCC / weekday DTE', () => {
  it('parses OCC expiry and flags today as 0DTE', () => {
    assert.equal(occExpiration('SPY260911C00766000'), '2026-09-11');
    assert.equal(occIsZeroDte('SPY260911C00766000', '2026-09-11'), true);
    assert.equal(occIsZeroDte('SPY260914C00766000', '2026-09-11'), false);
    assert.equal(expirationIsZeroDte('2026-09-11', '2026-09-11'), true);
    assert.equal(expirationIsZeroDte('2026-09-14', '2026-09-11'), false);
  });

  it('counts weekday DTE (Friday to Monday is 1, to Tuesday is 2)', () => {
    assert.equal(weekdayDte('2026-09-14', '2026-09-11'), 1); // Fri → Mon
    assert.equal(weekdayDte('2026-09-15', '2026-09-11'), 2); // Fri → Tue
    assert.equal(weekdayDte('2026-09-25', '2026-09-11'), 10);
    assert.equal(weekdayDte('2026-09-11', '2026-09-11'), 0);
  });

  it('blocks buys outside 2–14 trading days; never 0DTE even with allow flag', () => {
    assert.equal(buyDteAllowed(0, false).ok, false);
    assert.equal(buyDteAllowed(1, false).ok, false);
    assert.equal(buyDteAllowed(1, true).ok, false); // allow_0dte ignored
    assert.equal(buyDteAllowed(0, true).ok, false);
    assert.equal(buyDteAllowed(2, false).ok, true);
    assert.equal(buyDteAllowed(10, false).ok, true);
    assert.equal(buyDteAllowed(14, false).ok, true);
    assert.equal(buyDteAllowed(15, false).ok, false);
  });
});

describe('hard stop −10%', () => {
  it('caps a 35% bot stop at −10% on options (and 0DTE)', () => {
    assert.equal(effectiveStop(35, { option: true }), HARD_STOP_PCT);
    assert.equal(effectiveStop(35, { zeroDte: true }), HARD_STOP_PCT);
    assert.equal(effectiveStop(8, { option: true }), 8);
    assert.equal(effectiveStop(0, { option: true }), HARD_STOP_PCT);
    assert.equal(effectiveStop(35, false), 35); // equity keeps its own stop
    assert.equal(effectiveStop(18, { option: true, flex: true }), FLEX_STOP_PCT);
  });

  it('cuts a swing loser at −10% even when the stored bot SL is 35', () => {
    assert.equal(exitReason(-10, 0, band, opt), 'stop-loss');
    assert.equal(exitReason(-9.9, 0, band, opt), null);
    assert.equal(exitReason(-10, 0, band, { zeroDte: true }), 'stop-loss: 0dte');
    assert.equal(exitReason(-35, 0, band), 'stop-loss'); // equity, no option flag
  });
});

describe('flex until +10%, then lock and ratchet', () => {
  it('does not trail before +10% peak', () => {
    assert.equal(effectiveTrail(9.9, 40), 0);
    assert.equal(exitReason(5, 8, band, opt), null); // up 5 after +8 peak: hold
    assert.equal(exitReason(-9, 5, band, opt), null); // still above the −10% cut
  });

  it('locks at breakeven once the trade has been up +10%', () => {
    assert.equal(exitReason(0, 10, band, opt), 'gain-lock');
    assert.equal(exitReason(-1, 15, band, opt), 'gain-lock');
    // At +22 peak the 12pt trail exits at +10; above that we hold
    assert.equal(exitReason(10.1, 22, band, opt), null);
  });

  it('trails 12pts after +10%, 10pts after +40%, 8pts after +80%', () => {
    assert.equal(effectiveTrail(10, 40), 12);
    assert.equal(effectiveTrail(40, 40), 10);
    assert.equal(effectiveTrail(80, 40), 8);
    assert.equal(exitReason(0, 12, band, opt), 'gain-lock'); // floor beats trail when fav<=0
    assert.equal(exitReason(30, 40, band, opt), 'trailing-stop'); // 40 − 10
    assert.equal(exitReason(72, 80, band, opt), 'trailing-stop'); // 80 − 8
    assert.equal(exitReason(73, 80, band, opt), null);
  });
});

describe('swing DTE bands', () => {
  it('snaps 1 DTE to 2 and keeps 14; robust plays get a 15% stop', () => {
    assert.equal(clampEntryDte(1), 2);
    assert.equal(clampEntryDte(6), 7);
    assert.equal(clampEntryDte(14), 14);
    assert.deepEqual(QUICK_DTES, [2, 3, 4, 5, 7, 10, 14]);
    assert.equal(bandForDte(7).sl, HARD_STOP_PCT);
    assert.equal(bandForDte(7).max_position_usd, 10000);
    assert.equal(bandForDte(2).max_position_usd, 2500);
    assert.equal(bandForDte(7, true).sl, FLEX_STOP_PCT);
    assert.equal(isLeapsBot({ expiration: '2027-03-19' }), true);
    assert.equal(isLeapsBot({ expiration: 'weekly' }), false);
  });
});
