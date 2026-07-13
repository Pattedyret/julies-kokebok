# Julies kokebok — Design

**Date:** 2026-07-13
**Status:** Approved by Patrick (brainstorming session)

## Purpose

A personal gift for Julie: a cute, notebook-styled cookbook website that digitalizes her
physical recipe notebook. It must feel like a real notebook you flip through — warm,
handwritten, decorated for her — while adding the things paper can't do: portion scaling,
a shopping list, and the ability to add new recipes from her phone.

Norwegian UI throughout.

## Decisions made

| Question | Decision |
| --- | --- |
| Handleliste behavior | In-app list page + «Del»-button (Web Share API / clipboard fallback) |
| Recipe entry | In-app «legg til oppskrift» editor (localStorage) + bundled seed recipes |
| Hosting | GitHub Pages (personal account, repo `julies-kokebok`), auto-deploy on push |
| Content at launch | 6–8 Norwegian sample recipes; Patrick swaps in real notebook recipes later |
| Tech approach | Vite + React + TypeScript, custom CSS 3D page-flip, framer-motion |

Rejected approaches: vanilla single-file (state management would sprawl across editor /
scaling / handleliste), page-flip library like StPageFlip (assumes fixed-size pages;
breaks with dynamic content like portion steppers and forms).

## Concept & look

A warm personal notebook:

- Cream paper texture with faint ruled lines; hardcover front with «Julies kokebok».
- Dedication page inside the cover: «Til Julie ♥» (+ short personal line Patrick can edit).
- Handwriting-style display font — MUST support æ/ø/å (verify glyphs before choosing).
- Decorations: washi-tape strips, small doodles (hearts, whisk, strawberries), a coffee-ring
  stain or two, sticky-note accents. Hand-placed, not random — it should look loved, not busy.
- Cute but calm: decorations never compete with recipe legibility.

## Structure & navigation

Book metaphor drives navigation:

Cover → dedication → innholdsfortegnelse → category dividers → recipe pages → handleliste (back of book).

- Categories: Frokost, Middag, Bakst & dessert, Småretter, Drikke. (Category list is a
  plain constant — easy to adjust when the real notebook's sections are known.)
- Categories appear as **register tabs** sticking out the page edge, like plastic index
  tabs. Handleliste has its own tab at the back.
- Desktop/tablet-landscape: two-page spread. Phone: single page, same flip animation.
- Flipping: tap/click page corners or tabs; swipe on touch. URL reflects current page
  (hash routing) so refresh/share lands on the same page.

## Recipe page & portion scaling

- Ingredients (mengde / enhet / navn) + numbered steps, notebook-handwriting styling.
- Porsjoner stepper (− N +) rescales ingredient amounts live.
- Pretty fraction formatting: 0.5 → ½, 0.25 → ¼, 1.5 → 1½; otherwise round sensibly
  (max 1 decimal, trailing zeros stripped).
- Ingredients can be marked non-scalable («etter smak») — they never multiply.
- Optional personal note field per recipe (renders as a margin scribble / sticky note).

## Handleliste

- «Legg til i handleliste» on a recipe adds the **currently scaled** ingredient amounts.
  Small heart-pop animation on add.
- List page (back of book): items grouped by recipe; duplicate ingredients merged when
  name+unit match (amounts summed).
- Check-off with strike-through animation; «Tøm listen» to clear; checked items clearable
  separately.
- «Del listen» → Web Share API with plain-text list; clipboard copy fallback with a
  «kopiert!» toast. Text format is clean enough to paste into Apple Notes.
- Persisted in localStorage.

## «Legg til oppskrift» editor

- A form styled as writing on a blank notebook page: tittel, kategori, porsjoner,
  ingredient rows (mengde/enhet/ingrediens, add/remove rows), steps (add/remove),
  optional note.
- Saves to localStorage. Julie's recipes render identically to seed recipes but carry a
  small «skrevet av Julie ✎» mark, and can be edited/deleted. Seed recipes are read-only.
- **Backup safety net:** eksporter (downloads a JSON file) / importer (file picker, merges
  by id) — because localStorage is device-local and doesn't survive phone changes.
  Lives on a small «om boka»-page at the very back.

## Data model

```ts
type Ingredient = {
  amount?: number;       // absent → non-numeric line
  unit?: string;         // "dl", "g", "ss", "ts", "stk", …
  name: string;
  scalable: boolean;     // false for "etter smak" items
};

type Recipe = {
  id: string;            // slug for seeds, uuid for user recipes
  title: string;
  category: CategoryId;  // 'frokost' | 'middag' | 'bakst' | 'smaretter' | 'drikke'
  portions: number;      // base portion count the amounts are written for
  ingredients: Ingredient[];
  steps: string[];
  note?: string;
  source: 'seed' | 'julie';
};
```

- Seed recipes: one bundled TS file (`src/data/seedRecipes.ts`), dead simple to extend.
- User recipes: localStorage under a versioned key (`julies-kokebok:v1:recipes`).
- Handleliste: localStorage (`julies-kokebok:v1:handleliste`).
- All localStorage access wrapped in try/catch (private-mode Safari etc. must not crash
  the app — degrade to in-memory).

## Animations

- 3D page flip: `rotateY` on a page wrapper with `preserve-3d`, subtle page-shadow
  during the turn.
- Gentle hover wobble on register tabs; hearts pop when adding to handleliste;
  strike-through animation on check-off; soft entrance fades.
- All motion respects `prefers-reduced-motion` (flips become crossfades).

## Tech & deploy

- New repo `julies-kokebok` on Patrick's **personal** GitHub account (not TechVilmer).
- Vite + React + TypeScript + framer-motion. No backend, no server state.
- Hash routing (GitHub Pages has no SPA rewrites).
- Web-app manifest + icons so «Legg til på Hjem-skjerm» feels like a real app.
- GitHub Pages deploy via Actions workflow on push to main; Vite `base` set to the
  repo path.

## Error handling

- localStorage guarded (see above); import validates JSON shape before merging and
  reports «kunne ikke lese filen» on bad input.
- Web Share API absence → clipboard fallback → manual-copy textarea as last resort.
- No network calls at runtime → no network error surface.

## Testing / verification

- `tsc` + `vite build` clean.
- Playwright pass during the design-implementation phase: flip navigation, scaling math
  rendering, handleliste add/merge/share-fallback, editor round-trip
  (add → reload → still there), export/import round-trip, mobile viewport (390×844)
  and desktop spread, reduced-motion mode.

## Out of scope (YAGNI)

- Accounts, sync between devices, any backend.
- Photos per recipe (can be added later; layout should not preclude it).
- Search (innholdsfortegnelse + tabs suffice at notebook scale).
- Multi-language UI.
