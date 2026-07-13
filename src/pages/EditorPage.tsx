import { PageChrome, type PageSide } from '../book/PageChrome';

export function EditorPage({ side }: { side: PageSide }) {
  if (side === 'right') {
    return <PageChrome side="right" />;
  }
  return (
    <PageChrome side={side}>
      <h2>Legg til oppskrift</h2>
    </PageChrome>
  );
}
