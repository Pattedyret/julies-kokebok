import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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

  useEffect(() => {
    safeSet(KEYS.recipes, userRecipes);
  }, [userRecipes]);

  const api = useMemo<RecipesApi>(
    () => ({
      recipes: [...SEED_RECIPES, ...userRecipes],
      julieRecipes: userRecipes,
      addRecipe: (r) => setUserRecipes((prev) => [...prev, { ...r, source: 'julie' }]),
      updateRecipe: (r) =>
        setUserRecipes((prev) => prev.map((p) => (p.id === r.id ? { ...r, source: 'julie' } : p))),
      removeRecipe: (id) => setUserRecipes((prev) => prev.filter((p) => p.id !== id)),
      importRecipes: (rs) =>
        setUserRecipes((prev) => {
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
