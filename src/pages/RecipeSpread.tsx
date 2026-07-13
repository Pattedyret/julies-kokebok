import { PageChrome, type PageSide } from '../book/PageChrome';
import type { Recipe } from '../lib/types';

export function RecipeSpread({ side, recipe }: { side: PageSide; recipe: Recipe }) {
  if (side === 'right') {
    return (
      <PageChrome side="right">
        <h3>Slik gjør du</h3>
      </PageChrome>
    );
  }
  return (
    <PageChrome side={side}>
      <h2>{recipe.title}</h2>
    </PageChrome>
  );
}
