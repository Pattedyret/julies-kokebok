import type { ReactNode } from 'react';

export type PageSide = 'left' | 'right' | 'single';

type Props = {
  side: PageSide;
  lined?: boolean;
  className?: string;
  children?: ReactNode;
};

export function PageChrome({ side, lined = true, className, children }: Props) {
  const classes = ['page-chrome', `side-${side}`, lined ? 'lined' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return <div className={classes}>{children}</div>;
}
