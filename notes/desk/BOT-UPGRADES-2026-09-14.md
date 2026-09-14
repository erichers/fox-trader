# Bot Upgrades — Mon Sep 14, 2026 (PT) — non-LEAPS fleet

> **PHONE TLDR:** Exactly **3** upgrades — (1) Event blackout + open flat/re-arm ritual for ORB/MR/G1 (2) Combined underlying concentration + MACD confirm-only (3) Exit lifecycle config bind (−10 / +10→BE / 25%) + veto telemetry. Iterate winners only. Paper. No enables.

**Scope:** non-LEAPS bots — Bollinger · G1 snapback · Intraday MR · EMA9/21 · MACD · Trend · ORB  
**Law:** never 0DTE · swing 2–14 DTE · cut −10% · trail +10%→BE · soft TP 25% · $10k / 50% conc / 50% daily-loss  
**Today themes:** short-DTE burn · high veto rate · overnight options sold→re-armed · soft-flag hotfix (size+conc HARD under full_auto) · PR#10 exit lifecycle  
**Roles:** Hypothesis / Code / Critic / Statistician / Risk  
**status:** design/observe notes only — **do not** enable bots, restart stack, place orders, or mutate DB/settings from this file.

---

## UPGRADE-1 — Event blackout + open flat/re-arm ritual

| Field | Content |
| --- | --- |
| **id** | `BOT-UPG-EVENT-REARM-2026-09-14` |
| **applies to** | **ORB** · **Intraday MR** · **G1 snapback** (primary). Bollinger secondary (skip new entries on blackout sessions). |
| **problem (today)** | Overnight options sold ~07:10 PT then re-armed ~07:22 PT under soft-flag→full_auto transition. Short-DTE / event opens are not “normal ORB.” FOMC Sep 15–16 and Connect Sep 23 keynote are known landmines. |
| **concrete change** | 1. Add `event_blackout` calendar bind: **no new entries** for ORB/MR/G1 on FOMC decision day and META Connect keynote day (±0 session hard; ±1 session soft for Bollinger). 2. Add `flat_or_rearm_ritual` checklist flag for any bot that can hold options overnight: at RTH open — **flatten legacy short-DTE OCC → re-arm only if mode/caps healthy → verify open book vs expected**. 3. Intraday MR: hard **flat by 15:45 ET** unless a separate overnight flag is on (LEAPS desk stays separate). |
| **Hypothesis** | Most Monday veto/churn and short-DTE burn came from treating event/open as normal mean-revert/ORB. |
| **Code** | Config keys: `event_blackout_dates[]`, `flat_by_et`, `require_open_ritual: true`. Emit diffs for **existing** bot IDs only — no new generators. |
| **Critic** | Short-DTE backtests that include FOMC open “wins” without blackout will keep lying. Ritual must not auto-place orders from this note — human/Ulric ops only when ready. |
| **Statistician** | Split expectancy: blackout days vs normal; day-after-FOMC G1 win-rate before any enable change. |
| **Risk** | Soft-flag HARD: if ritual runs while soft-flag open or enabled=0, **do not re-arm**. |
| **done when** | Paper logs show ORB/MR/G1 skipped FOMC/Connect; open book after ritual matches intended names; no ghost overnight OCC. |

---

## UPGRADE-2 — Combined underlying concentration + MACD confirm-only

| Field | Content |
| --- | --- |
| **id** | `BOT-UPG-CONC-MACD-2026-09-14` |
| **applies to** | **All full_auto** winners that share META/TSLA/QQQ/NVDA/SPY — especially **Trend** · **EMA9/21** · **MACD** · **Bollinger** · **G1**. |
| **problem (today)** | Risk events showed ~half vetoes on `max_position_usd` concentration while ~36 bots full_auto stacked the same underlyings. MACD + Trend + EMA can all lean the same name → soft warnings were insufficient (hotfix: size+conc HARD under full_auto). |
| **concrete change** | 1. Concentration guard must sum **combined MV / delta-adjusted exposure by underlying** across bots (not per-bot only; not SPY-share alone). 2. Promote **MACD to confirm-only**: may arm Trend/G1/Bollinger entries, **must not** place standalone full_auto entries. 3. Log one-line veto telemetry: `veto_code + bot_id + symbol + underlying_agg_mv` for RAG. |
| **Hypothesis** | Cutting MACD standalone + aggregating conc will drop correlated spam and false “diversification” across META/TSLA/QQQ. |
| **Code** | Risk service: `exposure_by_underlying` map before allow. Bot schema: `macd.role = "confirm_only"`. Keep naked-write / `no_short` vetoes — do not loosen. |
| **Critic** | If concentration only looks at SPY %, today’s TSLA/NVDA/IWM-heavy options book would look “fine” while stacking Nasdaq stress. Short-DTE multi-bot books lied about diversification. |
| **Statistician** | Before/after: veto rate on `max_position_usd`; count of same-underlying multi-bot allows per day. |
| **Risk** | Caps remain **$10k / 50% / 50% daily-loss**; soft-flag HARD under full_auto (size+conc bind). |
| **done when** | Paper day with ≥2 bots signaling same underlying shows single aggregated conc check; MACD has zero standalone entry orders; veto lines RAG-ready. |

---

## UPGRADE-3 — Exit lifecycle config bind + learning loop (PR#10 align)

| Field | Content |
| --- | --- |
| **id** | `BOT-UPG-EXIT-LIFECYCLE-2026-09-14` |
| **applies to** | **Trend Follower** · **EMA9/21** · **Bollinger** · any swing 2–14 DTE overlay later — align to PR#10 exit lifecycle on Mac (Ulric-owned merge; **do not pull/merge from this note**). |
| **problem (today)** | Cut-losers / ride-winners work is in flight (PR#10). Fleet still needs bot config schema to **explicitly** encode house exits so paper fills match law — not tribal knowledge. Learning pack already says soft-flag + veto patterns must prove caps bite every Monday. |
| **concrete change** | 1. Bot config schema fields (all swing bots): `stop_pct: -10`, `trail_arm_pct: +10`, `trail_lock: breakeven`, `soft_tp_pct: 25`. 2. On fill: arm trail watcher; on −10% mark → flatten; on +10% → move stop to BE; soft exit alert at +25% (not forced lottery hold). 3. Learning hook: append exit reason codes (`stop` / `trail_be` / `soft_tp` / `event_flat` / `ritual_flat`) into same veto/fill telemetry stream for RAG after Ulric restart notice. |
| **Hypothesis** | Explicit exits reduce “hold through −10% hoping” and match paper learning goals without new strategies. |
| **Code** | Config diff only on existing bot IDs; wire to PR#10 lifecycle once Ulric says merge/restart clear. **This note does not restart or enable.** |
| **Critic** | Backtests that used wide discretionary exits or ignored overnight marks inflated Trend/EMA expectancy. Soft TP 25% is soft — Statistician must report giveback after +25% if held. |
| **Statistician** | Distribution of exit reasons weekly; average MFE/MAE vs −10/+10/+25 bands on paper fills only. |
| **Risk** | Exit rules never disable daily-loss breaker. No 0DTE path even if lifecycle is “tight.” |
| **done when** | Schema present on Trend/EMA/Bollinger; paper fill shows trail BE after +10%; exit reason appears in logs; still no stack mutation from authors of this note. |

---

## Explicit non-goals

- No new named strategy generators (no strategy spam).
- No LEAPS auto-fire from ORB/MR/G1 (LEAPS stay observe cards).
- No RH live / agentic enable.
- No stack restart, bot enable, orders, DB/settings writes from this pack.

## Priority order

1. Prove caps still HARD under full_auto (prerequisite — already hotfixed; keep verifying).
2. Ship **UPGRADE-1** blackouts before Wed FOMC.
3. Ship **UPGRADE-2** conc aggregate + MACD confirm-only.
4. Align **UPGRADE-3** with Ulric PR#10 when merge/restart is clear.

**Scrub:** no API keys, tokens, broker IDs, account numbers, or secrets.
