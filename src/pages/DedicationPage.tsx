import { PageChrome, type PageSide } from '../book/PageChrome';
import { DoodleHeart, DoodleSparkles, DoodleStrawberry, WashiTape } from '../components/Doodles';

// PERSONLIG HILSEN — rediger disse to linjene før boka gis bort:
const GREETING = 'Alle favorittoppskriftene dine, samlet på ett sted.';
const SIGNATURE = '— med kjærlighet ♥';

export function DedicationPage({ side }: { side: PageSide }) {
  if (side === 'right') {
    return (
      <PageChrome side="right">
        <div className="dedication-right">
          <DoodleStrawberry className="dedication-doodle-berry" size={54} />
          <DoodleSparkles className="dedication-doodle-sparkle" size={44} />
          <p className="dedication-ps">(og litt kos)</p>
        </div>
      </PageChrome>
    );
  }

  return (
    <PageChrome side={side}>
      <WashiTape variant="gronn" style={{ top: 14, left: 26, transform: 'rotate(-6deg)' }} />
      <div className="dedication">
        <h2 className="dedication-title">Til Julie ♥</h2>
        <p className="dedication-greeting">{GREETING}</p>
        <p className="dedication-signature">{SIGNATURE}</p>
        <DoodleHeart className="dedication-heart" size={30} />
      </div>
    </PageChrome>
  );
}
