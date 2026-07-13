import { describe, expect, it } from 'vitest';
import { SEED_RECIPES } from './seedRecipes';
import { CATEGORIES } from './categories';

describe('seed recipes', () => {
  it('are well-formed', () => {
    const ids = new Set<string>();
    for (const r of SEED_RECIPES) {
      expect(ids.has(r.id)).toBe(false);
      ids.add(r.id);
      expect(CATEGORIES.some((c) => c.id === r.category)).toBe(true);
      expect(r.portions).toBeGreaterThan(0);
      expect(r.ingredients.length).toBeGreaterThanOrEqual(4);
      expect(r.steps.length).toBeGreaterThanOrEqual(3);
      expect(r.source).toBe('seed');
      for (const ing of r.ingredients) {
        expect(ing.name.length).toBeGreaterThan(0);
        if (ing.amount !== undefined) expect(ing.amount).toBeGreaterThan(0);
      }
    }
    expect(SEED_RECIPES.length).toBeGreaterThanOrEqual(6);
  });

  it('every category has at least one recipe', () => {
    for (const c of CATEGORIES) {
      expect(SEED_RECIPES.some((r) => r.category === c.id)).toBe(true);
    }
  });
});
