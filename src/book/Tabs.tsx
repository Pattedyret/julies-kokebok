import { CATEGORIES } from '../data/categories';
import type { CategoryId } from '../lib/types';
import { navigateTo, type Spread } from './spreads';

function activeCategory(spread: Spread | undefined): CategoryId | undefined {
  if (!spread) return undefined;
  if (spread.kind === 'divider') return spread.category;
  if (spread.kind === 'recipe') return spread.recipe.category;
  return undefined;
}

export function Tabs({ spreads, activeIdx }: { spreads: Spread[]; activeIdx: number }) {
  const active = spreads[activeIdx];
  const activeCat = activeCategory(active);

  return (
    <nav className="tabs" aria-label="Kapitler">
      <button
        type="button"
        className={`tab tab-innhold${active?.kind === 'toc' ? ' active' : ''}`}
        onClick={() => navigateTo('innhold')}
        aria-label="Innholdsfortegnelse"
      >
        <span className="tab-emoji" aria-hidden>
          ♥
        </span>
        <span className="tab-label">Innhold</span>
      </button>
      {CATEGORIES.map((c) => (
        <button
          type="button"
          key={c.id}
          className={`tab${activeCat === c.id ? ' active' : ''}`}
          style={{ backgroundColor: c.tabColor }}
          onClick={() => navigateTo(`kategori/${c.id}`)}
        >
          <span className="tab-emoji" aria-hidden>
            {c.emoji}
          </span>
          <span className="tab-label">{c.label}</span>
        </button>
      ))}
      <button
        type="button"
        className={`tab tab-handleliste${active?.kind === 'handleliste' ? ' active' : ''}`}
        onClick={() => navigateTo('handleliste')}
      >
        <span className="tab-emoji" aria-hidden>
          🛒
        </span>
        <span className="tab-label">Handleliste</span>
      </button>
    </nav>
  );
}
