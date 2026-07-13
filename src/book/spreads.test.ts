import { describe, expect, it } from 'vitest';
import { buildSpreads, routeToIndex } from './spreads';
import { SEED_RECIPES } from '../data/seedRecipes';

describe('buildSpreads', () => {
  const spreads = buildSpreads(SEED_RECIPES);

  it('starts cover, dedication, toc and ends handleliste, editor, about', () => {
    expect(spreads[0].kind).toBe('cover');
    expect(spreads[1].kind).toBe('dedication');
    expect(spreads[2].kind).toBe('toc');
    expect(spreads.at(-3)?.kind).toBe('handleliste');
    expect(spreads.at(-2)?.kind).toBe('editor');
    expect(spreads.at(-1)?.kind).toBe('about');
  });

  it('places each recipe after its category divider', () => {
    const iDivider = spreads.findIndex((s) => s.route === 'kategori/frokost');
    const iRecipe = spreads.findIndex((s) => s.route === 'oppskrift/pannekaker');
    expect(iDivider).toBeGreaterThan(-1);
    expect(iRecipe).toBeGreaterThan(iDivider);
  });

  it('sorts recipes alphabetically within a category', () => {
    const iHavregrot = spreads.findIndex((s) => s.route === 'oppskrift/havregrot');
    const iPannekaker = spreads.findIndex((s) => s.route === 'oppskrift/pannekaker');
    expect(iHavregrot).toBeLessThan(iPannekaker);
  });
});

describe('routeToIndex', () => {
  const spreads = buildSpreads(SEED_RECIPES);

  it('maps hash to index', () => {
    expect(routeToIndex(spreads, '#/innhold')).toBe(2);
    expect(routeToIndex(spreads, '#/oppskrift/finnes-ikke')).toBe(0);
    expect(routeToIndex(spreads, '')).toBe(0);
  });
});
