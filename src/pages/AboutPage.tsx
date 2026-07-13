import { PageChrome, type PageSide } from '../book/PageChrome';

export function AboutPage({ side }: { side: PageSide }) {
  if (side === 'right') {
    return <PageChrome side="right" />;
  }
  return (
    <PageChrome side={side}>
      <h2>Om boka</h2>
    </PageChrome>
  );
}
