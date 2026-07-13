import { PageChrome, type PageSide } from '../book/PageChrome';

export function CoverPage({ side }: { side: PageSide }) {
  if (side === 'right') {
    return <PageChrome side="right" lined={false} className="cover-chrome" />;
  }
  return (
    <PageChrome side={side} lined={false} className="cover-chrome">
      <h1>Julies kokebok</h1>
    </PageChrome>
  );
}
