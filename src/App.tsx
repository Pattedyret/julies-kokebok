import { Book } from './book/Book';
import { HandlelisteProvider } from './state/HandlelisteContext';
import { RecipesProvider } from './state/RecipesContext';

export default function App() {
  return (
    <RecipesProvider>
      <HandlelisteProvider>
        <Book />
      </HandlelisteProvider>
    </RecipesProvider>
  );
}
