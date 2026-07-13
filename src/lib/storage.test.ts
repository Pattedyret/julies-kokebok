import { beforeEach, describe, expect, it } from 'vitest';
import { isRecipeArray, safeGet, safeSet } from './storage';

function mockStorage(overrides: Partial<Storage> = {}) {
  const map = new Map<string, string>();
  (globalThis as Record<string, unknown>).localStorage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
    ...overrides,
  } as Storage;
}

const validRecipe = {
  id: 'x',
  title: 'X',
  category: 'middag',
  portions: 2,
  ingredients: [{ name: 'salt', scalable: false }],
  steps: ['gjør ting'],
  source: 'julie',
};

describe('safeGet/safeSet', () => {
  beforeEach(() => mockStorage());

  it('round-trips validated values', () => {
    safeSet('k', [validRecipe]);
    expect(safeGet('k', isRecipeArray)).toEqual([validRecipe]);
  });
  it('returns undefined for corrupt JSON', () => {
    localStorage.setItem('k', '{nope');
    expect(safeGet('k', isRecipeArray)).toBeUndefined();
  });
  it('returns undefined when validation fails', () => {
    safeSet('k', [{ id: 1 }]);
    expect(safeGet('k', isRecipeArray)).toBeUndefined();
  });
  it('never throws when storage throws (private mode)', () => {
    mockStorage({
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      getItem: () => {
        throw new Error('SecurityError');
      },
    });
    expect(() => safeSet('k', [validRecipe])).not.toThrow();
    expect(safeGet('k', isRecipeArray)).toBeUndefined();
  });
});

describe('isRecipeArray', () => {
  it('accepts valid, rejects invalid', () => {
    expect(isRecipeArray([validRecipe])).toBe(true);
    expect(isRecipeArray([{ ...validRecipe, portions: 'fire' }])).toBe(false);
    expect(isRecipeArray([{ ...validRecipe, ingredients: [{ scalable: true }] }])).toBe(false);
    expect(isRecipeArray('nope')).toBe(false);
  });
});
