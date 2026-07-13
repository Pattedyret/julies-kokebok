# Julies kokebok — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A cute notebook-styled cookbook SPA for Julie with page-flip navigation, portion scaling, a shareable handleliste, and an in-app recipe editor with JSON backup, deployed to GitHub Pages.

**Architecture:** Vite + React + TypeScript SPA, no backend. Pure-logic libs (scaling, handleliste, storage) are unit-tested with Vitest; UI is a "spread engine" (ordered list of book spreads derived from recipe data) rendered inside a Book shell with CSS-3D flip animations via framer-motion. All persistence is guarded localStorage.

**Tech Stack:** React 18, TypeScript, Vite, framer-motion, Vitest. Fonts: Caveat + Patrick Hand (Google Fonts). Deploy: GitHub Pages via Actions.

## Global Constraints

- All UI copy in Norwegian (bokmål). Decimal comma in rendered amounts («1,5 dl», never «1.5»).
- Handwriting fonts MUST render æøå — verify with test string «Blåbærsyltetøy & vafler, æøå ÆØÅ».
- localStorage keys: `julies-kokebok:v1:recipes`, `julies-kokebok:v1:handleliste`. Every localStorage access goes through `safeGet`/`safeSet` (try/catch, degrade to in-memory).
- Hash routing only (GitHub Pages has no SPA rewrites). Vite `base: '/julies-kokebok/'`.
- All animations respect `prefers-reduced-motion` (flips become crossfades).
- Seed recipes are read-only in the UI; only `source: 'julie'` recipes can be edited/deleted.
- One plain `tsconfig.json` including `src` — NOT solution-style (a solution-style root makes `tsc --noEmit` check zero files and go green on broken code).
- Commit after every task. Repo: `~/Documents/GitHub/julies-kokebok`, branch `main`, personal GitHub account (NOT TechVilmer).

## File Structure

```
index.html                      — fonts, manifest, mount point
vite.config.ts                  — base path, vitest config
tsconfig.json                   — single flat config
src/main.tsx, src/App.tsx       — bootstrap, providers, Book
src/styles/global.css           — css vars, paper texture, fonts
src/lib/types.ts                — Recipe, Ingredient, CategoryId
src/lib/scaling.ts(.test.ts)    — scaleAmount, formatAmount, parseAmount
src/lib/storage.ts(.test.ts)    — safeGet/safeSet, validators, KEYS
src/lib/handleliste.ts(.test.ts)— ListItem, addRecipeToList, mergeForShare, buildShareText
src/data/categories.ts          — 5 categories + tab colors
src/data/seedRecipes.ts         — 6 seed recipes
src/state/RecipesContext.tsx    — seeds + user recipes, add/update/remove
src/state/HandlelisteContext.tsx— list state, add/toggle/clear
src/book/spreads.ts(.test.ts)   — buildSpreads, routeToIndex (pure)
src/book/Book.tsx               — spread renderer + flip + hash sync
src/book/Tabs.tsx               — register tabs
src/book/PageChrome.tsx         — paper, ruled lines, decorations slot
src/pages/CoverPage.tsx, DedicationPage.tsx, TocPage.tsx,
    CategoryDivider.tsx, RecipeSpread.tsx, HandlelistePage.tsx,
    EditorPage.tsx, AboutPage.tsx
src/components/PortionStepper.tsx, HeartBurst.tsx, Doodles.tsx
public/manifest.webmanifest, public/icons/*
.github/workflows/deploy.yml
```

---

### Task 1: Scaffold + visual foundation

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/styles/global.css`, `src/vite-env.d.ts`

**Interfaces:**
- Produces: running dev server, `npm run build` / `npm test` / `npm run typecheck` scripts, CSS custom properties (`--paper`, `--ink`, `--accent`, fonts) used by all UI tasks.

- [ ] **Step 1: Write scaffold files by hand** (deterministic — `npm create vite` prompts interactively in a non-empty dir)

`package.json`:
```json
{
  "name": "julies-kokebok",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

Then: `npm i react react-dom framer-motion && npm i -D typescript vite @vitejs/plugin-react vitest @types/react @types/react-dom`

`vite.config.ts`:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/julies-kokebok/',
  plugins: [react()],
  test: { environment: 'node' },
});
```

`tsconfig.json` (single flat config — see Global Constraints):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

`index.html`: viewport meta, `<html lang="nb">`, `<title>Julies kokebok</title>`, Google Fonts link for `Caveat:wght@400..700` and `Patrick Hand`, `<div id="root">`, module script `/src/main.tsx`, `theme-color` meta `#f7f0e3`.

`src/styles/global.css` — foundation only (refined in Task 8):
```css
:root {
  --paper: #f9f4e8;
  --paper-shadow: #e8dfc9;
  --ink: #4a3f35;
  --ink-soft: #7a6d5f;
  --accent: #d96c7b;        /* rosa — hjerter, markeringer */
  --accent-soft: #f2c4cc;
  --line: #d9cdb4;          /* ruled lines */
  --font-hand: 'Caveat', cursive;
  --font-body: 'Patrick Hand', cursive;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--ink);
  background: #e9e0d0;      /* bordet boka ligger på */
  -webkit-font-smoothing: antialiased;
}
```

`src/App.tsx` renders a placeholder `<h1>Julies kokebok ♥</h1>` plus the æøå test string for now.

- [ ] **Step 2: Verify** — `npm run dev` renders placeholder with both fonts showing «Blåbærsyltetøy & vafler, æøå ÆØÅ» correctly (check in Playwright); `npm run build` green.

- [ ] **Step 3: Commit** — `chore: scaffold Vite + React + TS with notebook foundation`

---

### Task 2: Types, categories, seed recipes

**Files:**
- Create: `src/lib/types.ts`, `src/data/categories.ts`, `src/data/seedRecipes.ts`, `src/data/seedRecipes.test.ts`

**Interfaces:**
- Produces: `Recipe`, `Ingredient`, `CategoryId`, `CATEGORIES: Category[]`, `SEED_RECIPES: Recipe[]` — consumed by every later task.

- [ ] **Step 1: Write types**

`src/lib/types.ts`:
```ts
export type CategoryId = 'frokost' | 'middag' | 'bakst' | 'smaretter' | 'drikke';

export type Ingredient = {
  amount?: number;
  unit?: string;
  name: string;
  scalable: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  category: CategoryId;
  portions: number;
  ingredients: Ingredient[];
  steps: string[];
  note?: string;
  source: 'seed' | 'julie';
};
```

`src/data/categories.ts`:
```ts
import type { CategoryId } from '../lib/types';

export type Category = { id: CategoryId; label: string; tabColor: string; emoji: string };

export const CATEGORIES: Category[] = [
  { id: 'frokost',   label: 'Frokost',         tabColor: '#f2c4cc', emoji: '🥞' },
  { id: 'middag',    label: 'Middag',          tabColor: '#bcd9c0', emoji: '🍲' },
  { id: 'bakst',     label: 'Bakst & dessert', tabColor: '#f5d9a8', emoji: '🧁' },
  { id: 'smaretter', label: 'Småretter',       tabColor: '#c9d7ea', emoji: '🥪' },
  { id: 'drikke',    label: 'Drikke',          tabColor: '#e3c9ea', emoji: '☕' },
];
```

- [ ] **Step 2: Write 6 seed recipes** in `src/data/seedRecipes.ts` — real Norwegian recipes, one+ per category, ids as slugs, `source: 'seed'`. Full list: `pannekaker` (frokost, 4 porsjoner), `kremet-lakseform` (middag, 4), `sjokoladekake` (bakst, 12), `vafler` (bakst, 4), `focaccia` (smaretter, 8), `varm-sjokolade` (drikke, 2). Example shape (all six follow it, ≥4 ingredienser, ≥3 steg, minst én «etter smak»-ingrediens totalt):
```ts
import type { Recipe } from '../lib/types';

export const SEED_RECIPES: Recipe[] = [
  {
    id: 'pannekaker',
    title: 'Pannekaker',
    category: 'frokost',
    portions: 4,
    ingredients: [
      { amount: 3, unit: 'stk', name: 'egg', scalable: true },
      { amount: 5, unit: 'dl', name: 'melk', scalable: true },
      { amount: 250, unit: 'g', name: 'hvetemel', scalable: true },
      { amount: 0.5, unit: 'ts', name: 'salt', scalable: true },
      { amount: 2, unit: 'ss', name: 'smør, til steking', scalable: true },
    ],
    steps: [
      'Visp sammen egg og melk.',
      'Sikt inn mel og salt, og visp til en klumpfri røre.',
      'La røren svelle i 20 minutter.',
      'Stek gyldne pannekaker i smør på middels varme.',
    ],
    note: 'Best med blåbærsyltetøy ♥',
    source: 'seed',
  },
  // …5 til med samme form
];
```

- [ ] **Step 3: Write validation test** `src/data/seedRecipes.test.ts`:
```ts
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
});
```

- [ ] **Step 4: Run** `npm test` → PASS. **Commit** — `feat: data model, categories, seed recipes`

---

### Task 3: Scaling & amount formatting (TDD)

**Files:**
- Create: `src/lib/scaling.test.ts`, then `src/lib/scaling.ts`

**Interfaces:**
- Produces: `scaleAmount(amount, basePortions, targetPortions): number`, `formatAmount(value): string`, `parseAmount(input): number | undefined` — used by RecipeSpread, handleliste lib, EditorPage.

- [ ] **Step 1: Write failing tests** `src/lib/scaling.test.ts`:
```ts
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
```

- [ ] **Step 2: Run to verify fail** — `npm test` → FAIL (module not found).

- [ ] **Step 3: Implement** `src/lib/scaling.ts`:
```ts
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
```

- [ ] **Step 4: Run** `npm test` → PASS. **Commit** — `feat: portion scaling and Norwegian amount formatting`

---

### Task 4: Guarded storage (TDD)

**Files:**
- Create: `src/lib/storage.test.ts`, then `src/lib/storage.ts`

**Interfaces:**
- Produces: `KEYS`, `safeGet<T>(key, validate): T | undefined`, `safeSet(key, value): void`, `isRecipeArray(v): v is Recipe[]`, `isListItemArray(v): v is ListItem[]` (ListItem type arrives in Task 5 — storage validates structurally, so define `isListItemArray` there and re-export; in THIS task implement `KEYS`, `safeGet`, `safeSet`, `isRecipeArray`).

- [ ] **Step 1: Write failing tests** `src/lib/storage.test.ts` (localStorage mock included — vitest runs in node):
```ts
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
    get length() { return map.size; },
    ...overrides,
  } as Storage;
}

const validRecipe = {
  id: 'x', title: 'X', category: 'middag', portions: 2,
  ingredients: [{ name: 'salt', scalable: false }],
  steps: ['gjør ting'], source: 'julie',
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
      setItem: () => { throw new Error('QuotaExceededError'); },
      getItem: () => { throw new Error('SecurityError'); },
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
```

- [ ] **Step 2: Run to verify fail**, then **Step 3: Implement** `src/lib/storage.ts`:
```ts
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
    /* private mode / quota — app keeps working in memory */
  }
}

const CATEGORY_IDS = ['frokost', 'middag', 'bakst', 'smaretter', 'drikke'];

function isIngredient(v: unknown): v is Ingredient {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.name === 'string' && o.name.length > 0 &&
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
    typeof o.title === 'string' && o.title.length > 0 &&
    CATEGORY_IDS.includes(o.category as string) &&
    typeof o.portions === 'number' && o.portions > 0 &&
    Array.isArray(o.ingredients) && o.ingredients.every(isIngredient) &&
    Array.isArray(o.steps) && o.steps.every((s) => typeof s === 'string') &&
    (o.note === undefined || typeof o.note === 'string') &&
    (o.source === 'seed' || o.source === 'julie')
  );
}

export function isRecipeArray(v: unknown): v is Recipe[] {
  return Array.isArray(v) && v.every(isRecipe);
}
```

- [ ] **Step 4: Run** `npm test` → PASS. **Commit** — `feat: guarded localStorage layer with shape validation`

---

### Task 5: Handleliste logic (TDD)

**Files:**
- Create: `src/lib/handleliste.test.ts`, then `src/lib/handleliste.ts`
- Modify: `src/lib/storage.ts` (add `isListItemArray`)

**Interfaces:**
- Produces: `ListItem`, `addRecipeToList(items, recipe, targetPortions, makeId?): ListItem[]`, `toggleItem(items, id): ListItem[]`, `clearList/clearChecked`, `mergeForShare(items): MergedLine[]`, `buildShareText(items): string`, `isListItemArray`.
- Consumes: `scaleAmount`, `formatAmount` (Task 3), `Recipe` (Task 2).

Semantics (from spec): UI groups by recipe; adding a recipe again merges into its existing lines (same name+unit → summed). `mergeForShare` flattens ACROSS recipes (name+unit match, case-insensitive name) over **unchecked** items only — the shared text is the "left to buy" list.

- [ ] **Step 1: Write failing tests** `src/lib/handleliste.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import type { Recipe } from './types';
import { addRecipeToList, buildShareText, mergeForShare, toggleItem } from './handleliste';

let n = 0;
const makeId = () => `id-${n++}`;

const vafler: Recipe = {
  id: 'vafler', title: 'Vafler', category: 'bakst', portions: 4,
  ingredients: [
    { amount: 3, unit: 'dl', name: 'melk', scalable: true },
    { amount: 2, unit: 'stk', name: 'egg', scalable: true },
    { name: 'kardemomme, etter smak', scalable: false },
  ],
  steps: ['visp', 'stek', 'spis'], source: 'seed',
};
const grot: Recipe = {
  id: 'grot', title: 'Grøt', category: 'frokost', portions: 2,
  ingredients: [{ amount: 4, unit: 'dl', name: 'Melk', scalable: true }],
  steps: ['kok', 'rør', 'server'], source: 'seed',
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
```

- [ ] **Step 2: Run to verify fail**, then **Step 3: Implement** `src/lib/handleliste.ts`:
```ts
import { formatAmount, scaleAmount } from './scaling';
import type { Recipe } from './types';

export type ListItem = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  name: string;
  unit?: string;
  amount?: number;
  checked: boolean;
};

export type MergedLine = { name: string; unit?: string; amount?: number };

const defaultId = () => crypto.randomUUID();
const keyOf = (name: string, unit?: string) => `${name.trim().toLowerCase()}|${unit ?? ''}`;

export function addRecipeToList(
  items: ListItem[],
  recipe: Recipe,
  targetPortions: number,
  makeId: () => string = defaultId,
): ListItem[] {
  const next = items.map((i) => ({ ...i }));
  for (const ing of recipe.ingredients) {
    const amount =
      ing.amount !== undefined && ing.scalable
        ? scaleAmount(ing.amount, recipe.portions, targetPortions)
        : ing.amount;
    const existing = next.find(
      (i) => i.recipeId === recipe.id && keyOf(i.name, i.unit) === keyOf(ing.name, ing.unit),
    );
    if (existing && existing.amount !== undefined && amount !== undefined) {
      existing.amount += amount;
      existing.checked = false;
    } else if (!existing) {
      next.push({
        id: makeId(),
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        name: ing.name,
        unit: ing.unit,
        amount,
        checked: false,
      });
    }
  }
  return next;
}

export function toggleItem(items: ListItem[], id: string): ListItem[] {
  return items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
}

export function clearList(): ListItem[] {
  return [];
}

export function clearChecked(items: ListItem[]): ListItem[] {
  return items.filter((i) => !i.checked);
}

export function mergeForShare(items: ListItem[]): MergedLine[] {
  const lines = new Map<string, MergedLine>();
  for (const item of items) {
    if (item.checked) continue;
    const key = keyOf(item.name, item.unit);
    const existing = lines.get(key);
    if (existing && existing.amount !== undefined && item.amount !== undefined) {
      existing.amount += item.amount;
    } else if (!existing) {
      lines.set(key, { name: item.name, unit: item.unit, amount: item.amount });
    }
  }
  return [...lines.values()];
}

export function buildShareText(items: ListItem[]): string {
  const lines = mergeForShare(items).map((l) => {
    const qty = l.amount !== undefined ? `${formatAmount(l.amount)}${l.unit ? ` ${l.unit}` : ''} ` : '';
    return `• ${qty}${l.name}`;
  });
  return `Handleliste 🛒\n\n${lines.join('\n')}`;
}
```

Also add to `src/lib/storage.ts`:
```ts
import type { ListItem } from './handleliste';

export function isListItemArray(v: unknown): v is ListItem[] {
  return (
    Array.isArray(v) &&
    v.every((i) => {
      if (typeof i !== 'object' || i === null) return false;
      const o = i as Record<string, unknown>;
      return (
        typeof o.id === 'string' && typeof o.recipeId === 'string' &&
        typeof o.recipeTitle === 'string' && typeof o.name === 'string' &&
        typeof o.checked === 'boolean' &&
        (o.amount === undefined || typeof o.amount === 'number') &&
        (o.unit === undefined || typeof o.unit === 'string')
      );
    })
  );
}
```

- [ ] **Step 4: Run** `npm test` → PASS. **Commit** — `feat: handleliste logic with per-recipe grouping and cross-recipe share merge`

---

### Task 6: State providers

**Files:**
- Create: `src/state/RecipesContext.tsx`, `src/state/HandlelisteContext.tsx`
- Modify: `src/App.tsx` (wrap providers)

**Interfaces:**
- Produces:
  - `useRecipes(): { recipes: Recipe[]; addRecipe(r: Recipe): void; updateRecipe(r: Recipe): void; removeRecipe(id: string): void; importRecipes(rs: Recipe[]): void }` — `recipes` is seeds + user recipes; add/update/remove touch ONLY `source === 'julie'` entries; `importRecipes` merges by id (imported wins), julie-source only.
  - `useHandleliste(): { items: ListItem[]; addRecipe(recipe: Recipe, portions: number): void; toggle(id: string): void; clearAll(): void; clearChecked(): void }`.
- Consumes: Tasks 2–5. Pattern for both providers: `useState` initialized from `safeGet(KEYS.x, validator) ?? []` (user recipes only — seeds are never persisted), `useEffect` persisting on change with `safeSet`. Context value memoized with `useMemo`. Throw from the hook if used outside the provider.

- [ ] **Step 1: Implement both providers** following the pattern above (thin wrappers — all logic already unit-tested in Tasks 3–5).
- [ ] **Step 2: Verify** — `npm run build` green (providers wired in App, placeholder still renders).
- [ ] **Step 3: Commit** — `feat: recipes and handleliste state with persistence`

---

### Task 7: Spread engine + Book shell with page flip

**Files:**
- Create: `src/book/spreads.ts`, `src/book/spreads.test.ts`, `src/book/Book.tsx`, `src/book/Tabs.tsx`, `src/book/PageChrome.tsx`, placeholder page components in `src/pages/` (each renders its title for now)
- Modify: `src/App.tsx` (render `<Book/>`)

**Interfaces:**
- Produces:
  - `type Spread = { kind: 'cover'|'dedication'|'toc'|'divider'|'recipe'|'handleliste'|'editor'|'about'; route: string; category?: CategoryId; recipe?: Recipe }`
  - `buildSpreads(recipes: Recipe[]): Spread[]` — order: cover, dedication, toc, then per CATEGORIES order: divider + its recipes (alphabetical by title), then handleliste, editor, about. Routes: `forside`, `dedikasjon`, `innhold`, `kategori/<id>`, `oppskrift/<id>`, `handleliste`, `ny-oppskrift`, `om`.
  - `routeToIndex(spreads: Spread[], hash: string): number` — strips leading `#/`, unknown → 0.
  - `navigateTo(route: string)` — sets `location.hash = '/' + route`.
  - `PageChrome({ side: 'left'|'right'|'single', children, decorations? })` — paper background, ruled lines, used by all pages.
- Consumes: `CATEGORIES`, `Recipe`, providers.

- [ ] **Step 1: TDD `spreads.ts`** — failing tests first:
```ts
import { describe, expect, it } from 'vitest';
import { buildSpreads, routeToIndex } from './spreads';
import { SEED_RECIPES } from '../data/seedRecipes';

describe('buildSpreads', () => {
  const spreads = buildSpreads(SEED_RECipes);           // (fix casing when writing: SEED_RECIPES)
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
});

describe('routeToIndex', () => {
  const spreads = buildSpreads(SEED_RECIPES);
  it('maps hash to index', () => {
    expect(routeToIndex(spreads, '#/innhold')).toBe(2);
    expect(routeToIndex(spreads, '#/oppskrift/finnes-ikke')).toBe(0);
    expect(routeToIndex(spreads, '')).toBe(0);
  });
});
```
Implement, run, PASS.

- [ ] **Step 2: Build `Book.tsx`** — state `index` synced two-way with `location.hash` (`hashchange` listener; `navigateTo` for all navigation). Renders current spread via a `switch` on `kind` → page component. Flip animation: framer-motion `AnimatePresence` with `custom={direction}`; forward = new page rotates in `rotateY: 90 → 0` with `transform-origin: left center` (hinged at the spine), backward mirrored; page shadow via an overlay gradient animated with opacity; duration 0.6s ease. `useReducedMotion()` → plain 0.2s crossfade. Keyboard ← → navigation; invisible tap zones on left/right page edges (min 44px wide); swipe via `motion.div` `drag="x"` with `dragConstraints={{left:0,right:0}}` + `onDragEnd` threshold ±60px.
- [ ] **Step 3: Build `Tabs.tsx`** — register tabs from `CATEGORIES` (tabColor, label) + a rosa handleliste tab, absolutely positioned along the right edge (desktop) / bottom edge (mobile ≤700px), each `navigateTo`s its divider route; active tab pops out 6px further. `aria-label` per tab.
- [ ] **Step 4: `PageChrome.tsx`** — cream paper, CSS `repeating-linear-gradient` ruled lines (spacing `1.8rem`, color `var(--line)`), red-ish margin line on the left, rounded corner, subtle inset shadow toward the spine. Desktop (`min-width: 900px`): Book renders two `PageChrome`s side by side (spread content decides what goes left/right — for now placeholder pages render `side: 'single'` full-width on mobile, left+right on desktop).
- [ ] **Step 5: Verify with Playwright** — dev server: tabs navigate with flip animation, hash updates, refresh lands on same spread, arrows + edge taps + swipe work, mobile viewport 390×844 shows single page with bottom tabs.
- [ ] **Step 6: Commit** — `feat: book shell with spread engine, register tabs, page-flip`

---

### Task 8: Recipe spread (scaling + legg til i handleliste)

**Files:**
- Create: `src/pages/RecipeSpread.tsx`, `src/components/PortionStepper.tsx`, `src/components/HeartBurst.tsx`

**Interfaces:**
- Consumes: `useHandleliste().addRecipe`, `scaleAmount`, `formatAmount`, `PageChrome`.
- Produces: `RecipeSpread({ recipe })` — left page: title (Caveat), portion stepper, ingredient list with live-scaled amounts; right page: numbered steps + optional `note` rendered as a rotated sticky-note; mobile: single page stacked.

- [ ] **Step 1: `PortionStepper`** — `({ value, onChange })`: round − / + buttons (44×44 tap targets), «N porsjoner» label in handwriting font, min 1, max 24, framer-motion scale-pop on change.
- [ ] **Step 2: Ingredient rows** — `formatAmount(scaleAmount(ing.amount, recipe.portions, portions))` + unit + name; non-scalable rows render name only with a small «etter smak»-tone. Amounts animate a quick highlight when portions change.
- [ ] **Step 3: «Legg til i handleliste» button** — washi-tape-styled button on the left page bottom; on tap: `addRecipe(recipe, portions)`, `HeartBurst` (3–5 small hearts, `motion.span`s floating up with random-ish offsets derived from index, 0.8s, then unmount) + toast «Lagt til i handlelista ♥». Button briefly shows «Lagt til!».
- [ ] **Step 4: Verify with Playwright** — pannekaker at 4→8 porsjoner shows «6 stk egg» → wait, 3→6 egg, «500 g hvetemel», «1 l»? No unit conversion — shows «10 dl melk» (unit conversion is out of scope); add to list, check handleliste storage key contains scaled amounts. «etter smak» never changes.
- [ ] **Step 5: Commit** — `feat: recipe spread with portion scaling and add-to-handleliste`

---

### Task 9: Cover, dedication, innholdsfortegnelse, dividers + decoration pass

**Files:**
- Create: `src/pages/CoverPage.tsx`, `src/pages/DedicationPage.tsx`, `src/pages/TocPage.tsx`, `src/pages/CategoryDivider.tsx`, `src/components/Doodles.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `useRecipes()` (toc lists all recipes incl. Julie's), `navigateTo`, `CATEGORIES`.
- Produces: the personality of the book. **Invoke the frontend-design skill for this task** — it's the taste-critical pass.

- [ ] **Step 1: Cover** — hardcover texture (deep dusty rose), «Julies kokebok» in large Caveat, small heart doodle, elastic-band detail down the right edge, «åpne boka →» hint.
- [ ] **Step 2: Dedication** — near-blank cream page: «Til Julie ♥» + one editable line in `src/pages/DedicationPage.tsx` marked `// PERSONLIG HILSEN — Patrick redigerer denne linjen:` with a placeholder greeting («Alle favorittoppskriftene dine, samlet på ett sted.»), a pressed-flower or washi-tape SVG corner.
- [ ] **Step 3: Innholdsfortegnelse** — handwritten index grouped by category with dotted leader lines to «side»-numbers (spread indices), each row `navigateTo`s the recipe. Julie's own recipes show «✎».
- [ ] **Step 4: Category dividers** — big emoji + label on a tabColor-washed page, small doodle set per category from `Doodles.tsx` (inline SVGs: heart, whisk, strawberry, steam swirls, stars — hand-drawn stroke style, `stroke: var(--ink-soft)`).
- [ ] **Step 5: Decoration pass on everything** — washi-tape strips on page corners (rotated translucent rects), one coffee-ring stain SVG on a couple of pages (deterministic placement by spread index, not random), sticky-note styling for recipe notes. Keep legibility: decorations stay in margins/corners.
- [ ] **Step 6: Verify with Playwright** — screenshot desktop spread + mobile 390×844 of cover, toc, one divider, one recipe; check æøå rendering, no horizontal scroll on mobile, decorations don't overlap text.
- [ ] **Step 7: Commit** — `feat: cover, dedication, toc, dividers and notebook decorations`

---

### Task 10: Handleliste page

**Files:**
- Create: `src/pages/HandlelistePage.tsx`

**Interfaces:**
- Consumes: `useHandleliste()`, `buildShareText`, `mergeForShare`, `formatAmount`.

- [ ] **Step 1: List UI** — items grouped by `recipeTitle` (group header in Caveat with a tiny doodle), each row a round checkbox + «mengde enhet navn»; checking animates a hand-drawn strike-through (SVG line scaleX 0→1) and fades the row to 50%.
- [ ] **Step 2: Actions** — «Del listen 💌»: `navigator.share({ text: buildShareText(items) })`; if unavailable/rejected → `navigator.clipboard.writeText` + toast «Kopiert! Lim inn i Notater 📋»; if clipboard also fails → modal with a readonly `<textarea>` of the text. «Fjern avkryssede» + «Tøm listen» (the latter with a small inline confirm «Sikker? Ja / Nei» — no browser `confirm()`, it blocks automation). Empty state: cute doodle + «Handlelista er tom — bla i boka og legg til noe godt!».
- [ ] **Step 3: Verify with Playwright** — add two recipes with shared ingredient (melk), open handleliste: grouped view shows both groups; intercept clipboard (grant permissions) and verify shared text has merged melk line; check-off persists after reload.
- [ ] **Step 4: Commit** — `feat: handleliste page with share and check-off`

---

### Task 11: «Legg til oppskrift»-editor + om boka (eksport/import)

**Files:**
- Create: `src/pages/EditorPage.tsx`, `src/pages/AboutPage.tsx`

**Interfaces:**
- Consumes: `useRecipes()`, `parseAmount`, `isRecipeArray`, `CATEGORIES`.
- Produces: editor reachable from its back-of-book spread AND an «✎ rediger»-link on Julie's own recipe pages (`navigateTo('ny-oppskrift')` + editing state carried via `sessionStorage` key `julies-kokebok:editing` holding the recipe id).

- [ ] **Step 1: Editor form** — styled as a blank notebook page: tittel (required), kategori (5 washi-tab radio chips), porsjoner (stepper, default 4), ingrediensrader [mengde | enhet | ingrediens | «etter smak»-toggle] with legg-til/fjern-rad; steg textareas with legg-til/fjern; notat (optional). Mengde parsed with `parseAmount` on blur; invalid input shows «hmm, det tallet skjønte jeg ikke 🙈» under the field. Submit requires: tittel, ≥1 ingrediens with name, ≥1 steg.
- [ ] **Step 2: Save behavior** — new: `addRecipe({ ...form, id: crypto.randomUUID(), source: 'julie' })`; editing: `updateRecipe`. After save `navigateTo('oppskrift/<id>')` — the new page exists because spreads rebuild from `useRecipes().recipes`. Delete button (edit mode only, inline confirm) → `removeRecipe` + `navigateTo('innhold')`.
- [ ] **Step 3: AboutPage «Om boka»** — short handwritten paragraph («Denne boka er laga til Julie ♥ …»), then backup section: «Ta vare på oppskriftene»: **Eksporter** — `const blob = new Blob([JSON.stringify({ version: 1, recipes: julieRecipes }, null, 2)], { type: 'application/json' })`, download via temporary `<a download="julies-kokebok-backup.json">`; **Importer** — `<input type="file" accept=".json">`, parse, validate `data.recipes` with `isRecipeArray` and every `source === 'julie'`, then `importRecipes`; invalid → «Kunne ikke lese filen 😢». Show count: «N oppskrifter skrevet av Julie».
- [ ] **Step 4: Verify with Playwright** — full round-trip: add recipe via editor → appears under its category + in toc with ✎ → reload → still there → export downloads file → clear localStorage → import file → recipe back. Edit + delete paths.
- [ ] **Step 5: Commit** — `feat: recipe editor with edit/delete and JSON backup`

---

### Task 12: PWA touches + GitHub Pages deploy

**Files:**
- Create: `public/manifest.webmanifest`, `public/icons/icon.svg`, `public/icons/icon-512.png`, `public/icons/apple-touch-icon.png`, `.github/workflows/deploy.yml`
- Modify: `index.html` (manifest + icon links)

- [ ] **Step 1: Icon** — hand-drawn-style SVG: cream notebook with rosa heart on the cover, `viewBox="0 0 512 512"`. Rasterize: `qlmanage -t -s 512 -o public/icons public/icons/icon.svg` then rename; 180px apple-touch-icon via `sips -z 180 180`. (Fallback if qlmanage output is poor: screenshot the SVG at exact size with Playwright.)
- [ ] **Step 2: Manifest** — `{ "name": "Julies kokebok", "short_name": "Kokeboka", "start_url": "/julies-kokebok/", "scope": "/julies-kokebok/", "display": "standalone", "background_color": "#f9f4e8", "theme_color": "#f7f0e3", "icons": [{ "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }] }`; `<link rel="manifest">`, `<link rel="apple-touch-icon">`, `<link rel="icon" type="image/svg+xml">` in index.html.
- [ ] **Step 3: Workflow** `.github/workflows/deploy.yml` — on push to main: setup-node 22, `npm ci`, `npm test`, `npm run build`, `actions/upload-pages-artifact` (path `dist`), `actions/deploy-pages`; permissions `pages: write, id-token: write`; concurrency group `pages`.
- [ ] **Step 4: Create repo & push** — `gh auth status`; switch to the personal (non-TechVilmer) account; `gh repo create julies-kokebok --public --source ~/Documents/GitHub/julies-kokebok --push`; enable Pages: `gh api repos/<user>/julies-kokebok/pages -X POST -f build_type=workflow` (ignore 409 if already enabled); watch run with `gh run watch`.
- [ ] **Step 5: Verify live** — open `https://<user>.github.io/julies-kokebok/` in Playwright: cover renders, navigate to a recipe, scale portions, add to handleliste, reload persists.
- [ ] **Step 6: Commit** (workflow etc. included in the push above) — `feat: PWA manifest, icons, GitHub Pages deploy`

---

### Task 13: Final verification pass

- [ ] **Step 1:** `npm test && npm run build` — all green.
- [ ] **Step 2: Playwright full pass on the live site** — desktop 1280×800 spread + mobile 390×844: flip through entire book via tabs/corners/keyboard; scaling with fractions («1½»); handleliste share fallback; editor round-trip; reduced-motion emulation (`prefers-reduced-motion: reduce`) shows crossfades not flips; no console errors; no horizontal scroll on mobile.
- [ ] **Step 3: Fresh-eyes review** — dispatch a code-review subagent over the full diff; fix findings.
- [ ] **Step 4: Final commit + push.** Hand the URL to Patrick with a note on how to swap seed recipes and edit the dedication line.

---

## Self-review notes

- **Spec coverage:** every spec section maps to a task (concept/look → 1, 9; structure/nav → 7; scaling → 3, 8; handleliste → 5, 10; editor+backup → 11; data model → 2, 4; animations → 7–10; tech/deploy → 1, 12; error handling → 4, 10, 11; testing → per-task + 13). Out-of-scope items remain out.
- **Type consistency:** `ListItem` defined once in handleliste.ts, storage imports it; `Spread.route` strings match `routeToIndex` and `navigateTo` usage; provider APIs named identically in Tasks 6, 8, 10, 11.
- **Known typo guard:** Task 7 test snippet contains `SEED_RECipes` in one line — correct to `SEED_RECIPES` when writing the file.
