import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { KEYS, isRatingsMap, safeGet, safeSet } from '../lib/storage';

type RatingsApi = {
  ratings: Record<string, number>;
  setRating: (recipeId: string, hearts: number) => void; // 0 fjerner
  removeRating: (recipeId: string) => void;
  importRatings: (incoming: Record<string, number>) => void;
};

const RatingsContext = createContext<RatingsApi | undefined>(undefined);

export function RatingsProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState<Record<string, number>>(
    () => safeGet(KEYS.ratings, isRatingsMap) ?? {},
  );

  // Som i de andre kontekstene: lagring skjer i mutasjonen, aldri på mount.
  const mutate = (fn: (prev: Record<string, number>) => Record<string, number>) =>
    setRatings((prev) => {
      const next = fn(prev);
      safeSet(KEYS.ratings, next);
      return next;
    });

  const api = useMemo<RatingsApi>(
    () => ({
      ratings,
      setRating: (recipeId, hearts) =>
        mutate((prev) => {
          if (hearts < 1) {
            const { [recipeId]: _fjernet, ...rest } = prev;
            return rest;
          }
          return { ...prev, [recipeId]: Math.min(5, Math.round(hearts)) };
        }),
      removeRating: (recipeId) =>
        mutate((prev) => {
          const { [recipeId]: _fjernet, ...rest } = prev;
          return rest;
        }),
      importRatings: (incoming) => mutate((prev) => ({ ...prev, ...incoming })),
    }),
    [ratings],
  );

  return <RatingsContext.Provider value={api}>{children}</RatingsContext.Provider>;
}

export function useRatings(): RatingsApi {
  const ctx = useContext(RatingsContext);
  if (!ctx) throw new Error('useRatings must be used inside RatingsProvider');
  return ctx;
}
