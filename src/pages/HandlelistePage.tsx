import { PageChrome, type PageSide } from '../book/PageChrome';

export function HandlelistePage({ side }: { side: PageSide }) {
  if (side === 'right') {
    return <PageChrome side="right" />;
  }
  return (
    <PageChrome side={side}>
      <h2>Handleliste</h2>
    </PageChrome>
  );
}
