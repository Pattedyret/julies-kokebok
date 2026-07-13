import { HandlelisteProvider } from './state/HandlelisteContext';
import { RecipesProvider } from './state/RecipesContext';

export default function App() {
  return (
    <RecipesProvider>
      <HandlelisteProvider>
        <main style={{ padding: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-hand)', fontSize: '3rem' }}>Julies kokebok ♥</h1>
          <p>Blåbærsyltetøy &amp; vafler, æøå ÆØÅ</p>
        </main>
      </HandlelisteProvider>
    </RecipesProvider>
  );
}
