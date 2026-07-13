import { useState } from 'react';
import { PageChrome, type PageSide } from '../book/PageChrome';
import { DoodleHeart, DoodleSparkles, WashiTape } from '../components/Doodles';
import { buildShareText, type ListItem } from '../lib/handleliste';
import { formatAmount } from '../lib/scaling';
import { useHandleliste } from '../state/HandlelisteContext';

function itemLabel(item: ListItem): string {
  const qty =
    item.amount !== undefined
      ? `${formatAmount(item.amount)}${item.unit ? ` ${item.unit}` : ''} `
      : '';
  return `${qty}${item.name}`;
}

type ShareState = 'idle' | 'copied' | 'manual';

export function HandlelistePage({ side }: { side: PageSide }) {
  const { items, toggle, clearAll, clearChecked } = useHandleliste();
  const [shareState, setShareState] = useState<ShareState>('idle');
  const [confirmClear, setConfirmClear] = useState(false);

  const checkedCount = items.filter((i) => i.checked).length;

  // grupper per oppskrift, i innleggelses-rekkefølge
  const groups: Array<{ recipeId: string; title: string; rows: ListItem[] }> = [];
  for (const item of items) {
    const group = groups.find((g) => g.recipeId === item.recipeId);
    if (group) group.rows.push(item);
    else groups.push({ recipeId: item.recipeId, title: item.recipeTitle, rows: [item] });
  }

  const share = async () => {
    const text = buildShareText(items);
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        // ellers: fall videre til utklippstavle
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareState('copied');
      window.setTimeout(() => setShareState('idle'), 2200);
    } catch {
      setShareState('manual');
    }
  };

  const list = (
    <div className="hl-list">
      <h2>Handleliste</h2>
      {groups.length === 0 && (
        <div className="hl-empty">
          <DoodleHeart size={40} style={{ color: 'var(--accent-soft)' }} />
          <p>
            Handlelista er tom —<br />
            bla i boka og legg til noe godt!
          </p>
        </div>
      )}
      {groups.map((g) => (
        <section key={g.recipeId} className="hl-group">
          <h3 className="hl-group-title">{g.title}</h3>
          <ul className="hl-rows">
            {g.rows.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`check-row${item.checked ? ' checked' : ''}`}
                  aria-pressed={item.checked}
                  onClick={() => toggle(item.id)}
                >
                  <span className="check-dot" aria-hidden />
                  <span className="check-text">{itemLabel(item)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );

  const actions = (
    <div className="hl-actions">
      <WashiTape variant="gronn" style={{ top: 8, right: 24, transform: 'rotate(5deg)' }} />
      <h3>Ta lista med deg</h3>
      <button type="button" className="washi-btn" onClick={share} disabled={items.length === 0}>
        {shareState === 'copied' ? 'Kopiert! Lim inn i Notater 📋' : 'Del listen 💌'}
      </button>
      {shareState === 'manual' && (
        <textarea
          className="hl-manual"
          readOnly
          value={buildShareText(items)}
          aria-label="Handleliste som tekst"
        />
      )}
      <div className="hl-small-actions">
        <button
          type="button"
          className="hl-link"
          onClick={() => clearChecked()}
          disabled={checkedCount === 0}
        >
          Fjern avkryssede ({checkedCount})
        </button>
        {!confirmClear ? (
          <button
            type="button"
            className="hl-link"
            onClick={() => setConfirmClear(true)}
            disabled={items.length === 0}
          >
            Tøm listen
          </button>
        ) : (
          <span className="hl-confirm">
            Sikker?{' '}
            <button
              type="button"
              className="hl-link hl-link-danger"
              onClick={() => {
                clearAll();
                setConfirmClear(false);
              }}
            >
              Ja
            </button>{' '}
            <button type="button" className="hl-link" onClick={() => setConfirmClear(false)}>
              Nei
            </button>
          </span>
        )}
      </div>
      <p className="hl-note">
        Avkryssede varer blir ikke med når du deler. Lista lagres på denne enheten.
      </p>
      <DoodleSparkles className="hl-sparkle" size={40} />
    </div>
  );

  if (side === 'left') return <PageChrome side="left">{list}</PageChrome>;
  if (side === 'right') return <PageChrome side="right">{actions}</PageChrome>;
  return (
    <PageChrome side="single">
      {list}
      <hr className="page-divider" />
      {actions}
    </PageChrome>
  );
}
