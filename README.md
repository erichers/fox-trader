# fox-trader

Paper trading desk for Fox · Trading.

- Alpaca paper only until explicitly flipped
- Caps: `$10k` max position / `50%` concentration / `50%` daily-loss
- Swing: never 0DTE; 2–14 DTE; cut losers −10%; trail +10% with breakeven lock; soft TP 25%; no overnight/weekend except LEAPS (observe)
- Mode: `full_auto` for watched paper sessions
- Keys, broker auth, and personal account files stay gitignored — never commit them

Replaces `erichers/rh-trader` as the Fox desk home going forward.
