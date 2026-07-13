import { PageChrome, type PageSide } from '../book/PageChrome';
import { DoodleHeart } from '../components/Doodles';
import { navigateTo } from '../book/spreads';

export function CoverPage({ side }: { side: PageSide }) {
  const open = () => navigateTo('dedikasjon');

  if (side === 'right') {
    return (
      <PageChrome side="right" lined={false} className="cover-chrome">
        <button type="button" className="cover-front cover-back-half" onClick={open}>
          <span className="cover-stitch" aria-hidden />
          <span className="cover-hint">åpne boka →</span>
        </button>
        <span className="cover-band" aria-hidden />
      </PageChrome>
    );
  }

  return (
    <PageChrome side={side} lined={false} className="cover-chrome">
      <button type="button" className="cover-front" onClick={open}>
        <span className="cover-stitch" aria-hidden />
        <h1 className="cover-title">
          Julies
          <br />
          kokebok
        </h1>
        <DoodleHeart className="cover-heart" size={46} />
        <span className="cover-sticker">oppskrifter &amp; kos ♥</span>
        {side === 'single' && <span className="cover-hint">trykk for å åpne →</span>}
      </button>
      {side === 'single' && <span className="cover-band" aria-hidden />}
    </PageChrome>
  );
}
