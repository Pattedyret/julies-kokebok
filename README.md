# Julies kokebok 📖♥

En digital notatbok-kokebok laget til Julie — med bla-animasjon, porsjonsskalering,
handleliste, hjertevurderinger, innlimte bilder og hennes egne oppskriftssider.

**Live:** https://pattedyret.github.io/julies-kokebok/

## Slik legger du inn oppskriftene fra notatboka

Alle «faste» oppskrifter bor i [`src/data/seedRecipes.ts`](src/data/seedRecipes.ts).
Kopiér en eksisterende oppskrift-blokk og fyll inn:

```ts
{
  id: 'mormors-boller',            // unik slug
  title: 'Mormors boller',
  category: 'bakst',               // frokost | middag | bakst | smaretter | drikke
  portions: 4,                     // antallet mengdene er skrevet for
  ingredients: [
    { amount: 500, unit: 'g', name: 'hvetemel', scalable: true },
    { name: 'kardemomme, etter smak', scalable: false },   // skaleres aldri
  ],
  steps: ['Gjør ditt', 'Gjør datt'],
  note: 'Valgfri liten lapp ♥',    // vises som gul huskelapp
  source: 'seed',
},
```

Push til `main` → GitHub Actions bygger og deployer automatisk.

## Personlig hilsen

Dedikasjonssiden («Til Julie ♥») redigeres øverst i
[`src/pages/DedicationPage.tsx`](src/pages/DedicationPage.tsx) — se kommentaren
`PERSONLIG HILSEN`.

## Julies egne oppskrifter

Oppskrifter lagt til i appen («Legg til oppskrift») lagres i nettleseren på enheten
hennes (`localStorage`); hjertevurderinger likeså, og innlimte bilder lagres i
IndexedDB. Ingenting synkroniseres mellom enheter — derfor tar sikkerhetskopien på
«Om boka»-siden (bakerst i boka) med både oppskrifter, hjerter og bilder.

## Utvikling

```bash
npm install
npm run dev        # dev-server
npm test           # vitest (skalering, lagring, handleliste, oppslag)
npm run build      # typecheck + produksjonsbygg
```

Stack: Vite · React · TypeScript · framer-motion. Ingen backend.
