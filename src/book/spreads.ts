import { CATEGORIES } from '../data/categories';
import type { CategoryId, Recipe } from '../lib/types';

export type Spread =
  | { kind: 'cover'; route: 'forside' }
  | { kind: 'dedication'; route: 'dedikasjon' }
  | { kind: 'toc'; route: 'innhold' }
  | { kind: 'divider'; route: `kategori/${CategoryId}`; category: CategoryId }
  | { kind: 'recipe'; route: `oppskrift/${string}`; recipe: Recipe }
  | { kind: 'handleliste'; route: 'handleliste' }
  | { kind: 'editor'; route: 'ny-oppskrift' }
  | { kind: 'about'; route: 'om' };

export function buildSpreads(recipes: Recipe[]): Spread[] {
  const spreads: Spread[] = [
    { kind: 'cover', route: 'forside' },
    { kind: 'dedication', route: 'dedikasjon' },
    { kind: 'toc', route: 'innhold' },
  ];
  for (const category of CATEGORIES) {
    spreads.push({ kind: 'divider', route: `kategori/${category.id}`, category: category.id });
    const inCategory = recipes
      .filter((r) => r.category === category.id)
      .sort((a, b) => a.title.localeCompare(b.title, 'nb'));
    for (const recipe of inCategory) {
      spreads.push({ kind: 'recipe', route: `oppskrift/${recipe.id}`, recipe });
    }
  }
  spreads.push({ kind: 'handleliste', route: 'handleliste' });
  spreads.push({ kind: 'editor', route: 'ny-oppskrift' });
  spreads.push({ kind: 'about', route: 'om' });
  return spreads;
}

export function routeToIndex(spreads: Spread[], hash: string): number {
  const route = hash.replace(/^#\/?/, '');
  const index = spreads.findIndex((s) => s.route === route);
  return index === -1 ? 0 : index;
}

export function navigateTo(route: string): void {
  location.hash = `/${route}`;
}
