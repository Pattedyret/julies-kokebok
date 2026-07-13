import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { PageChrome, type PageSide } from '../book/PageChrome';
import { navigateTo } from '../book/spreads';
import { EDITING_KEY } from './EditorPage';
import { CoffeeRing } from '../components/Doodles';
import { HeartBurst } from '../components/HeartBurst';
import { HeartRating } from '../components/HeartRating';
import { PortionStepper } from '../components/PortionStepper';
import { RecipePhoto } from '../components/RecipePhoto';
import { formatAmount, scaleAmount } from '../lib/scaling';
import type { Ingredient, Recipe } from '../lib/types';
import { useHandleliste } from '../state/HandlelisteContext';
import { useRatings } from '../state/RatingsContext';

function IngredientRow({
  ing,
  recipe,
  portions,
  animateHighlight,
}: {
  ing: Ingredient;
  recipe: Recipe;
  portions: number;
  animateHighlight: boolean;
}) {
  return (
    <li className={ing.scalable ? undefined : 'etter-smak'}>
      {ing.amount !== undefined && (
        <motion.span
          key={portions}
          className="ing-amount"
          initial={animateHighlight ? { backgroundColor: 'rgba(242, 196, 204, 0.9)' } : false}
          animate={{ backgroundColor: 'rgba(242, 196, 204, 0)' }}
          transition={{ duration: 0.5 }}
        >
          {formatAmount(
            ing.scalable ? scaleAmount(ing.amount, recipe.portions, portions) : ing.amount,
          )}
          {ing.unit ? ` ${ing.unit}` : ''}
        </motion.span>
      )}{' '}
      {ing.name}
    </li>
  );
}

export function RecipeSpread({ side, recipe }: { side: PageSide; recipe: Recipe }) {
  const { addRecipe } = useHandleliste();
  const { ratings, setRating } = useRatings();
  const [portions, setPortions] = useState(recipe.portions);
  const [burst, setBurst] = useState(0);
  const [added, setAdded] = useState(false);
  const addTimer = useRef<number | undefined>(undefined);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => window.clearTimeout(addTimer.current);
  }, []);

  const onAdd = () => {
    addRecipe(recipe, portions);
    setBurst((b) => b + 1);
    setAdded(true);
    window.clearTimeout(addTimer.current);
    addTimer.current = window.setTimeout(() => setAdded(false), 1400);
  };

  const leftInner = (
    <div className="recipe-page">
      <h2 className="recipe-title">{recipe.title}</h2>
      {recipe.source === 'julie' && (
        <span className="julie-mark">
          skrevet av Julie ✎{' '}
          <button
            type="button"
            className="hl-link"
            onClick={() => {
              try {
                sessionStorage.setItem(EDITING_KEY, recipe.id);
              } catch {
                /* uviktig */
              }
              navigateTo('ny-oppskrift');
            }}
          >
            rediger
          </button>
        </span>
      )}
      <PortionStepper value={portions} onChange={setPortions} />
      <HeartRating value={ratings[recipe.id] ?? 0} onChange={(n) => setRating(recipe.id, n)} />
      <h3 className="ing-heading">Ingredienser</h3>
      <ul className="ing-list">
        {recipe.ingredients.map((ing, i) => (
          <IngredientRow
            key={i}
            ing={ing}
            recipe={recipe}
            portions={portions}
            animateHighlight={mounted.current}
          />
        ))}
      </ul>
      <div className="add-wrap">
        <button type="button" className="washi-btn" onClick={onAdd}>
          {added ? 'Lagt til! ♥' : 'Legg til i handleliste'}
        </button>
        <HeartBurst burst={burst} />
      </div>
    </div>
  );

  const rightInner = (
    <div className="recipe-page">
      {/* et kaffemerke her og der — deterministisk, ikke på alle sider */}
      {recipe.id.length % 2 === 0 && <CoffeeRing className="coffee-ring" />}
      <h3 className="steps-heading">Slik gjør du</h3>
      <ol className="steps">
        {recipe.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {recipe.note && <p className="sticky-note">{recipe.note}</p>}
      <RecipePhoto recipeId={recipe.id} title={recipe.title} />
    </div>
  );

  if (side === 'left') return <PageChrome side="left">{leftInner}</PageChrome>;
  if (side === 'right') return <PageChrome side="right">{rightInner}</PageChrome>;
  return (
    <PageChrome side="single">
      {leftInner}
      <hr className="page-divider" />
      {rightInner}
    </PageChrome>
  );
}
