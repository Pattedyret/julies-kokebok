import type { Ingredient, Recipe } from './types';

export const KEYS = {
  recipes: 'julies-kokebok:v1:recipes',
  handleliste: 'julies-kokebok:v1:handleliste',
} as const;

export function safeGet<T>(key: string, validate: (v: unknown) => v is T): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return undefined;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* privat modus / full kvote — appen fortsetter i minnet */
  }
}

const CATEGORY_IDS = ['frokost', 'middag', 'bakst', 'smaretter', 'drikke'];

function isIngredient(v: unknown): v is Ingredient {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.name === 'string' &&
    o.name.length > 0 &&
    typeof o.scalable === 'boolean' &&
    (o.amount === undefined || typeof o.amount === 'number') &&
    (o.unit === undefined || typeof o.unit === 'string')
  );
}

export function isRecipe(v: unknown): v is Recipe {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.title === 'string' &&
    o.title.length > 0 &&
    CATEGORY_IDS.includes(o.category as string) &&
    typeof o.portions === 'number' &&
    o.portions > 0 &&
    Array.isArray(o.ingredients) &&
    o.ingredients.every(isIngredient) &&
    Array.isArray(o.steps) &&
    o.steps.every((s) => typeof s === 'string') &&
    (o.note === undefined || typeof o.note === 'string') &&
    (o.source === 'seed' || o.source === 'julie')
  );
}

export function isRecipeArray(v: unknown): v is Recipe[] {
  return Array.isArray(v) && v.every(isRecipe);
}
