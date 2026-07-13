import { describe, expect, it } from 'vitest';
import { formatAmount, parseAmount, scaleAmount } from './scaling';

describe('scaleAmount', () => {
  it('scales linearly', () => {
    expect(scaleAmount(250, 4, 8)).toBe(500);
    expect(scaleAmount(3, 4, 2)).toBe(1.5);
    expect(scaleAmount(5, 4, 6)).toBeCloseTo(7.5);
  });
});

describe('formatAmount', () => {
  it('renders pretty fractions', () => {
    expect(formatAmount(0.5)).toBe('½');
    expect(formatAmount(0.25)).toBe('¼');
    expect(formatAmount(0.75)).toBe('¾');
    expect(formatAmount(1.5)).toBe('1½');
    expect(formatAmount(2.25)).toBe('2¼');
  });
  it('renders whole numbers plainly', () => {
    expect(formatAmount(2)).toBe('2');
    expect(formatAmount(500)).toBe('500');
  });
  it('rounds to one decimal with Norwegian comma', () => {
    expect(formatAmount(0.6)).toBe('0,6');
    expect(formatAmount(3.333)).toBe('3,3');
    expect(formatAmount(1.96)).toBe('2');
  });
});

describe('parseAmount', () => {
  it('accepts comma and dot decimals', () => {
    expect(parseAmount('1,5')).toBe(1.5);
    expect(parseAmount('1.5')).toBe(1.5);
    expect(parseAmount(' 250 ')).toBe(250);
  });
  it('accepts simple fractions', () => {
    expect(parseAmount('1/2')).toBe(0.5);
    expect(parseAmount('1 1/2')).toBe(1.5);
    expect(parseAmount('½')).toBe(0.5);
  });
  it('rejects junk', () => {
    expect(parseAmount('')).toBeUndefined();
    expect(parseAmount('abc')).toBeUndefined();
    expect(parseAmount('-2')).toBeUndefined();
  });
});
