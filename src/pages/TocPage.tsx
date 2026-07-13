import { PageChrome, type PageSide } from '../book/PageChrome';

export function TocPage({ side }: { side: PageSide }) {
  if (side === 'right') {
    return <PageChrome side="right" />;
  }
  return (
    <PageChrome side={side}>
      <h2>Innhold</h2>
    </PageChrome>
  );
}
