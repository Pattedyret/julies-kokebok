import { MotionConfig } from 'framer-motion';
import { Book } from './book/Book';
import { HandlelisteProvider } from './state/HandlelisteContext';
import { RecipesProvider } from './state/RecipesContext';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RecipesProvider>
        <HandlelisteProvider>
          <Book />
        </HandlelisteProvider>
      </RecipesProvider>
    </MotionConfig>
  );
}
