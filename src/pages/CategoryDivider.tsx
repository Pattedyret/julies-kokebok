import { PageChrome, type PageSide } from '../book/PageChrome';
import { CATEGORIES } from '../data/categories';
import type { CategoryId } from '../lib/types';

export function CategoryDivider({ side, category }: { side: PageSide; category: CategoryId }) {
  const cat = CATEGORIES.find((c) => c.id === category);
  if (side === 'right') {
    return <PageChrome side="right" />;
  }
  return (
    <PageChrome side={side}>
      <h2>
        {cat?.emoji} {cat?.label}
      </h2>
    </PageChrome>
  );
}
