import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AboutPage } from '../pages/AboutPage';
import { CategoryDivider } from '../pages/CategoryDivider';
import { CoverPage } from '../pages/CoverPage';
import { DedicationPage } from '../pages/DedicationPage';
import { EditorPage } from '../pages/EditorPage';
import { HandlelistePage } from '../pages/HandlelistePage';
import { RecipeSpread } from '../pages/RecipeSpread';
import { TocPage } from '../pages/TocPage';
import { useRecipes } from '../state/RecipesContext';
import type { PageSide } from './PageChrome';
import { buildSpreads, navigateTo, routeToIndex, type Spread } from './spreads';
import { Tabs } from './Tabs';

function renderSide(spread: Spread, side: PageSide): ReactNode {
  switch (spread.kind) {
    case 'cover':
      return <CoverPage side={side} />;
    case 'dedication':
      return <DedicationPage side={side} />;
    case 'toc':
      return <TocPage side={side} />;
    case 'divider':
      return <CategoryDivider side={side} category={spread.category} />;
    case 'recipe':
      return <RecipeSpread side={side} recipe={spread.recipe} />;
    case 'handleliste':
      return <HandlelistePage side={side} />;
    case 'editor':
      return <EditorPage side={side} />;
    case 'about':
      return <AboutPage side={side} />;
  }
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

type Flip = { fromIdx: number; toIdx: number; dir: 1 | -1 };

const FLIP_TRANSITION = { duration: 0.65, ease: [0.4, 0.1, 0.2, 1] as const };

export function Book() {
  const { recipes } = useRecipes();
  const spreads = useMemo(() => buildSpreads(recipes), [recipes]);
  const [displayed, setDisplayed] = useState(() => routeToIndex(spreads, location.hash));
  const [flip, setFlip] = useState<Flip | null>(null);
  const reduced = useReducedMotion();
  const isSpread = useMediaQuery('(min-width: 900px)');
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Hash er eneste sannhetskilde for navigasjon.
  useEffect(() => {
    const onHash = () => {
      const target = routeToIndex(spreads, location.hash);
      const current = flip ? flip.toIdx : displayed;
      if (flip) {
        setDisplayed(flip.toIdx);
        setFlip(null);
      }
      if (target === current) return;
      if (reduced) {
        setDisplayed(target);
        return;
      }
      setDisplayed(current);
      setFlip({ fromIdx: current, toIdx: target, dir: target > current ? 1 : -1 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [spreads, displayed, flip, reduced]);

  // Når oppskrifter endres (lagt til/slettet), pek på riktig oppslag uten animasjon.
  useEffect(() => {
    setFlip(null);
    setDisplayed(routeToIndex(spreads, location.hash));
  }, [spreads]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
        return;
      }
      const current = flip ? flip.toIdx : displayed;
      if (e.key === 'ArrowRight' && current < spreads.length - 1) {
        navigateTo(spreads[current + 1].route);
      } else if (e.key === 'ArrowLeft' && current > 0) {
        navigateTo(spreads[current - 1].route);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spreads, displayed, flip]);

  const finishFlip = () => {
    if (flip) {
      setDisplayed(flip.toIdx);
      setFlip(null);
    }
  };

  const current = flip ? flip.toIdx : displayed;
  const goPrev = () => current > 0 && navigateTo(spreads[current - 1].route);
  const goNext = () => current < spreads.length - 1 && navigateTo(spreads[current + 1].route);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const from = flip ? spreads[flip.fromIdx] : null;
  const to = flip ? spreads[flip.toIdx] : null;
  const shown = spreads[displayed];

  // Statisk innhold under bladet som vender seg (se kommentar over leaf-rendering).
  let leftUnder: ReactNode;
  let rightUnder: ReactNode;
  let singleUnder: ReactNode;
  if (flip && from && to) {
    if (flip.dir === 1) {
      leftUnder = renderSide(from, 'left');
      rightUnder = renderSide(to, 'right');
      singleUnder = renderSide(to, 'single');
    } else {
      leftUnder = renderSide(to, 'left');
      rightUnder = renderSide(from, 'right');
      singleUnder = renderSide(from, 'single');
    }
  } else {
    leftUnder = renderSide(shown, 'left');
    rightUnder = renderSide(shown, 'right');
    singleUnder = renderSide(shown, 'single');
  }

  return (
    <div className="book-scene">
      <div className="book-wrap">
        <div className="book" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {isSpread ? (
          <>
            <div className="page-half left">{leftUnder}</div>
            <div className="page-half right">{rightUnder}</div>
          </>
        ) : (
          <div className="page-single">{singleUnder}</div>
        )}

        {flip && from && to && isSpread && (
          /*
           * Bladet som vender seg bærer to sider: forsiden viser gammel
           * høyreside (framover) og baksiden viser ny venstreside — når det
           * lander er baksiden identisk med den statiske venstresiden, så
           * fjerningen av bladet er usynlig.
           */
          <motion.div
            className="leaf"
            initial={{ rotateY: flip.dir === 1 ? 0 : -180 }}
            animate={{ rotateY: flip.dir === 1 ? -180 : 0 }}
            transition={FLIP_TRANSITION}
            onAnimationComplete={finishFlip}
          >
            <div className="leaf-face front">
              {renderSide(flip.dir === 1 ? from : to, 'right')}
            </div>
            <div className="leaf-face back">
              {renderSide(flip.dir === 1 ? to : from, 'left')}
            </div>
          </motion.div>
        )}

        {flip && from && to && !isSpread && (
          /* Mobil: hele siden løftes og blafres bort mot venstre. */
          <motion.div
            className="leaf single"
            initial={
              flip.dir === 1 ? { rotateY: 0, opacity: 1 } : { rotateY: -110, opacity: 0 }
            }
            animate={
              flip.dir === 1
                ? { rotateY: -110, opacity: [1, 1, 0] }
                : { rotateY: 0, opacity: [0, 1, 1] }
            }
            transition={FLIP_TRANSITION}
            onAnimationComplete={finishFlip}
          >
            <div className="leaf-face front">
              {renderSide(flip.dir === 1 ? from : to, 'single')}
            </div>
          </motion.div>
        )}

        {current > 0 && (
          <button type="button" className="corner prev" aria-label="Forrige side" onClick={goPrev} />
        )}
          {current < spreads.length - 1 && (
            <button type="button" className="corner next" aria-label="Neste side" onClick={goNext} />
          )}
        </div>
        <Tabs spreads={spreads} activeIdx={current} />
      </div>
    </div>
  );
}
