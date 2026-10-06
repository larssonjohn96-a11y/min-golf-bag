# Min Golfbag

Samla dina klubbor och slaglängder digitalt. Jämför med andra golfare.

Fristående svensk React-app. Utrustning, mappning, gapanalys och jämförelsevyn är extraherade från `larssonjohn96-a11y/swing-score-card` (commit `b64a9fc08317ba48a6a72fd4d6e7976a6f523870`). SG4:s tester och backend ingår inte.

## Kör lokalt

Kräver Node.js 22.12+ eller 24.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## Funktioner

- Bag med upp till 14 klubbor, utrustningsspecifikationer och redigering.
- Spara utrustning direkt eller mappa carry och sidled. Utkast sparas automatiskt.
- Median från de senaste tio godkända slagen, gapanalys, historik och ommappning.
- Jämför carry och WITB med en importerad kompisbag. HCP-/Tour-referenser från SG4 är tydligt märkta som illustrativa, inte verifierad statistik.
- Export/import av aktuell bag i ett validerat JSON-format. Import lägger till en ny aktuell bag och bevarar tidigare historik.

## Data och begränsningar

Data lagras i webbläsarens localStorage under `min-golfbag:*`. Ingen inloggning, databas eller hemlig nyckel krävs. Exportera aktuell bag innan webbläsardata rensas; exporten innehåller inte hela historiken. SG4-data på andra domäner migreras inte automatiskt. Automatisk molnsynkning och vänlista är framtida arbete; vänjämförelse fungerar nu genom bagfiler.

Bagindex och justeringar för temperatur/höjd är ärvda heuristiker, inte officiellt handicap eller en kalibrerad bollflyktsmodell. Benchmarks behöver källvalideras innan de presenteras som populationsdata.

## Hosting

`npm run build` skapar `dist/`. Publicera på valfri statisk host med SPA-fallback till `index.html`. Konfiguration för Netlify (`public/_redirects`) och Vercel (`vercel.json`) ingår. GitHub-repot i sig publicerar inte en körbar webbapp.
