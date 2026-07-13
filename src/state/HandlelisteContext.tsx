import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  addRecipeToList,
  clearChecked,
  clearList,
  toggleItem,
  type ListItem,
} from '../lib/handleliste';
import { KEYS, isListItemArray, safeGet, safeSet } from '../lib/storage';
import type { Recipe } from '../lib/types';

type HandlelisteApi = {
  items: ListItem[];
  addRecipe: (recipe: Recipe, portions: number) => void;
  toggle: (id: string) => void;
  clearAll: () => void;
  clearChecked: () => void;
};

const HandlelisteContext = createContext<HandlelisteApi | undefined>(undefined);

export function HandlelisteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ListItem[]>(
    () => safeGet(KEYS.handleliste, isListItemArray) ?? [],
  );

  // Som i RecipesContext: lagring skjer i mutasjonen, aldri på mount.
  const mutate = (fn: (prev: ListItem[]) => ListItem[]) =>
    setItems((prev) => {
      const next = fn(prev);
      safeSet(KEYS.handleliste, next);
      return next;
    });

  const api = useMemo<HandlelisteApi>(
    () => ({
      items,
      addRecipe: (recipe, portions) => mutate((prev) => addRecipeToList(prev, recipe, portions)),
      toggle: (id) => mutate((prev) => toggleItem(prev, id)),
      clearAll: () => mutate(() => clearList()),
      clearChecked: () => mutate((p) => clearChecked(p)),
    }),
    [items],
  );

  return <HandlelisteContext.Provider value={api}>{children}</HandlelisteContext.Provider>;
}

export function useHandleliste(): HandlelisteApi {
  const ctx = useContext(HandlelisteContext);
  if (!ctx) throw new Error('useHandleliste must be used inside HandlelisteProvider');
  return ctx;
}
