# FOMC WINDOW — Fox desk addendum (Tue Sep 15 → Connect Sep 23–24, 2026)

> **PHONE TLDR:** Tue–Wed = FOMC blackout already on bots **9/10/80/81**. Decision **Wed 2:00 PM ET** + SEP/dots; Chair presser **2:30 PM ET**. Fox stays **flat/observe** through print — no new ORB/MR/G1, no 0DTE, shortest DTE quiet, LEAPS 30–32 observe. Focus names: **META / TSLA / QQQ** (+ SpaceX = TSLA *sentiment only*). Caps **$10k / 50% / 50%** hard under full_auto. Paper Alpaca only. Ulric owns Mag7/index TOMORROW-PLAN — this is Fox fold-in only. **No restart / no enables / no orders from this note.**

**Desk:** Fox (`grokbot-rh-trader` / fox-trader) · machine iEUGENE · paper Alpaca  
**Audience:** Ulric fold-in addendum — do **not** rewrite Mag7/index plan; override only where Fox names/bots diverge  
**Roles:** this pack = notes-only · Ulric = stack / Mag7 TOMORROW-PLAN  
**status:** READ-ONLY plan. Do not restart stack, enable bots, mutate settings, or place orders from this file.

**Confirmed calendar (verify federalreserve.gov / meta.com/connect if drift):**

| Event | When (ET unless noted) | Fox stance |
| --- | --- | --- |
| FOMC day 1 | **Tue Sep 15** | Blackout active; quiet / observe |
| FOMC decision + SEP + dots | **Wed Sep 16 · 2:00 PM ET** | Flat / observe through print + first reaction |
| Chair press conference | **Wed Sep 16 · 2:30 PM ET** | Still observe; no re-arm mid-presser |
| Meta Connect keynote | **Wed Sep 23 · ~4:00 PM PT** (livestream; confirm meta.com/connect) | Blackout; META primary |
| Meta Connect developer day | **Thu Sep 24** | Blackout; META residual / QQQ beta |

Blackout config (already in code default `event_blackout`): dates `2026-09-15`, `2026-09-16`, `2026-09-23`, `2026-09-24` · bot_ids **9 / 10 / 80 / 81** (ORB · Intraday MR · Idea G1) · no **NEW** entries; exits/monitors intentionally not gated.

---

## 0. Non-conflict with Ulric Mag7 / index TOMORROW-PLAN

| Ulric owns (do not duplicate / contradict) | Fox addendum owns |
| --- | --- |
| Mag7 / index session plan, SPY/IWM/NVDA/AAPL fleet narrative | **META · TSLA · QQQ** tape + options posture |
| Stack restart, bot enables, mode flips, killSwitch | Notes + checklist only |
| Broad index ORB/MR schedule outside Fox names | Fox blackout compliance for 9/10/80/81 |
| Account-level equity / BP targets | Fox concentration by **underlying** (META/TSLA/QQQ stack) |

If Ulric’s plan says “observe FOMC,” Fox agrees. If Ulric re-arms Mag7 post-print, Fox re-arms **only** after §3 criteria — Fox names can lag Mag7 by one session.

---

## 1. Pre-FOMC checklist (Mon close → Tue open → Wed pre-2pm)

Do these as **verify / note** steps. No bot toggles from this pack.

### A. Blackout + mode hygiene
- [ ] Confirm `event_blackout` still **enabled** and includes Sep 15–16 (+ later Connect 23–24).
- [ ] Confirm bots **9 / 10 / 80 / 81** cannot open **new** entries Tue/Wed (API or risk log: blackout why-string).
- [ ] Soft-flag remains **HARD** under `full_auto` (size + concentration vetoes fire — do not loosen for FOMC).
- [ ] Caps still **$10k position / 50% concentration / 50% daily-loss**.
- [ ] Paper only: `env=alpaca_paper` · `live=false` · killSwitch as Ulric left it (do not flip).

### B. Book / DTE hygiene (Fox names)
- [ ] **Never 0DTE.** Any OCC that rolls into 0–1 DTE into Wed print → prefer flat / ritual exit under Ulric ops, not hope-through-print.
- [ ] Swing book only **2–14 DTE** if anything is held; shortest DTE stays **quieted to observe**.
- [ ] **LEAPS 30–32** (and longer observe cards): **observe only** — may overnight; no click-to-enable from this note.
- [ ] Open-flat / re-arm ritual (from BOT-UPG-EVENT-REARM): at RTH open — inventory legacy short-DTE OCC on META/TSLA/QQQ → flatten ghosts → **do not** re-arm ORB/MR/G1 on blackout days.
- [ ] Concentration: sum **combined MV by underlying** across bots for META / TSLA / QQQ (not SPY-share alone). Nasdaq flush correlates puts/calls across these three.

### C. Learning / Muse (no stack touch)
- [ ] Learning **run 14 done** — do not force a mid-window learning tick; teach via chat / learning after the window (§5).
- [ ] Muse watcher = **stub** (`watch.available=false`) — treat Muse lamp gray/n/a; never green for “all clear into FOMC.”

### D. SpaceX-as-sentiment (not a symbol)
- [ ] No SpaceX listed equity on Fox desk. Use SpaceX / launch / Starlink headlines **only as TSLA risk-sentiment** (narrative beta), not as a tradeable underlier and not as an enable trigger.
- [ ] If SpaceX tape is hot while FOMC blackout is on → still **observe**; do not bypass 9/10/80/81 blackout for “TSLA news.”

---

## 2. During-print behavior (Wed ~1:45–3:30 PM ET)

**Default Fox posture: flat / observe.**

| Window | Behavior |
| --- | --- |
| Pre-2:00 (Tue all day + Wed morning) | No new ORB / Intraday MR / G1. Other Fox bots: prefer no new META/TSLA/QQQ swing entries into the print; LEAPS stay observe. |
| **2:00 PM ET** statement + SEP + dots | **No new entries.** Watch statement vs prior, median dots / 2026 path, and whether hike/hold language surprises consensus — **do not invent prices or bet the surprise in this note.** |
| **2:00–2:30** first spike | Flat/observe. Do not chase opening-range breaks on QQQ/META/TSLA. Exits/monitors may still run if already coded (blackout does not block exits). |
| **2:30+** Chair presser | Stay observe through Q&A volatility. No mid-presser re-arm. |
| Post-presser same session | Still blackout day for 9/10/80/81. Any discretionary swing must obey swing law + caps; default = wait for §3. |

**Explicit bans this window:** 0DTE · naked write · loosening soft-flag · enabling LEAPS from observe · using SpaceX headline as ORB permission · conflicting Mag7 “go” without Fox re-arm criteria.

---

## 3. Post-FOMC re-arm criteria (Fox-specific)

Re-arm is **Ulric/ops**, not this note. Fox suggests gate — all must be true:

1. **Calendar:** ET date is **after** `2026-09-16` (blackout day over for FOMC; Connect blackout still ahead for 23–24).
2. **Health:** `:8011` ok · paper · mode known · killSwitch known · soft-flag HARD still binding under full_auto.
3. **Book clean:** no ghost overnight short-DTE OCC on META/TSLA/QQQ; open book matches intended names.
4. **Risk alive:** recent risk_events still show concentration + naked-write vetoes capable of firing (not silently off).
5. **DTE policy:** new swings **2–14 DTE** only; shortest DTE still quiet/observe until explicitly unmuted; LEAPS 30–32 remain observe until click-to-enable.
6. **Name order (Fox):** prefer **QQQ** beta first (index proxy), then **META** / **TSLA** single-name — only if combined underlying conc allows under $10k/50%/50%.
7. **Do not re-arm 9/10/80/81 early** for Connect week; those ids stay blackout-bound on Sep 23–24 regardless of post-FOMC Mag7 green light.

If Mag7 re-arms Thu while Fox criteria 1–5 fail → Fox stays observe and logs why (fold into Wed learning review).

---

## 4. Catalyst map — META / TSLA / QQQ through Connect 23–24

No price targets. Catalyst → desk posture only.

### META
| Date / window | Catalyst | Fox posture |
| --- | --- | --- |
| Sep 15–16 | FOMC + SEP (rates / discount-rate for long-duration ad/AI spend narrative) | Blackout; observe. No pre-Connect ORB on META. |
| Sep 17–22 | Post-FOMC digest; pre-Connect positioning in street narrative | Swings only if §3 met; still **never 0DTE**; watch conc with QQQ. |
| **Sep 23** | **Meta Connect keynote** (~4 PM PT; confirm livestream) — AI / glasses / VR framing | Blackout bots 9/10/80/81. Flat/observe through keynote + AH. |
| **Sep 24** | Developer state of the union / sessions | Blackout. Residual headline risk; no MR fade of keynote gap without Ulric clear. |

### TSLA
| Date / window | Catalyst | Fox posture |
| --- | --- | --- |
| Sep 15–16 | FOMC (high-beta / duration / real-rate sensitivity) | Blackout for ORB/MR/G1; observe. |
| Whole window | **SpaceX-as-sentiment only** — launch / Starlink / private-market chatter as TSLA narrative beta | Log as sentiment; **do not** invent a SpaceX trade or bypass blackout. |
| Sep 17–22 | Post-FOMC high-beta digest | Re-arm only under §3; respect combined TSLA underlying conc (multi-bot stack risk from Mon book theme). |
| Sep 23–24 | Connect week = META-primary; TSLA secondary spill via Nasdaq beta (QQQ) | Do not treat Connect as a TSLA catalyst; keep SpaceX sentiment notes separate from META event risk. |

### QQQ
| Date / window | Catalyst | Fox posture |
| --- | --- | --- |
| Sep 15–16 | FOMC + SEP/dots = primary index-vol event for Nasdaq-100 | Flat/observe; QQQ is Fox’s index handle for this addendum (Ulric owns broader index plan). |
| Sep 17–22 | Vol crush or second-day trend after SEP | First candidate for cautious swing re-arm if §3 met (still 2–14 DTE). |
| Sep 23–24 | Connect spill into mega-cap tech ETF | Blackout for 9/10/80/81; expect META-led idiosyncratic + QQQ beta — do not double-count exposure (META options + QQQ options = same Nasdaq stress). |

---

## 5. Learning loop — after today (what to review Wed)

Teach via **chat / learning** (run 14 already done). After Wed session (post-presser or Thu AM), review — notes/RAG later, **no** forced learningTick from this pack:

1. **Blackout efficacy:** Did 9/10/80/81 show zero *new* entries Tue–Wed? Capture why-strings / veto codes.
2. **Short-DTE quiet:** Any accidental 0–1 DTE META/TSLA/QQQ risk into the print? Ritual gaps?
3. **Concentration under stress:** Combined underlying MV for META vs TSLA vs QQQ during the 2:00–3:30 ET window (marks move — score process, not one mark).
4. **SEP/dots narrative vs Fox names:** Qualitative only — did long-duration (META) / high-beta (TSLA) / Nasdaq (QQQ) move *together* or diverge? Feed chat teaching; no price invention.
5. **SpaceX sentiment diary:** 3–5 bullet headlines max — did TSLA track that tape or FOMC tape more?
6. **Muse stub reminder:** Confirm watch still n/a; do not treat gray Muse as risk-on.
7. **Connect prep ticket:** Rehearse same flat/observe checklist for Sep 23–24 before keynote (mirror this FOMC ritual).
8. **Fold-up for Ulric:** One short delta list — where Fox lagged or led Mag7 re-arm — for TOMORROW-PLAN continuity next week.

---

## 6. Risks

| Risk | Why it matters on Fox | Mitigation in this window |
| --- | --- | --- |
| Event ORB / MR false edge | FOMC open is not a normal opening range | Blackout 9/10/80/81; observe |
| Correlated Nasdaq book | META + TSLA + QQQ options look diversified until one vol spike | Combined underlying conc; caps 10k/50/50 HARD |
| Short-DTE burn into print | Mon theme: short-DTE + overnight ritual churn | Quiet shortest DTE; never 0DTE; ritual flat |
| Soft-flag regression | full_auto without hard size/conc | Keep soft-flag HARD; verify vetoes |
| Mag7 / Fox desync | Ulric goes green, Fox still dirty book | Fox §3 gates; may lag one session |
| SpaceX narrative FOMO | Headline ≠ listed underlier | Sentiment-only; no enable path |
| Connect after FOMC | Two blackout clusters in ~10 days | Same ritual; do not unmute 9/10/80/81 early |
| Muse false green | Stub always available=false | Never use Muse lamp as clear-to-trade |
| Live / RH bleed | Desk is paper Alpaca | Refuse live paths; paper only |
| This note mutating stack | Prior soft-flag / restart chaos | **No restart, no enables, no orders from this file** |

---

## 7. Explicit non-goals

- No Mag7/index plan rewrite (Ulric).
- No stack restart, bot enable/disable, settings UPDATE, killSwitch flip, or order placement.
- No invented prices, strikes, or “expected move” numbers.
- No LEAPS auto-fire; no 0DTE path; no naked write loosen.
- No SpaceX symbol enable.

---

## Scrub

No API keys, tokens, broker account IDs, equity/cash/BP, or live credentials. OCC strikes omitted. Safe to mirror scrubbed copy into `fox-trader/notes/desk/`.

**Companion refs (local):** `BOT-UPGRADES-2026-09-14.md` · `LEARNING-2026-09-14.md` · `MUSE-LEARN-PREP-2026-09-14.md` · `SESSION-2026-09-14.md` · `eventBlackout.ts` defaults.
