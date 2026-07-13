const FRACTIONS: Array<[number, string]> = [
  [0.25, '¼'],
  [0.5, '½'],
  [0.75, '¾'],
];
const GLYPHS: Record<string, number> = { '¼': 0.25, '½': 0.5, '¾': 0.75 };
const EPS = 0.02;

export function scaleAmount(amount: number, basePortions: number, targetPortions: number): number {
  return (amount * targetPortions) / basePortions;
}

export function formatAmount(value: number): string {
  const whole = Math.floor(value + 1e-9);
  const frac = value - whole;
  if (frac < EPS || frac > 1 - EPS) {
    return String(Math.round(value));
  }
  for (const [f, glyph] of FRACTIONS) {
    if (Math.abs(frac - f) < EPS) {
      return whole === 0 ? glyph : `${whole}${glyph}`;
    }
  }
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',');
}

export function parseAmount(input: string): number | undefined {
  const s = input.trim().replace(',', '.');
  if (!s) return undefined;
  const m = s.match(/^(\d+(?:\.\d+)?)?\s*(?:(\d+)\s*\/\s*(\d+)|([¼½¾]))?$/);
  if (!m || (m[1] === undefined && m[2] === undefined && m[4] === undefined)) return undefined;
  let value = m[1] ? Number(m[1]) : 0;
  if (m[2] && m[3] && Number(m[3]) !== 0) value += Number(m[2]) / Number(m[3]);
  if (m[4]) value += GLYPHS[m[4]];
  return value > 0 ? value : undefined;
}
