import { formatAmount, scaleAmount } from './scaling';
import type { Recipe } from './types';

export type ListItem = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  name: string;
  unit?: string;
  amount?: number;
  checked: boolean;
};

export type MergedLine = { name: string; unit?: string; amount?: number };

const defaultId = () => crypto.randomUUID();
const keyOf = (name: string, unit?: string) => `${name.trim().toLowerCase()}|${unit ?? ''}`;

export function addRecipeToList(
  items: ListItem[],
  recipe: Recipe,
  targetPortions: number,
  makeId: () => string = defaultId,
): ListItem[] {
  const next = items.map((i) => ({ ...i }));
  for (const ing of recipe.ingredients) {
    const amount =
      ing.amount !== undefined && ing.scalable
        ? scaleAmount(ing.amount, recipe.portions, targetPortions)
        : ing.amount;
    const existing = next.find(
      (i) => i.recipeId === recipe.id && keyOf(i.name, i.unit) === keyOf(ing.name, ing.unit),
    );
    if (existing && existing.amount !== undefined && amount !== undefined) {
      existing.amount += amount;
      existing.checked = false;
    } else if (!existing) {
      next.push({
        id: makeId(),
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        name: ing.name,
        unit: ing.unit,
        amount,
        checked: false,
      });
    }
  }
  return next;
}

export function toggleItem(items: ListItem[], id: string): ListItem[] {
  return items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
}

export function clearList(): ListItem[] {
  return [];
}

export function clearChecked(items: ListItem[]): ListItem[] {
  return items.filter((i) => !i.checked);
}

export function mergeForShare(items: ListItem[]): MergedLine[] {
  const lines = new Map<string, MergedLine>();
  for (const item of items) {
    if (item.checked) continue;
    const key = keyOf(item.name, item.unit);
    const existing = lines.get(key);
    if (existing && existing.amount !== undefined && item.amount !== undefined) {
      existing.amount += item.amount;
    } else if (!existing) {
      lines.set(key, { name: item.name, unit: item.unit, amount: item.amount });
    }
  }
  return [...lines.values()];
}

export function buildShareText(items: ListItem[]): string {
  const lines = mergeForShare(items).map((l) => {
    const qty = l.amount !== undefined ? `${formatAmount(l.amount)}${l.unit ? ` ${l.unit}` : ''} ` : '';
    return `• ${qty}${l.name}`;
  });
  return `Handleliste 🛒\n\n${lines.join('\n')}`;
}
