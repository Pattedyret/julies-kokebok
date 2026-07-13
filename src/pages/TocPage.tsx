import { useMemo } from 'react';
import { PageChrome, type PageSide } from '../book/PageChrome';
import { buildSpreads, navigateTo } from '../book/spreads';
import { DoodleSparkles, DoodleWhisk, WashiTape } from '../components/Doodles';
import { CATEGORIES } from '../data/categories';
import { useRatings } from '../state/RatingsContext';
import { useRecipes } from '../state/RecipesContext';

export function TocPage({ side }: { side: PageSide }) {
  const { recipes } = useRecipes();
  const { ratings } = useRatings();
  const spreads = useMemo(() => buildSpreads(recipes), [recipes]);

  if (side === 'right') {
    return (
      <PageChrome side="right">
        <div className="toc-right">
          <DoodleWhisk className="toc-doodle-whisk" size={64} />
          <DoodleSparkles className="toc-doodle-sparkle" size={46} />
          <p className="toc-tip">
            bla med pilene, hjørnene
            <br />
            eller fanene i kanten →
          </p>
        </div>
      </PageChrome>
    );
  }

  return (
    <PageChrome side={side}>
      <WashiTape variant="gul" style={{ top: 10, right: 30, transform: 'rotate(4deg)' }} />
      <h2>Innhold</h2>
      {CATEGORIES.map((cat) => {
        const items = spreads
          .map((s, i) => ({ s, i }))
          .filter(({ s }) => s.kind === 'recipe' && s.recipe.category === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="toc-cat">
            <h3 className="toc-cat-label">
              <mark style={{ backgroundColor: cat.tabColor }}>{cat.label}</mark>
            </h3>
            <ul className="toc-list">
              {items.map(
                ({ s, i }) =>
                  s.kind === 'recipe' && (
                    <li key={s.route}>
                      <button type="button" className="toc-row" onClick={() => navigateTo(s.route)}>
                        <span className="toc-title">
                          {s.recipe.title}
                          {s.recipe.source === 'julie' ? ' ✎' : ''}
                        </span>
                        {(ratings[s.recipe.id] ?? 0) > 0 && (
                          <span
                            className="toc-hearts"
                            aria-label={`${ratings[s.recipe.id]} av 5 hjerter`}
                          >
                            {'♥'.repeat(ratings[s.recipe.id])}
                          </span>
                        )}
                        <span className="toc-dots" aria-hidden />
                        <span className="toc-page">{i + 1}</span>
                      </button>
                    </li>
                  ),
              )}
            </ul>
          </section>
        );
      })}
      <button type="button" className="toc-row toc-extra" onClick={() => navigateTo('ny-oppskrift')}>
        + legg til din egen oppskrift
      </button>
    </PageChrome>
  );
}
