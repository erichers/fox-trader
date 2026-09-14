# LEAPS Strategies — Mon Sep 14, 2026 (PT)

> **PHONE TLDR:** 5 observe/paper LEAPS packs — (1) META Muse→Connect bull 12–18m (2) TSLA post-Cybercab reset 9–18m (3) QQQ duration/index 6–12m (4) QQQ/SPY put sleeve hedge 6–12m (5) MU memory/AI observe twin 9–15m. House: −10% cut · +10%→BE trail · soft TP 25% · ≤$10k · 50% conc. Beats today’s short-DTE burn via time + IV patience. **No enables / no tickets.**

**Mode:** paper Alpaca only · **status default = observe** · click-to-enable later  
**Law:** never 0DTE · swings 2–14 DTE separate · LEAPS may hold overnight/weekend  
**Universe bias:** Fox live META · TSLA · QQQ (+ SpaceX sentiment) · desk observe LEAPS also MU/QQQ/SPY  
**Today context:** short-DTE options burned / high veto rate; overnight options sold then re-armed; soft-flag hotfix; PR#10 exit lifecycle on Mac; fleet ~36 full_auto  
**Catalysts (do not invent prices):** FOMC Sep 15–16 · Meta Connect Sep 23–24 · Muse launched Sep 8 · Cybercab update underwhelmed early Sep + NHTSA AQ · SpaceX Nasdaq-100 weight rebalance later this month (QQQ flow)  
**LLM roles:** Hypothesis / Code / Critic / Statistician / Risk — Critic must stress how short-DTE backtests/live burned this week.

*Strikes = style only (ATM/OTM). Refresh live chain before any enable. No account equity, OCC tickets, or secrets in this file.*

---

## L-2026-09-14-A — META_MUSE_CONNECT_FOLLOWTHROUGH

| Field | Content |
| --- | --- |
| **id** | `LEAPS-META-MUSE-CONNECT-2026-09-14` |
| **name** | META Muse → Connect follow-through (bull LEAPS) |
| **thesis** | Muse (Sep 8) opened the personal-agent narrative; Connect keynote/dev days (Sep 23–24) are the next monetization/glasses/software proof point. Over 6–18m, ad-AI + agent attach can re-rate the “capex tax” if FCF stabilizes vs Q2 collapse — LEAPS capture that path without surviving every 2–7 DTE IV crush. |
| **underlyings** | **META** (primary). Optional beta context only: QQQ (do not double-size). |
| **DTE band** | **12–18 months** (prefer Jan–Jun 2027 LEAPS sleeve if enabling later) |
| **delta / entry rules** | Target **Δ ≈ 0.35–0.55** (ATM → ~5–10% OTM calls). Enter only after: (a) FOMC SEP settled ≥1 session, (b) Connect week IV rank not extreme lottery, (c) no hard conflict with near-dated META hedge on private watch book. Skip deep OTM lottery. |
| **exit** | Hard cut **−10%** of debit · trail arms at **+10%** with **breakeven lock** · soft TP **25%**. Optional thesis kill: Connect disappointment *and* next earnings miss on ads/FCF. |
| **sizing** | **≤ $10k** debit notional per enable. Count META LEAPS + any META short-DTE/equity toward **50% concentration**. Prefer **one** META bull LEAPS card enabled later (not A + prior L1/L2 twins). |
| **why beats short-DTE burn today** | Monday paper showed overnight short-dated options sold then re-armed under veto pressure. LEAPS keep theta slow, survive FOMC/Connect event crush better than 2–14 DTE, and do not need daily re-arm ritual. |
| **status** | **observe / paper-only** |
| **critic risks / invalidation** | Capex guide raised again + FCF stays depressed; Connect hardware-light *and* ad miss; legal/severance charges recur; soft-flag history shows full_auto can stack META across bots — Risk must hard-bind size+conc. **Critic:** short-DTE META call/put backtests that “won” on 1-day marks lied once overnight + event IV hit. |
| **Hypothesis** | Connect + Muse attach → multiple expansion by mid-2027. |
| **Statistician** | Track Connect ±5d IV change vs 12m LEAPS P&L path; do not score on single mark. |
| **Risk** | Event lock through FOMC decision day unless Eric explicitly unlocks. |

---

## L-2026-09-14-B — TSLA_POST_CYBERCAB_RESET

| Field | Content |
| --- | --- |
| **id** | `LEAPS-TSLA-AUTONOMY-RESET-2026-09-14` |
| **name** | TSLA post-Cybercab underwhelm / autonomy audit (bull LEAPS, patience) |
| **thesis** | Early-Sep Cybercab update underwhelmed + NHTSA audit query raised execution/regulatory discount. LEAPS thesis is *not* “buy the headline” — it is that measurable unsupervised miles / FSD attach / city expansion by mid-2027 still matter, and a reset window can improve entry *if* IV cools. SpaceX/Starship is **sentiment spillover only**, not TSLA fundamental. |
| **underlyings** | **TSLA** (primary). Sentiment context: SpaceX news may move TSLA; do not invent SPCX tickets. |
| **DTE band** | **9–18 months** (Jun 2027 class natural if still the desk LEAPS sleeve) |
| **delta / entry rules** | Prefer **Δ ≈ 0.40–0.55** ATM/slight OTM calls (less lottery than deep OTM autonomy bets). Entry gates: (1) ≥2 sessions after major autonomy/NHTSA headline spike, (2) no same-day ORB/MR short-DTE TSLA stack, (3) IV rank not in top decile unless debit sized half. |
| **exit** | **−10%** hard · **+10% → BE trail** · soft **25% TP**. Thesis kill: NHTSA escalates to deployment limits; major FSD safety incident; consecutive quarters with no autonomy KPI progress + margin cliff. |
| **sizing** | **≤ $10k**. Combined META+TSLA+QQQ LEAPS debit must respect **50% concentration** of paper book. If prior Jun27 TSLA LEAPS already on observe book, this card is a **thesis twin** — enable at most one. |
| **why beats short-DTE burn today** | TSLA short-DTE is gap/IV poison (Cybercab day ±1). LEAPS absorb headline noise; avoid the Monday sell→re-arm churn that burned short options overnight. |
| **status** | **observe / paper-only** |
| **critic risks / invalidation** | Valuation still prices success; underwhelm can persist; Terafab/SpaceX narrative confuses causal chain. **Critic:** any backtest that bought short-DTE TSLA calls into robotaxi events will look brilliant until the one day NHTSA/print gaps through the stop — LEAPS cut rules still mandatory, not “hold forever.” |
| **Hypothesis** | Autonomy KPI path survives audit discount by mid-2027. |
| **Code** | Map to existing LEAPS card JSON / observe flag only — no new generator bot. |
| **Risk** | Soft-flag HARD under full_auto: size+conc bind before any click-to-enable. |

---

## L-2026-09-14-C — QQQ_DURATION_INDEX_FLOW

| Field | Content |
| --- | --- |
| **id** | `LEAPS-QQQ-DURATION-2026-09-14` |
| **name** | QQQ duration / Nasdaq LEAPS (beta expression) |
| **thesis** | Cleaner beta than stacking more META/TSLA single-name risk. Post-FOMC SEP path + AI earnings cluster into Oct can support Nasdaq duration; SpaceX Nasdaq-100 weight rebalance later this month adds **mechanical QQQ flow** (passive adjust) — treat as flow context, not a SpaceX equity trade. |
| **underlyings** | **QQQ** (primary). Hedge-context OK: SPY / IWM already on desk — do not invent new tickers. |
| **DTE band** | **6–12 months** |
| **delta / entry rules** | **ATM → slight OTM calls**, target **Δ ≈ 0.45–0.60**. Enter after FOMC presser digested (≥1 session). Avoid ORB-day coincidence with Connect keynote. If SpaceX rebalance week is noisy, wait for index settle rather than chase. |
| **exit** | House exits: **−10% / +10%→BE / soft 25%**. Thesis kill: hawkish multi-hike SEP + rising real yields that keep duration multiples capped. |
| **sizing** | **≤ $10k**. Delta-adjust vs META/TSLA LEAPS — QQQ is not “diversified” if those are already long Nasdaq duration. Cap combined Nasdaq-beta LEAPS sleeve under 50% conc. |
| **why beats short-DTE burn today** | Desk’s short QQQ puts/calls needed open sell→re-arm; LEAPS avoid 0–few DTE theta and FOMC-day ORB false edges. Beta tool for paper learning without daily options churn. |
| **status** | **observe / paper-only** |
| **critic risks / invalidation** | Index rebalance can trim mega-caps *into* QQQ even as SPCX weight rises — single-day flow ≠ trend. Hyperscaler FCF scare broadens. **Critic:** short-DTE QQQ mean-revert bots looked fine until veto/conc + overnight mark — do not import that expectancy into LEAPS without new stats. |
| **Statistician** | Separate expectancy: post-FOMC 5d vs SpaceX-rebalance week vs normal weeks. |
| **Risk** | Prefer as **observe alternative** to third single-name long, not additive stack. |

---

## L-2026-09-14-D — QQQ_SPY_PUT_SLEEVE

| Field | Content |
| --- | --- |
| **id** | `LEAPS-QQQ-SPY-PUT-SLEEVE-2026-09-14` |
| **name** | QQQ/SPY put LEAPS protective sleeve |
| **thesis** | Desk duration bias (META/TSLA observe LEAPS + Nasdaq-heavy full_auto fleet) needs an explicit far-dated put sleeve if hike cycle extends or AI FCF scare hits. Hedge idea — not speculative short-Nasdaq lottery. |
| **underlyings** | **QQQ** primary put LEAPS; **SPY** alternate/hedge-context (already on desk). IWM only as existing-desk context, not a new invent. |
| **DTE band** | **6–12 months** |
| **delta / entry rules** | **OTM puts**, target **Δ ≈ −0.20 to −0.35** (protection, not lottery). Size as insurance debit. Do not pair with fresh short-DTE put speculation same day. |
| **exit** | Same house law on the **debit**: −10% / +10%→BE / soft 25%. If used as book hedge, Risk may allow hold through soft TP only when offsetting marked long LEAPS gains — document in enable modal. Thesis kill (hedge decays): clear dovish pivot + melt-up. |
| **sizing** | **≤ $10k** hedge debit. Counts toward concentration. Prefer **one** of QQQ or SPY put sleeve, not both at $10k. |
| **why beats short-DTE burn today** | Short put/call overnight book was sold this morning then re-armed — expensive theta + veto churn. Far-dated puts keep protection without daily ritual and without 0DTE. |
| **status** | **observe / paper-only** |
| **critic risks / invalidation** | Hedge cost vs 25% soft TP on longs; false safety if size too small vs stacked mega-cap delta. **Critic:** short-DTE puts that “hedged” for a day lied when overnight gap + re-arm missed the move — LEAPS hedge is about path, not one session. |
| **Risk** | Never treat as naked short; long put debit only. Soft-flag HARD on size. |

---

## L-2026-09-14-E — MU_MEMORY_AI_CAPACITY

| Field | Content |
| --- | --- |
| **id** | `LEAPS-MU-MEMORY-AI-2026-09-14` |
| **name** | MU memory / AI capacity (desk observe twin) |
| **thesis** | MU already sits on desk as an **observe LEAPS** name. Thesis: AI infra memory demand remains a multi-quarter capacity story; LEAPS express that without inventing off-desk tickers. Use only as satellite — Fox live focus stays META/TSLA/QQQ. |
| **underlyings** | **MU** (desk observe LEAPS). Beta context: QQQ/SPY. |
| **DTE band** | **9–15 months** |
| **delta / entry rules** | **Δ ≈ 0.35–0.50** slight OTM/ATM calls. Enter only if: no concurrent max_position veto storm on semi complex (NVDA options already active on paper book), and MU not used as short-DTE daytrade overlay. |
| **exit** | House: **−10% / +10%→BE / soft 25%**. Thesis kill: memory pricing collapse / capex pause narrative that hits semis broadly for >1 quarter. |
| **sizing** | **≤ $10k**. Lower priority than A–C; enable only if META/TSLA/QQQ LEAPS sleeve has room under 50% conc. |
| **why beats short-DTE burn today** | Semi names (NVDA etc.) dominated short-dated put/call churn today. MU LEAPS is observe learning — time horizon matches capacity cycle, not Monday re-arm. |
| **status** | **observe / paper-only** |
| **critic risks / invalidation** | Cyclical trap; correlation to NVDA/QQQ means “diversification” is cosmetic. **Critic:** do not justify from short-DTE semi scalps that vetoed on concentration — different product, different failure mode (gap + inventory). |
| **Hypothesis** | Memory tightness persists into 2027 capex plans. |
| **Code** | Wire to existing observe LEAPS bot/card for MU — iterate, don’t spawn a new strategy zoo. |

---

## Critic panel (shared — short-DTE burn lessons)

1. **Backtests lied:** short-DTE expectancy that ignored overnight gap, event IV (FOMC/Connect), and re-arm friction overstated edge. LEAPS packs must be scored on multi-week mark paths + rule adherence, not Monday fill count.
2. **Veto ≠ edge:** high `max_position_usd` / naked-write veto rate means the fleet wanted more risk than caps allow — LEAPS must not become a bypass; soft-flag HARD under full_auto.
3. **Correlation:** META + TSLA + QQQ + MU are one Nasdaq-duration bet in stress. Put sleeve (D) is the only explicit diversifier here.
4. **PR#10:** exit lifecycle (cut/trail/TP) must apply to LEAPS cards the same as swing bots when later enabled — observe until Ulric/Eric click.

## Enablement checklist (later — not now)

1. Hypothesis falsifiable + dated catalyst?
2. Critic: book conflict (META hedge vs long LEAPS; TSLA Jun27 twin)?
3. Statistician: event IV sized; no single-mark score?
4. Risk: −10 / +10→BE / 25% / $10k / 50% / 50% daily-loss?
5. Code: observe flag only; paper Alpaca; no RH live.

**FORBIDDEN in ops from this note:** stack restart · bot enable · orders · DB/settings mutation · secrets.

**Scrub:** no API keys, tokens, broker IDs, account equity, or live OCC strikes.
