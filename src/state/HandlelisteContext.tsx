import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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

  useEffect(() => {
    safeSet(KEYS.handleliste, items);
  }, [items]);

  const api = useMemo<HandlelisteApi>(
    () => ({
      items,
      addRecipe: (recipe, portions) => setItems((prev) => addRecipeToList(prev, recipe, portions)),
      toggle: (id) => setItems((prev) => toggleItem(prev, id)),
      clearAll: () => setItems(clearList()),
      clearChecked: () => setItems((prev) => clearChecked(prev)),
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
