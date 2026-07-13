import { describe, expect, it } from 'vitest';
import { buildBackup, parseBackup } from './backup';

const recipe = {
  id: 'x',
  title: 'X',
  category: 'middag',
  portions: 2,
  ingredients: [{ name: 'salt', scalable: false }],
  steps: ['gjør ting'],
  source: 'julie',
};

describe('parseBackup', () => {
  it('accepts v1 shape and bare arrays', () => {
    expect(parseBackup({ version: 1, recipes: [recipe] })).toEqual({
      recipes: [recipe],
      ratings: {},
      images: {},
    });
    expect(parseBackup([recipe])).toEqual({ recipes: [recipe], ratings: {}, images: {} });
  });

  it('accepts v2 with ratings and images', () => {
    const parsed = parseBackup({
      version: 2,
      recipes: [recipe],
      ratings: { x: 5 },
      images: { x: 'data:image/jpeg;base64,abc' },
    });
    expect(parsed?.ratings).toEqual({ x: 5 });
    expect(parsed?.images).toEqual({ x: 'data:image/jpeg;base64,abc' });
  });

  it('rejects invalid recipes', () => {
    expect(parseBackup({ version: 2, recipes: [{ id: 1 }] })).toBeNull();
    expect(parseBackup('nope')).toBeNull();
  });

  it('rejects present-but-invalid ratings or images', () => {
    expect(parseBackup({ version: 2, recipes: [recipe], ratings: { x: 9 } })).toBeNull();
    expect(parseBackup({ version: 2, recipes: [recipe], images: { x: 'http://evil' } })).toBeNull();
  });
});

describe('buildBackup', () => {
  it('round-trips through parseBackup', () => {
    const json = buildBackup([recipe] as never, { x: 4 }, { x: 'data:image/jpeg;base64,abc' });
    const parsed = parseBackup(JSON.parse(json));
    expect(parsed?.recipes).toEqual([recipe]);
    expect(parsed?.ratings).toEqual({ x: 4 });
    expect(parsed?.images).toEqual({ x: 'data:image/jpeg;base64,abc' });
  });
});
