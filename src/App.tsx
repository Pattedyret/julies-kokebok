import { MotionConfig } from 'framer-motion';
import { Book } from './book/Book';
import { HandlelisteProvider } from './state/HandlelisteContext';
import { RatingsProvider } from './state/RatingsContext';
import { RecipesProvider } from './state/RecipesContext';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RecipesProvider>
        <HandlelisteProvider>
          <RatingsProvider>
            <Book />
          </RatingsProvider>
        </HandlelisteProvider>
      </RecipesProvider>
    </MotionConfig>
  );
}
