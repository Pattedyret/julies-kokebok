import type { CategoryId } from '../lib/types';

export type Category = { id: CategoryId; label: string; tabColor: string; emoji: string };

export const CATEGORIES: Category[] = [
  { id: 'frokost', label: 'Frokost', tabColor: '#f2c4cc', emoji: '🥞' },
  { id: 'middag', label: 'Middag', tabColor: '#bcd9c0', emoji: '🍲' },
  { id: 'bakst', label: 'Bakst & dessert', tabColor: '#f5d9a8', emoji: '🧁' },
  { id: 'smaretter', label: 'Småretter', tabColor: '#c9d7ea', emoji: '🥪' },
  { id: 'drikke', label: 'Drikke', tabColor: '#e3c9ea', emoji: '☕' },
];
