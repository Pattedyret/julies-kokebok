import { PageChrome, type PageSide } from '../book/PageChrome';
import { navigateTo } from '../book/spreads';
import {
  DoodleHeart,
  DoodleSparkles,
  DoodleSteam,
  DoodleStrawberry,
  DoodleWhisk,
  WashiTape,
} from '../components/Doodles';
import { CATEGORIES } from '../data/categories';
import type { CategoryId } from '../lib/types';
import { useRecipes } from '../state/RecipesContext';

const DOODLES: Record<CategoryId, React.ReactNode> = {
  frokost: <DoodleSteam size={46} />,
  middag: <DoodleWhisk size={56} />,
  bakst: <DoodleHeart size={40} />,
  smaretter: <DoodleStrawberry size={48} />,
  drikke: <DoodleSteam size={46} />,
};

export function CategoryDivider({ side, category }: { side: PageSide; category: CategoryId }) {
  const cat = CATEGORIES.find((c) => c.id === category)!;
  const { recipes } = useRecipes();
  const inCategory = recipes
    .filter((r) => r.category === category)
    .sort((a, b) => a.title.localeCompare(b.title, 'nb'));
  const wash = { backgroundColor: `color-mix(in srgb, ${cat.tabColor} 42%, #f9f4e8)` };

  const badge = (
    <div className="divider-hero">
      <span className="divider-badge" aria-hidden>
        {cat.emoji}
      </span>
      <h2 className="divider-title">{cat.label}</h2>
      <p className="divider-count">
        {inCategory.length} {inCategory.length === 1 ? 'oppskrift' : 'gode oppskrifter'}
      </p>
      <span className="divider-doodle">{DOODLES[category]}</span>
    </div>
  );

  const list = (
    <div className="divider-list">
      <WashiTape variant="blaa" style={{ top: 12, right: 28, transform: 'rotate(5deg)' }} />
      <h3 className="divider-list-heading">I dette kapittelet</h3>
      <ul className="toc-list">
        {inCategory.map((r) => (
          <li key={r.id}>
            <button type="button" className="toc-row" onClick={() => navigateTo(`oppskrift/${r.id}`)}>
              <span className="toc-title">
                {r.title}
                {r.source === 'julie' ? ' ✎' : ''}
              </span>
              <span className="toc-dots" aria-hidden />
              <span className="toc-page" aria-hidden>
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
      <DoodleSparkles className="divider-sparkle" size={40} />
    </div>
  );

  if (side === 'left') {
    return (
      <PageChrome side="left" lined={false} style={wash}>
        {badge}
      </PageChrome>
    );
  }
  if (side === 'right') {
    return (
      <PageChrome side="right" lined={false} style={wash}>
        {list}
      </PageChrome>
    );
  }
  return (
    <PageChrome side="single" lined={false} style={wash}>
      {badge}
      {list}
    </PageChrome>
  );
}
