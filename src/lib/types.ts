export type CategoryId = 'frokost' | 'middag' | 'bakst' | 'smaretter' | 'drikke';

export type Ingredient = {
  amount?: number;
  unit?: string;
  name: string;
  scalable: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  category: CategoryId;
  portions: number;
  ingredients: Ingredient[];
  steps: string[];
  note?: string;
  source: 'seed' | 'julie';
};
