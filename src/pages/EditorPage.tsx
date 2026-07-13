import { useState, type FormEvent } from 'react';
import { PageChrome, type PageSide } from '../book/PageChrome';
import { navigateTo } from '../book/spreads';
import { DoodleSparkles, DoodleWhisk, WashiTape } from '../components/Doodles';
import { PortionStepper } from '../components/PortionStepper';
import { CATEGORIES } from '../data/categories';
import { parseAmount } from '../lib/scaling';
import type { CategoryId, Ingredient, Recipe } from '../lib/types';
import { useRecipes } from '../state/RecipesContext';

export const EDITING_KEY = 'julies-kokebok:editing';

type IngRow = { amount: string; unit: string; name: string; etterSmak: boolean };

const emptyRow = (): IngRow => ({ amount: '', unit: '', name: '', etterSmak: false });

function rowsFromRecipe(r: Recipe): IngRow[] {
  return r.ingredients.map((ing) => ({
    amount: ing.amount !== undefined ? String(ing.amount).replace('.', ',') : '',
    unit: ing.unit ?? '',
    name: ing.name,
    etterSmak: !ing.scalable && ing.amount === undefined,
  }));
}

export function EditorPage({ side }: { side: PageSide }) {
  const { recipes, addRecipe, updateRecipe, removeRecipe } = useRecipes();

  const [editingId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(EDITING_KEY);
    } catch {
      return null;
    }
  });
  const editing = editingId
    ? recipes.find((r) => r.id === editingId && r.source === 'julie')
    : undefined;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [category, setCategory] = useState<CategoryId>(editing?.category ?? 'middag');
  const [portions, setPortions] = useState(editing?.portions ?? 4);
  const [rows, setRows] = useState<IngRow[]>(() =>
    editing ? rowsFromRecipe(editing) : [emptyRow(), emptyRow(), emptyRow()],
  );
  const [steps, setSteps] = useState<string[]>(editing?.steps ?? ['']);
  const [note, setNote] = useState(editing?.note ?? '');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const setRow = (i: number, patch: Partial<IngRow>) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const clearEditing = () => {
    try {
      sessionStorage.removeItem(EDITING_KEY);
    } catch {
      /* uviktig */
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Oppskriften trenger et navn øverst ✎');
      return;
    }
    const ingredients: Ingredient[] = [];
    for (const r of rows) {
      if (!r.name.trim()) continue;
      if (!r.etterSmak && r.amount.trim() && parseAmount(r.amount) === undefined) {
        setError(`Hmm, mengden «${r.amount}» for ${r.name.trim()} skjønte jeg ikke 🙈`);
        return;
      }
      const amount = r.etterSmak ? undefined : parseAmount(r.amount);
      ingredients.push({
        name: r.name.trim(),
        unit: r.unit.trim() || undefined,
        amount,
        scalable: !r.etterSmak && amount !== undefined,
      });
    }
    if (ingredients.length === 0) {
      setError('Legg til minst én ingrediens 🥕');
      return;
    }
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);
    if (cleanSteps.length === 0) {
      setError('Skriv minst ett steg i fremgangsmåten 🍳');
      return;
    }
    const recipe: Recipe = {
      id: editing?.id ?? crypto.randomUUID(),
      title: title.trim(),
      category,
      portions,
      ingredients,
      steps: cleanSteps,
      note: note.trim() || undefined,
      source: 'julie',
    };
    if (editing) updateRecipe(recipe);
    else addRecipe(recipe);
    clearEditing();
    navigateTo(`oppskrift/${recipe.id}`);
  };

  const onDelete = () => {
    if (!editing) return;
    removeRecipe(editing.id);
    clearEditing();
    navigateTo('innhold');
  };

  const form = (
    <form className="ed-form" onSubmit={onSubmit}>
      <h2>{editing ? 'Rediger oppskrift' : 'Legg til oppskrift'}</h2>

      <label className="ed-label" htmlFor="ed-title">
        Hva heter retten?
      </label>
      <input
        id="ed-title"
        className="ed-input ed-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="f.eks. Mormors boller"
        autoComplete="off"
        spellCheck={false}
        required
      />

      <span className="ed-label" id="ed-cat-label">
        Kapittel
      </span>
      <div className="ed-chips" role="group" aria-labelledby="ed-cat-label">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`ed-chip${category === c.id ? ' active' : ''}`}
            style={category === c.id ? { backgroundColor: c.tabColor } : undefined}
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <span className="ed-label">Oppskriften passer til</span>
      <PortionStepper value={portions} onChange={setPortions} />

      <span className="ed-label">Ingredienser</span>
      <div className="ed-rows">
        {rows.map((r, i) => (
          <div key={i} className="ed-row">
            {!r.etterSmak && (
              <>
                <input
                  className="ed-input ed-amount"
                  value={r.amount}
                  onChange={(e) => setRow(i, { amount: e.target.value })}
                  placeholder="2"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={`Mengde, ingrediens ${i + 1}`}
                />
                <input
                  className="ed-input ed-unit"
                  value={r.unit}
                  onChange={(e) => setRow(i, { unit: e.target.value })}
                  placeholder="dl"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={`Enhet, ingrediens ${i + 1}`}
                />
              </>
            )}
            <input
              className="ed-input ed-name"
              value={r.name}
              onChange={(e) => setRow(i, { name: e.target.value })}
              placeholder={r.etterSmak ? 'salt og pepper' : 'melk'}
              autoComplete="off"
              spellCheck={false}
              aria-label={`Ingrediens ${i + 1}`}
            />
            <button
              type="button"
              className={`ed-chip ed-chip-small${r.etterSmak ? ' active' : ''}`}
              aria-pressed={r.etterSmak}
              onClick={() => setRow(i, { etterSmak: !r.etterSmak })}
            >
              etter smak
            </button>
            <button
              type="button"
              className="ed-remove"
              aria-label={`Fjern ingrediens ${i + 1}`}
              onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
              disabled={rows.length === 1}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="ed-add" onClick={() => setRows((p) => [...p, emptyRow()])}>
        + ny ingrediens
      </button>

      <span className="ed-label">Slik gjør du</span>
      <div className="ed-rows">
        {steps.map((s, i) => (
          <div key={i} className="ed-row ed-step-row">
            <span className="ed-step-num" aria-hidden>
              {i + 1}.
            </span>
            <textarea
              className="ed-input ed-step"
              value={s}
              onChange={(e) =>
                setSteps((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
              }
              rows={2}
              placeholder="Bland alt godt sammen …"
              aria-label={`Steg ${i + 1}`}
            />
            <button
              type="button"
              className="ed-remove"
              aria-label={`Fjern steg ${i + 1}`}
              onClick={() => setSteps((prev) => prev.filter((_, j) => j !== i))}
              disabled={steps.length === 1}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="ed-add" onClick={() => setSteps((p) => [...p, ''])}>
        + nytt steg
      </button>

      <label className="ed-label" htmlFor="ed-note">
        Liten notis (valgfritt)
      </label>
      <input
        id="ed-note"
        className="ed-input"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Best med blåbærsyltetøy ♥"
        autoComplete="off"
      />

      {error && (
        <p className="ed-error" role="alert">
          {error}
        </p>
      )}

      <div className="ed-actions">
        <button type="submit" className="washi-btn">
          {editing ? 'Lagre endringer ♥' : 'Lim inn i boka ♥'}
        </button>
        {editing &&
          (!confirmDelete ? (
            <button type="button" className="hl-link hl-link-danger" onClick={() => setConfirmDelete(true)}>
              Slett oppskriften
            </button>
          ) : (
            <span className="hl-confirm">
              Sikker?{' '}
              <button type="button" className="hl-link hl-link-danger" onClick={onDelete}>
                Ja, slett
              </button>{' '}
              <button type="button" className="hl-link" onClick={() => setConfirmDelete(false)}>
                Nei
              </button>
            </span>
          ))}
      </div>
    </form>
  );

  const tips = (
    <div className="ed-tips">
      <WashiTape variant="gul" style={{ top: 10, left: 30, transform: 'rotate(-5deg)' }} />
      <DoodleWhisk className="ed-tips-doodle" size={58} />
      <h3>Julies egne sider</h3>
      <p>
        Oppskrifter du limer inn her får merket «skrevet av Julie ✎» og havner i riktig kapittel
        sammen med de andre.
      </p>
      <p className="hl-note">
        De lagres på denne enheten — ta en sikkerhetskopi under «Om boka» helt bakerst en gang i
        blant ♥
      </p>
      <DoodleSparkles className="hl-sparkle" size={40} />
    </div>
  );

  if (side === 'left') return <PageChrome side="left">{form}</PageChrome>;
  if (side === 'right') return <PageChrome side="right">{tips}</PageChrome>;
  return (
    <PageChrome side="single">
      {form}
      <hr className="page-divider" />
      {tips}
    </PageChrome>
  );
}
