import { LeapsIdeas, EnableLeapsIdea, ObserveLeapsIdea } from '../api/client';
import { Card, Badge, useAsync } from '../components/ui';
import { Icon } from '../components/icons';

const SIDE_KIND: Record<string, string> = {
  bull: 'green',
  hedge: 'red',
  defensive: 'blue',
};

const STATUS_KIND: Record<string, string> = {
  observe: 'amber',
  enabled_observe: 'green',
};

export default function IdeasView() {
  const pack = useAsync<any>(LeapsIdeas, [], 0);
  const data = pack.data;
  const ideas = data?.ideas || [];
  const meta = data?.meta;

  const enable = async (id: string) => {
    await EnableLeapsIdea(id);
    pack.reload();
  };
  const observe = async (id: string) => {
    await ObserveLeapsIdea(id);
    pack.reload();
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <Card title={<span className="icon-btn"><Icon name="library" size={16} /> LEAPS Ideas — observe desk</span>}>
        <div className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>
          Click-to-enable records <b>intent only</b> (<code>enabled_observe</code>). It does <b>not</b> place orders,
          arm bots, or pull private book strikes. Universe: META · TSLA · QQQ. Pack {meta?.pack || '—'}.
        </div>
        {meta && (
          <div style={{ marginTop: 8, fontSize: 12 }} className="muted">
            <div><b>Swing law:</b> {meta.law}</div>
            <div style={{ marginTop: 4 }}>{meta.note}</div>
          </div>
        )}
      </Card>

      {pack.loading && !ideas.length && <Card><div className="muted">Loading ideas…</div></Card>}
      {pack.err && (
        <Card>
          <div className="red">Could not load ideas API — is the backend up on :8011?</div>
          <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>{String(pack.err)}</div>
        </Card>
      )}
      {!pack.loading && !pack.err && ideas.length === 0 && (
        <Card><div className="muted">No LEAPS cards seeded.</div></Card>
      )}

      {ideas.map((idea: any) => (
        <Card key={idea.id}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <b style={{ fontSize: 15 }}>{idea.id}</b>
                <Badge kind="gray">{idea.ticker}</Badge>
                <Badge kind={SIDE_KIND[idea.side] || 'gray'}>{idea.side}</Badge>
                <Badge kind={STATUS_KIND[idea.status] || 'gray'}>{idea.status}</Badge>
              </div>
              <div style={{ marginTop: 6, fontSize: 14 }}>{idea.title}</div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              {idea.status !== 'enabled_observe' ? (
                <button
                  className="primary"
                  onClick={() => enable(idea.id)}
                  title="Records enable intent only — no orders"
                >
                  Enable (observe)
                </button>
              ) : (
                <button onClick={() => observe(idea.id)} title="Clear enable intent">
                  Back to observe
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop: 10 }}>{idea.thesis}</div>

          <div className="grid cols-2" style={{ gap: 10, marginTop: 12, fontSize: 13 }}>
            <div>
              <div className="muted">Expiry class</div>
              <div>{idea.expiryClass}</div>
            </div>
            <div>
              <div className="muted">Strike style</div>
              <div>{idea.strikeStyle}</div>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 13 }}>
            <div className="muted"><b>Catalysts</b></div>
            <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
              {(idea.catalysts || []).map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(255,92,92,.08)', borderRadius: 8, border: '1px solid rgba(255,92,92,.25)', fontSize: 13 }}>
            <b className="red">Invalidation:</b> <span className="muted">{idea.invalidation}</span>
          </div>

          <div style={{ marginTop: 8, fontSize: 12 }} className="muted">
            <b>Risk:</b> {idea.riskNotes}
          </div>

          {(idea.warnings || []).length > 0 && (
            <div className="row" style={{ marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
              {(idea.warnings || []).map((w: string, i: number) => (
                <Badge key={i} kind="amber">{w}</Badge>
              ))}
            </div>
          )}

          {idea.enabledAt && (
            <div className="muted" style={{ marginTop: 8, fontSize: 11 }}>
              Enable intent at {idea.enabledAt} — still observe only; no tickets.
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
