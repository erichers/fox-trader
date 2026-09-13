#!/usr/bin/env bash
# Idempotent: insert Sep 12 scrubbed research into ulric_rhtrader.rag_documents (shared env=NULL).
# No secrets required beyond local MySQL. Does NOT enable bots or place orders.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-8889}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASSWORD:-root}"
DB_NAME="${DB_NAME:-ulric_rhtrader}"
PACK=2026-09-12
MYSQL=(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER")
if [[ -n "${DB_PASS}" ]]; then MYSQL+=(-p"$DB_PASS"); fi

INGEST="$ROOT/docs/rag/RAG-INGEST-2026-09-12.txt"
RESEARCH="$ROOT/docs/rag/RESEARCH-2026-09-12.md"
LEAPS="$ROOT/docs/rag/LEAPS-IDEAS-2026-09-12.md"
BOTS="$ROOT/docs/rag/BOT-IDEAS-2026-09-12.md"

python3 - "$DB_HOST" "$DB_PORT" "$DB_USER" "$DB_PASS" "$DB_NAME" "$PACK" "$INGEST" "$RESEARCH" "$LEAPS" "$BOTS" <<'PY'
import json, sys, subprocess
host, port, user, password, db, pack = sys.argv[1:7]
paths = {
  'ingest': sys.argv[7],
  'research': sys.argv[8],
  'leaps': sys.argv[9],
  'bots': sys.argv[10],
}
titles = {
  'ingest': f'Fox desk research pack {pack}',
  'research': f'Fox desk RESEARCH {pack}',
  'leaps': f'Fox desk LEAPS ideas {pack}',
  'bots': f'Fox desk BOT ideas {pack}',
}

def mysql(sql: str) -> str:
    cmd = ['mysql', f'-h{host}', f'-P{port}', f'-u{user}', db, '-N', '-e', sql]
    if password:
        cmd.insert(4, f'-p{password}')
    return subprocess.check_output(cmd, text=True)

inserted = 0
skipped = 0
for key, path in paths.items():
    with open(path, 'r', encoding='utf-8') as f:
        body = f.read()
    title = titles[key]
    # skip if same pack+title already present
    check = mysql(f"SELECT COUNT(*) FROM rag_documents WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata,'$.pack'))='{pack}' AND JSON_UNQUOTE(JSON_EXTRACT(metadata,'$.title'))='{title.replace(chr(39), chr(39)+chr(39))}'")
    if int(check.strip() or '0') > 0:
        print(f'skip existing: {title}')
        skipped += 1
        continue
    doc_text = f"{title}\n{body}"
    # escape for SQL: use hex / prepared via python mysql if available — fall back to escaped string
    meta = json.dumps({
        'kind': 'research',
        'title': title,
        'pack': pack,
        'source': 'fox-trader/docs/rag',
        'file': path.split('/')[-1],
        'universe': ['META', 'TSLA', 'QQQ'],
    })
    # Write via temp file + LOAD to avoid shell escaping issues
    import tempfile, os
    with tempfile.NamedTemporaryFile('w', delete=False, encoding='utf-8') as tf:
        # tab-separated: source_table, doc_text, metadata_json
        # Use REPLACE for newlines in LOAD? Better INSERT via Python connector if present.
        tf_path = tf.name
        # store as JSON lines for the helper
        json.dump({'source_table': 'research', 'doc_text': doc_text, 'metadata': meta, 'env': None}, tf)
    try:
        # Prefer PyMySQL / mysql.connector; else mysql CLI with escaped literals
        try:
            import pymysql
            conn = pymysql.connect(host=host, port=int(port), user=user, password=password or '', database=db, charset='utf8mb4')
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO rag_documents (source_table, source_id, doc_text, metadata, env) VALUES (%s, NULL, %s, CAST(%s AS JSON), NULL)",
                ('research', doc_text, meta),
            )
            conn.commit()
            cur.close(); conn.close()
        except ImportError:
            # escape single quotes for CLI
            esc_txt = doc_text.replace('\\', '\\\\').replace("'", "''")
            esc_meta = meta.replace('\\', '\\\\').replace("'", "''")
            mysql(
                "INSERT INTO rag_documents (source_table, source_id, doc_text, metadata, env) "
                f"VALUES ('research', NULL, '{esc_txt}', CAST('{esc_meta}' AS JSON), NULL)"
            )
        print(f'inserted: {title}')
        inserted += 1
    finally:
        os.unlink(tf_path)

print(f'DONE inserted={inserted} skipped={skipped}')
PY
