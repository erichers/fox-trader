# fox-trader setup

Paper trading desk for **Fox · Trading**. Public clone of the Mac paper desk — no secrets in this repo.

## Mac path (reference checkout)

On the author’s Mac the working paper desk lives under Sites (example):

```text
…/Sites/grokbot/grokbot-rh-trader   # live paper desk (local secrets)
…/Sites/grokbot/Fox/fox-trader      # this public mirror
```

You can clone anywhere:

```bash
git clone https://github.com/erichers/fox-trader.git
cd fox-trader
```

## Ports

| Service | Port | Notes |
| --- | --- | --- |
| Backend API + UI | `8011` | `http://127.0.0.1:8011/` |
| Optional Apache (MAMP) | `8888` | proxies to the backend under `BASE_PATH` |
| MySQL (MAMP default) | `8889` | or any MySQL 5.7+/8 you already run |

## Caps triad (Fox desk)

| Cap | Value |
| --- | --- |
| Max position | `$10,000` |
| Max portfolio concentration | `50%` |
| Max daily loss | `50%` |

Also: never 0DTE; swing 2–14 DTE; cut losers −10%; trail +10% with breakeven lock; soft TP 25%. Soft risk flags in the UI are advisory — the hard caps above still bind.

## Trading environment

- Default: **`alpaca_paper`** only until you explicitly flip in the app (confirm required).
- Mode for watched paper sessions: **`full_auto`** (bots may open within guardrails). Start in `observe` if you are new.
- Monday watch: leave the desk up over the weekend in paper, review journal Monday before trusting `full_auto` sizing.

## Run without secrets in git

1. Prerequisites: Node 22+, npm, MySQL 5.7+/8, git.
2. Install:

   ```bash
   (cd backend && npm install)
   (cd frontend && npm install)
   ```

3. Database:

   ```bash
   mysql -h 127.0.0.1 -P 3306 -u root -p < db/schema.sql
   # MAMP example: port 8889, user/password as you configured locally
   ```

4. Config (local only):

   ```bash
   cp .env.example .env
   # Fill ALPACA_API_KEY / ALPACA_SECRET_KEY from Alpaca Paper Trading.
   # Optional: ANTHROPIC_API_KEY and other LLM keys.
   # Never commit .env or backend/data/oauth-tokens.json.
   ```

5. Start:

   ```bash
   ./scripts/desk-up.sh          # Mac one-shot: build, start, optional MAMP, open browser
   # or
   ./scripts/start.sh --build
   ./scripts/health.sh
   ```

6. Open `http://127.0.0.1:8011/` (or the Apache URL on `:8888` if you use MAMP).

## Screenshots

See [`docs/screenshots/`](screenshots/) for desk UI shots (home, bots, observe filter). They are UI chrome only — do not paste live account numbers into docs.

## Safety

- Keys, OAuth token stores, DB dumps, and personal notes are gitignored.
- Crypto is hard-blocked.
- Kill switch (`KILL_SWITCH=true`) blocks all order placement.
- This is not financial advice; paper first.
