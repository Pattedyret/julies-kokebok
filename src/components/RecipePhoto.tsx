import { useEffect, useRef, useState } from 'react';
import { deleteImage, getImage, setImage } from '../lib/imageStore';
import { resizeToDataUrl } from '../lib/resizeImage';

type Props = { recipeId: string; title: string };

/** Et innlimt fotografi på oppskriftssiden — lagres på enheten (IndexedDB). */
export function RecipePhoto({ recipeId, title }: Props) {
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    void getImage(recipeId).then((v) => {
      if (alive) setSrc(v);
    });
    return () => {
      alive = false;
    };
  }, [recipeId]);

  const onFile = async (file: File) => {
    setBusy(true);
    setError(false);
    try {
      const dataUrl = await resizeToDataUrl(file);
      const ok = await setImage(recipeId, dataUrl);
      if (!ok) throw new Error('lagring feilet');
      setSrc(dataUrl);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    await deleteImage(recipeId);
    setSrc(undefined);
    setConfirmRemove(false);
  };

  return (
    <div className="photo-wrap">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
          e.target.value = '';
        }}
      />
      {src ? (
        <>
          <figure className="polaroid">
            <span className="polaroid-tape" aria-hidden />
            <img src={src} alt={`Bilde av ${title}`} />
          </figure>
          <span className="photo-actions">
            <button type="button" className="hl-link" onClick={() => fileRef.current?.click()}>
              bytt bilde
            </button>
            {!confirmRemove ? (
              <button type="button" className="hl-link" onClick={() => setConfirmRemove(true)}>
                fjern
              </button>
            ) : (
              <span className="hl-confirm">
                Sikker?{' '}
                <button type="button" className="hl-link hl-link-danger" onClick={() => void remove()}>
                  Ja
                </button>{' '}
                <button type="button" className="hl-link" onClick={() => setConfirmRemove(false)}>
                  Nei
                </button>
              </span>
            )}
          </span>
        </>
      ) : (
        <button
          type="button"
          className="photo-add"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'limer inn …' : '📷 lim inn et bilde'}
        </button>
      )}
      {error && (
        <p className="ed-error" role="alert">
          Klarte ikke å lagre bildet 😢 prøv et annet?
        </p>
      )}
    </div>
  );
}
