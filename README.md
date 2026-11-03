# Till minne av

En stilla plats för små tankar om dem vi saknar. Minnen driver över skärmen; besökare kan söka på namnet på personen som minns, läsa ett minne eller lämna ett eget. Ett minne kan sparas i minnesplatsen eller släppas "ut i tomheten" utan att sparas.

Det började som en prototyp i en enda fil. Originalet finns kvar i git-historiken. Frontend ligger nu i tre filer (`index.html`, `styles.css` och `app.js`) och backend är ett litet Sinatra-API med SQLite.

## Teknik

- **Sinatra 4 + Puma** för webbserver och JSON-API
- **SQLite** via `sqlite3`-gemet
- **Ren HTML, CSS och JavaScript** – inget byggsteg
- **Google Fonts** (Cormorant Garamond och Inter) med systemtypsnitt som reserv

## Köra projektet

Du behöver Ruby 3.2+ och Bundler.

```bash
bundle config set --local path vendor/bundle
bundle install
bundle exec ruby app.rb
```

Öppna <http://127.0.0.1:4567>.

Du kan också köra via Rack:

```bash
bundle exec rackup -p 4567
```

Vid första starten skapar appen `db/memorial.db` och fyller den med prototypens demominnen. För att börja med en tom minnesplats:

```bash
SEED_DEMO=false bundle exec ruby app.rb
```

För att använda en annan databasfil:

```bash
DATABASE_PATH=/tmp/till-minne-av.db bundle exec ruby app.rb
```

### Miljövariabler

| Variabel | Standard | Syfte |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Adress att lyssna på |
| `PORT` | `4567` | HTTP-port |
| `DATABASE_PATH` | `db/memorial.db` | Sökväg till SQLite-filen |
| `SEED_DEMO` | ej satt | Sätt till `false` för att hoppa över demominnen |
| `RATE_LIMIT` | `10` | Tillåtna POST-anrop per IP och tidsfönster |
| `RATE_WINDOW` | `600` | Tidsfönstret för begränsningen i sekunder |

## Projektstruktur

```
.
├── app.rb                  Sinatra-app och JSON-rutter
├── config.ru               Rack-ingång
├── Gemfile
├── db/
│   ├── schema.sql          SQLite-schema
│   ├── seeds.rb            Prototypens ursprungliga minnen
│   └── memorial.db         Skapas vid första starten (ignoreras av git)
├── lib/
│   ├── database.rb         SQLite-frågor och serialisering
│   └── rate_limiter.rb     Liten begränsning av POST-anrop i minnet
└── public/
    ├── index.html          De tre frontendfilerna
    ├── styles.css
    └── app.js
```

## API

Alla API-svar är JSON. Frontend ligger på samma origin, så något CORS-lager behövs inte.

### `GET /api/health`

```json
{ "status": "ok", "memories": 14 }
```

### `GET /api/memories`

Frågeparametrar:

- `limit` – 1 till 500, standard 500
- `offset` – standard 0
- `q` – valfri sökning på namn, utan hänsyn till versaler och gemener

```json
{
  "memories": [
    {
      "id": 1,
      "text": "Hon nynnade medan hon lagade mat...",
      "for_name": "Margareta Lindqvist",
      "by_name": "Anna",
      "created_at": "2026-10-25T09:00:00Z"
    }
  ],
  "total": 14,
  "names": ["Eli", "Farfar Olle", "Ingrid", "Margareta Lindqvist", "Sami", "Tobias Ek"],
  "limit": 500,
  "offset": 0
}
```

### `POST /api/memories`

```bash
curl -X POST http://127.0.0.1:4567/api/memories \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Du sparade alltid sista biten kaka till mig.",
    "for_name": "Mormor",
    "by_name": "Teo"
  }'
```

Returnerar `201 Created` med det sparade minnet. Validering:

- `text` krävs, trimmas och får vara högst 400 tecken.
- `for_name` och `by_name` är valfria och får vara högst 80 tecken.
- JSON-kroppen får vara högst 8 kB.
- Inskickningar begränsas till 10 per IP och 10 minuter som standard. Begränsningen sker i minnet, så den nollställs när processen startas om.

## Integritet

Alternativen "Håll deras namn privat" och "Skicka anonymt" hanteras i webbläsaren: namnet skickas **inte alls till servern** när något av dem är ikryssat. Databasen lagrar bara namn som medvetet skickats in. Saknade namn visas med de översatta etiketterna för anonyma namn.

Servern renderar aldrig användartext som HTML. Frontend lägger in minnen med `textContent`, så inskickad text kan inte injicera markup.

## Databas

```sql
CREATE TABLE memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL CHECK (length(trim(text)) BETWEEN 1 AND 400),
  for_name TEXT CHECK (for_name IS NULL OR length(for_name) <= 80),
  by_name TEXT CHECK (by_name IS NULL OR length(by_name) <= 80),
  created_at TEXT NOT NULL
);
```

Databasen använder WAL-läge och en mutex runt frågorna, vilket räcker för den här prototypen med en enda process.

Så här återställer du den lokala databasen:

```bash
rm -f db/memorial.db db/memorial.db-shm db/memorial.db-wal
```

## Frontend

- Gränssnittet är som standard på svenska. Språkmenyn uppe till höger byter till engelska och kommer ihåg valet i `localStorage`; minnestexterna visas som de skrevs.
- Fältet laddar upp till 500 minnen och filtrerar på namnet i webbläsaren. På desktop driver ett urval i skärmstorlek så att meddelandena förblir läsbara i stället för att staplas; sökningen når ändå alla laddade minnen. API:t stöder också `q` för framtida sökning på servern.
- Några sökträffar lägger sig i ett centrerat rutnät. Större träfflistor glider in i ett rullbart tvåkolumnsrutnät, så varje träff går att nå. När sökningen rensas tonar träffarna bort och fältet börjar driva igen.
- Klick på ett minne öppnar hela texten, signaturen och det relativa datumet.
- Formulärets "Ut i tomheten" anropar aldrig API:t.
- `prefers-reduced-motion` gör det drivande fältet till en vanlig, rullbar lista, och smala skärmar använder samma läsbara listlayout. Båda listlägena visar alla laddade minnen.
- Dialoger fångar fokus, Escape stänger dem och meddelandena är riktiga knappar för tangentbordsanvändare.
- Inga byggverktyg behövs för frontend.

## Möjliga nästa steg

- En modereringsvy med autentisering och mjuk borttagning
- Paginering eller oändlig laddning på servern när minnesplatsen växer
- Beständig begränsning av anrop (till exempel med Redis) för driftsättning med flera processer
- Automatiska tester för API:t och databaslagret
- Driftsättning med beständig lagring för `db/memorial.db` och regelbundna säkerhetskopior
