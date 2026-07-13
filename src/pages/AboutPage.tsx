import { useRef, useState } from 'react';
import { PageChrome, type PageSide } from '../book/PageChrome';
import { DoodleHeart, DoodleStrawberry, WashiTape } from '../components/Doodles';
import { isRecipeArray } from '../lib/storage';
import { useRecipes } from '../state/RecipesContext';

export function AboutPage({ side }: { side: PageSide }) {
  const { julieRecipes, importRecipes } = useRecipes();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportBackup = () => {
    const blob = new Blob(
      [JSON.stringify({ version: 1, recipes: julieRecipes }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'julies-kokebok-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    try {
      const data: unknown = JSON.parse(await file.text());
      const recipes =
        typeof data === 'object' && data !== null && 'recipes' in data
          ? (data as { recipes: unknown }).recipes
          : data;
      if (!isRecipeArray(recipes) || !recipes.every((r) => r.source === 'julie')) {
        setMessage('Kunne ikke lese filen 😢 — er det riktig sikkerhetskopi?');
        return;
      }
      importRecipes(recipes);
      setMessage(
        `${recipes.length} ${recipes.length === 1 ? 'oppskrift' : 'oppskrifter'} importert ♥`,
      );
    } catch {
      setMessage('Kunne ikke lese filen 😢 — er det riktig sikkerhetskopi?');
    }
  };

  const about = (
    <div className="about-page">
      <WashiTape variant="rosa" style={{ top: 12, left: 28, transform: 'rotate(-4deg)' }} />
      <h2>Om boka</h2>
      <p className="about-text">
        Denne boka er laga til Julie ♥ Her bor favorittoppskriftene — de gamle fra notatboka og de
        nye du legger til selv.
      </p>
      <p className="about-text">
        Skaler porsjonene på hver oppskrift, trykk «Legg til i handleliste», og del lista rett til
        Notater når du skal i butikken.
      </p>
      <DoodleHeart size={34} style={{ color: 'var(--accent)' }} />
    </div>
  );

  const backup = (
    <div className="about-backup">
      <h3>Ta vare på oppskriftene</h3>
      <p className="hl-note">
        {julieRecipes.length === 0
          ? 'Ingen egne oppskrifter ennå — de du legger til dukker opp her.'
          : `${julieRecipes.length} ${
              julieRecipes.length === 1 ? 'oppskrift' : 'oppskrifter'
            } skrevet av Julie ✎`}
      </p>
      <div className="about-backup-actions">
        <button
          type="button"
          className="washi-btn"
          onClick={exportBackup}
          disabled={julieRecipes.length === 0}
        >
          Eksporter sikkerhetskopi
        </button>
        <button type="button" className="hl-link" onClick={() => fileRef.current?.click()}>
          Importer fra fil
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importBackup(f);
            e.target.value = '';
          }}
        />
      </div>
      {message && (
        <p className="ed-error" role="status">
          {message}
        </p>
      )}
      <p className="hl-note">
        Sikkerhetskopien er en liten fil du kan legge i skyen eller sende til deg selv — sånn blir
        ingenting borte om telefonen byttes ut.
      </p>
      <DoodleStrawberry className="about-berry" size={44} />
    </div>
  );

  if (side === 'left') return <PageChrome side="left">{about}</PageChrome>;
  if (side === 'right') return <PageChrome side="right">{backup}</PageChrome>;
  return (
    <PageChrome side="single">
      {about}
      <hr className="page-divider" />
      {backup}
    </PageChrome>
  );
}
