import { isRatingsMap, isRecipeArray } from './storage';
import type { Recipe } from './types';

export type Backup = {
  recipes: Recipe[];
  ratings: Record<string, number>;
  images: Record<string, string>;
};

function isImagesMap(v: unknown): v is Record<string, string> {
  return (
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    Object.values(v).every((s) => typeof s === 'string' && s.startsWith('data:image'))
  );
}

/**
 * Godtar v1 ({version:1, recipes}), bare oppskrift-arrays, og v2 med
 * ratings + images. Streng: en seksjon som finnes men ikke validerer → null.
 */
export function parseBackup(data: unknown): Backup | null {
  if (Array.isArray(data)) {
    return isRecipeArray(data) ? { recipes: data, ratings: {}, images: {} } : null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const o = data as Record<string, unknown>;
  if (!isRecipeArray(o.recipes)) return null;
  let ratings: Record<string, number> = {};
  if (o.ratings !== undefined) {
    if (!isRatingsMap(o.ratings)) return null;
    ratings = o.ratings;
  }
  let images: Record<string, string> = {};
  if (o.images !== undefined) {
    if (!isImagesMap(o.images)) return null;
    images = o.images;
  }
  return { recipes: o.recipes, ratings, images };
}

export function buildBackup(
  recipes: Recipe[],
  ratings: Record<string, number>,
  images: Record<string, string>,
): string {
  return JSON.stringify({ version: 2, recipes, ratings, images }, null, 2);
}
