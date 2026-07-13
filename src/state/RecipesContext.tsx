import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { SEED_RECIPES } from '../data/seedRecipes';
import { KEYS, isRecipeArray, safeGet, safeSet } from '../lib/storage';
import type { Recipe } from '../lib/types';

type RecipesApi = {
  recipes: Recipe[];
  julieRecipes: Recipe[];
  addRecipe: (r: Recipe) => void;
  updateRecipe: (r: Recipe) => void;
  removeRecipe: (id: string) => void;
  importRecipes: (rs: Recipe[]) => void;
};

const RecipesContext = createContext<RecipesApi | undefined>(undefined);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [userRecipes, setUserRecipes] = useState<Recipe[]>(
    () => safeGet(KEYS.recipes, isRecipeArray) ?? [],
  );

  // Lagring skjer i selve mutasjonen — aldri i en effect. En skriv-på-mount
  // ville overskrevet lagrede data med [] hvis de ikke lot seg lese/validere.
  const mutate = (fn: (prev: Recipe[]) => Recipe[]) =>
    setUserRecipes((prev) => {
      const next = fn(prev);
      safeSet(KEYS.recipes, next);
      return next;
    });

  const api = useMemo<RecipesApi>(
    () => ({
      recipes: [...SEED_RECIPES, ...userRecipes],
      julieRecipes: userRecipes,
      addRecipe: (r) => mutate((prev) => [...prev, { ...r, source: 'julie' }]),
      updateRecipe: (r) =>
        mutate((prev) => prev.map((p) => (p.id === r.id ? { ...r, source: 'julie' } : p))),
      removeRecipe: (id) => mutate((prev) => prev.filter((p) => p.id !== id)),
      importRecipes: (rs) =>
        mutate((prev) => {
          const imported = rs.filter((r) => r.source === 'julie');
          const importedIds = new Set(imported.map((r) => r.id));
          return [...prev.filter((p) => !importedIds.has(p.id)), ...imported];
        }),
    }),
    [userRecipes],
  );

  return <RecipesContext.Provider value={api}>{children}</RecipesContext.Provider>;
}

export function useRecipes(): RecipesApi {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error('useRecipes must be used inside RecipesProvider');
  return ctx;
}
