import { useRef, useState } from 'react';
import { PageChrome, type PageSide } from '../book/PageChrome';
import { DoodleHeart, DoodleStrawberry, WashiTape } from '../components/Doodles';
import { buildBackup, parseBackup } from '../lib/backup';
import { getAllImages, setImage } from '../lib/imageStore';
import { useRatings } from '../state/RatingsContext';
import { useRecipes } from '../state/RecipesContext';

export function AboutPage({ side }: { side: PageSide }) {
  const { julieRecipes, importRecipes } = useRecipes();
  const { ratings, importRatings } = useRatings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportBackup = async () => {
    const images = await getAllImages();
    const blob = new Blob([buildBackup(julieRecipes, ratings, images)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'julies-kokebok-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    try {
      const parsed = parseBackup(JSON.parse(await file.text()));
      if (!parsed || !parsed.recipes.every((r) => r.source === 'julie')) {
        setMessage('Kunne ikke lese filen 😢 — er det riktig sikkerhetskopi?');
        return;
      }
      importRecipes(parsed.recipes);
      importRatings(parsed.ratings);
      let imageCount = 0;
      for (const [id, dataUrl] of Object.entries(parsed.images)) {
        if (await setImage(id, dataUrl)) imageCount++;
      }
      const r = parsed.recipes.length;
      setMessage(
        `${r} ${r === 1 ? 'oppskrift' : 'oppskrifter'}${
          imageCount > 0 ? ` og ${imageCount} ${imageCount === 1 ? 'bilde' : 'bilder'}` : ''
        } importert ♥`,
      );
    } catch {
      setMessage('Kunne ikke lese filen 😢 — er det riktig sikkerhetskopi?');
    }
  };

  const about = (
    <div className="about-page">
      <WashiTape variant="gronn" style={{ top: 12, left: 28, transform: 'rotate(-4deg)' }} />
      <h2>Om boka</h2>
      <p className="about-text">
        Denne boka er laga til Julie ♥ Her bor favorittoppskriftene — de gamle fra notatboka og de
        nye du legger til selv.
      </p>
      <p className="about-text">
        Skaler porsjonene, sett hjerter på favorittene, lim inn bilder, og del handlelista rett til
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
        <button type="button" className="washi-btn" onClick={() => void exportBackup()}>
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
        Sikkerhetskopien tar med egne oppskrifter, hjertene og bildene. Legg fila i skyen eller
        send den til deg selv — sånn blir ingenting borte om telefonen byttes ut.
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
