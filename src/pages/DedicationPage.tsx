import { PageChrome, type PageSide } from '../book/PageChrome';

export function DedicationPage({ side }: { side: PageSide }) {
  if (side === 'right') {
    return <PageChrome side="right" />;
  }
  return (
    <PageChrome side={side}>
      <h2>Til Julie ♥</h2>
    </PageChrome>
  );
}
