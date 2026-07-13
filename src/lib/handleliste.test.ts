import { describe, expect, it } from 'vitest';
import type { Recipe } from './types';
import { addRecipeToList, buildShareText, clearChecked, mergeForShare, toggleItem } from './handleliste';

let n = 0;
const makeId = () => `id-${n++}`;

const vafler: Recipe = {
  id: 'vafler',
  title: 'Vafler',
  category: 'bakst',
  portions: 4,
  ingredients: [
    { amount: 3, unit: 'dl', name: 'melk', scalable: true },
    { amount: 2, unit: 'stk', name: 'egg', scalable: true },
    { name: 'kardemomme, etter smak', scalable: false },
  ],
  steps: ['visp', 'stek', 'spis'],
  source: 'seed',
};
const grot: Recipe = {
  id: 'grot',
  title: 'Grøt',
  category: 'frokost',
  portions: 2,
  ingredients: [{ amount: 4, unit: 'dl', name: 'Melk', scalable: true }],
  steps: ['kok', 'rør', 'server'],
  source: 'seed',
};

describe('addRecipeToList', () => {
  it('adds scaled amounts for the chosen portions', () => {
    const items = addRecipeToList([], vafler, 8, makeId);
    expect(items.find((i) => i.name === 'melk')?.amount).toBe(6);
    expect(items.find((i) => i.name === 'egg')?.amount).toBe(4);
  });
  it('keeps non-scalable items without amounts', () => {
    const items = addRecipeToList([], vafler, 8, makeId);
    const k = items.find((i) => i.name.startsWith('kardemomme'));
    expect(k).toBeDefined();
    expect(k?.amount).toBeUndefined();
  });
  it('re-adding same recipe sums amounts instead of duplicating lines', () => {
    const once = addRecipeToList([], vafler, 4, makeId);
    const twice = addRecipeToList(once, vafler, 4, makeId);
    const melk = twice.filter((i) => i.name === 'melk');
    expect(melk).toHaveLength(1);
    expect(melk[0].amount).toBe(6);
  });
});

describe('toggle and clear', () => {
  it('toggles by id and clears checked', () => {
    let items = addRecipeToList([], vafler, 4, makeId);
    const eggId = items.find((i) => i.name === 'egg')!.id;
    items = toggleItem(items, eggId);
    expect(items.find((i) => i.id === eggId)?.checked).toBe(true);
    items = clearChecked(items);
    expect(items.some((i) => i.name === 'egg')).toBe(false);
    expect(items.some((i) => i.name === 'melk')).toBe(true);
  });
});

describe('mergeForShare + buildShareText', () => {
  it('merges across recipes on name+unit, case-insensitive, unchecked only', () => {
    let items = addRecipeToList([], vafler, 4, makeId);
    items = addRecipeToList(items, grot, 2, makeId);
    const eggId = items.find((i) => i.name === 'egg')!.id;
    items = toggleItem(items, eggId);
    const merged = mergeForShare(items);
    expect(merged.find((l) => l.name.toLowerCase() === 'melk')?.amount).toBe(7);
    expect(merged.some((l) => l.name === 'egg')).toBe(false);
  });
  it('builds Norwegian share text', () => {
    const items = addRecipeToList([], grot, 2, makeId);
    expect(buildShareText(items)).toBe('Handleliste 🛒\n\n• 4 dl Melk');
  });
  it('formats fractions in share text', () => {
    const items = addRecipeToList([], grot, 1, makeId);
    expect(buildShareText(items)).toContain('• 2 dl Melk');
  });
});
