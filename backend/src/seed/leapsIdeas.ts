/**
 * LEAPS / fundamental idea cards — paper observe desk.
 * Seeded from notes/desk/LEAPS-IDEAS-2026-09-12.md (public scrubbed).
 * Enable is intent-only: never places orders, never arms bots.
 */
export type LeapsIdeaStatus = 'observe' | 'enabled_observe';

export type LeapsIdea = {
  id: string;
  title: string;
  ticker: 'META' | 'TSLA' | 'QQQ';
  side: 'bull' | 'hedge' | 'defensive';
  thesis: string;
  expiryClass: string;
  strikeStyle: string;
  catalysts: string[];
  invalidation: string;
  riskNotes: string;
  warnings: string[];
  defaultStatus: LeapsIdeaStatus;
};

export const LEAPS_IDEAS_META = {
  pack: '2026-09-12',
  universe: ['META', 'TSLA', 'QQQ'] as const,
  law: 'never 0DTE · LEAPS 6–18m · cut −10% · trail +10%→BE · soft TP 25% · caps $10k / 50% / 50%',
  note: 'Strikes are style (ATM/OTM), not tickets. Refresh live chain before any real enable. No book strikes.',
};

export const LEAPS_IDEAS: LeapsIdea[] = [
  {
    id: 'IDEA-L1',
    title: 'META AI-ad ROI / Connect follow-through (bull LEAPS)',
    ticker: 'META',
    side: 'bull',
    thesis:
      'Ad AI (GEM / Advantage+) and business agents continue to lift conversion; Connect (Sep 23–24) advances glasses/Muse monetization; Q3 (~Oct 26 est.) shows FCF stabilization vs Q2 collapse. Market re-rates “capex tax” premium lower over 6–12m.',
    expiryClass: 'LEAPS 12–18m (e.g. Jan27–Jun27 class)',
    strikeStyle: 'Slight OTM calls (or ATM if IV crush post-FOMC preferred) — not deep lottery OTM',
    catalysts: [
      'Meta Connect keynote/glasses software',
      'Q3 revenue vs $61–64B guide',
      'Capex guide flattens into 2027',
      'Advantage+ / agent metrics',
    ],
    invalidation:
      'Capex guide raised again + FCF stays depressed; Connect hardware-light disappointment and Q3 miss on ads; legal charges recur at scale',
    riskNotes:
      'May overlap existing META LEAPS long / near-dated short-call hedge on private book — size as add-on only if Eric widens, else thesis twin (observe). Do not enable into FOMC without IV plan.',
    warnings: ['FOMC Sep 16 vol', 'META FCF/capex', 'Prefer one META bull LEAPS card later (L1 vs L2)'],
    defaultStatus: 'observe',
  },
  {
    id: 'IDEA-L2',
    title: 'META post-capex mean-reversion (bull, patience)',
    ticker: 'META',
    side: 'bull',
    thesis:
      'Fundamental cash engine (ads) intact; 2026 is peak spend year narrative. If management signals 2027 capex discipline after Connect/Q3, multiple expansion works on LEAPS horizon even without metaverse win.',
    expiryClass: 'LEAPS 9–15m',
    strikeStyle: 'ATM → 5–10% OTM calls; avoid weeklies',
    catalysts: [
      'Explicit FY27 capex color',
      'Opex efficiency after reductions',
      'AI ad ARPU disclosure quality',
    ],
    invalidation:
      'Reality Labs losses accelerate without glasses attach; regulatory/youth-safety cash hits; rates spike keeps duration multiples capped through 1H27',
    riskNotes: 'Same book overlap as L1. Prefer one META bull LEAPS card enabled later, not both.',
    warnings: ['FOMC Sep 16 vol', 'META FCF/capex', 'Critic should pick L1 vs L2'],
    defaultStatus: 'observe',
  },
  {
    id: 'IDEA-L3',
    title: 'TSLA Robotaxi / FSD monetization (bull LEAPS)',
    ticker: 'TSLA',
    side: 'bull',
    thesis:
      'Unsupervised miles + Cybercab Austin start + FSD attach compound into measurable autonomy revenue by mid-2027; Jun27 LEAPs capture that optionality.',
    expiryClass: 'LEAPS 9–18m (natural fit: Jun27 class)',
    strikeStyle: 'OTM calls toward narrative targets — treat existing watch LEAPS as observe, not a new ticket',
    catalysts: [
      'City expansion',
      'Robotaxi utilization',
      'FSD v15 safety narrative',
      'EU approvals',
      'Q3 earnings autonomy KPIs',
    ],
    invalidation:
      'NHTSA AQ26002 escalates to deployment limits; Q3 margin/FCF deteriorate without autonomy revenue; major FSD safety incident',
    riskNotes:
      'Valuation already prices a lot of success. SpaceX Flight 14 is sentiment only — not a TSLA fundamental. High IV → LEAPS debit risk if narrative stalls.',
    warnings: ['NHTSA Cybercab audit', 'High IV', 'No live prices in pack — refresh before enable'],
    defaultStatus: 'observe',
  },
  {
    id: 'IDEA-L4',
    title: 'TSLA energy + auto cash floor (bull / barbell context)',
    ticker: 'TSLA',
    side: 'bull',
    thesis:
      'Energy storage growth + delivery scale provide a cash/earnings floor while autonomy is audited; reduces all-or-nothing Robotaxi path dependency on a 12m LEAPS.',
    expiryClass: 'LEAPS 6–12m (shorter sleeve vs L3)',
    strikeStyle: 'ATM / slight OTM calls — less lottery than deep OTM autonomy bets',
    catalysts: ['Energy GWh prints', 'Auto margin stabilization on Q3', 'Quieter regulatory weeks'],
    invalidation: 'Auto demand cliff; energy growth stalls; concurrent NHTSA + earnings miss',
    riskNotes: 'Complements L3; if later enabled, Risk should pick one TSLA bull structure under 50% conc with META longs.',
    warnings: ['NHTSA Cybercab audit', 'Concentration vs META longs'],
    defaultStatus: 'observe',
  },
  {
    id: 'IDEA-L5',
    title: 'QQQ duration hedge / Nasdaq LEAPS (defensive observe)',
    ticker: 'QQQ',
    side: 'defensive',
    thesis:
      'If FOMC is “one hike and pause” and AI earnings hold into Oct, Nasdaq duration recovers; a QQQ LEAPS call is a cleaner beta expression than stacking more META/TSLA single-name risk.',
    expiryClass: 'LEAPS 6–12m',
    strikeStyle: 'ATM calls (beta tool) or slight OTM',
    catalysts: [
      'Sep 16 SEP dots not showing multi-hike path',
      '10y yields ease',
      'Mega-cap earnings cluster constructive',
    ],
    invalidation: 'Hawkish SEP + rising 10y; oil shock sticky; hyperscaler FCF scare broadens',
    riskNotes:
      'Overlaps beta with META/TSLA longs — concentration math must include delta-adjusted QQQ. Prefer as observe hedge alternative, not third concentrated long.',
    warnings: ['FOMC Sep 16 vol', 'Beta overlap with single-name LEAPS'],
    defaultStatus: 'observe',
  },
  {
    id: 'IDEA-L6',
    title: 'QQQ put LEAPS / protective sleeve (risk observe)',
    ticker: 'QQQ',
    side: 'hedge',
    thesis:
      'Desk already long mega-cap duration via META/TSLA LEAPs. A far-dated QQQ put LEAPS (or put debit) is a portfolio risk idea if hike cycle extends — observe for click-to-enable only if Eric wants explicit hedge UI.',
    expiryClass: 'LEAPS 6–12m',
    strikeStyle: 'OTM puts (hedge, not speculative short-QQQ lottery)',
    catalysts: ['Hawkish Warsh SEP', 'Sticky core PCE', 'Oil stickiness (secondary)'],
    invalidation: 'Clear dovish pivot; soft landing + AI earnings melt-up (hedge decays)',
    riskNotes: 'Hedge cost vs 25% soft TP on longs. Not a short-stock substitute. Paper caps still apply to debit.',
    warnings: ['Hedge cost', 'Paper caps $10k / 50% / 50%'],
    defaultStatus: 'observe',
  },
];
