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

## Publicera på Render

Repot innehåller en Render Blueprint (`render.yaml`) som skapar en webbtjänst i Ruby-miljön.

1. Skapa ett konto på <https://render.com> och koppla ditt GitHub-konto.
2. Öppna <https://render.com/deploy?repo=https://github.com/Mr-Sniff/till-minne-av>.
3. Granska tjänsten och klicka **Deploy Blueprint**.

Render bygger med `bundle install` och startar med `bundle exec ruby app.rb`. `HOST` sätts till `0.0.0.0` så att Renders proxy når servern, och `DATABASE_PATH` pekar på `data/memorial.db` i projektet. Adressen blir normalt `https://till-minne-av.onrender.com` och visas i dashboarden.

### Gratis plan

Blueprinten använder `plan: free`:

- Tjänsten sover efter cirka 15 minuters inaktivitet. Första besöket efter vilan kan ta upp till en minut.
- Lagringen är tillfällig. `data/memorial.db` återskapas med demominnen vid varje deploy och omstart, så riktiga minnen försvinner.

### Uppgradera till beständig lagring

Ändra i `render.yaml` så att tjänsten får en betald instans och en disk:

```yaml
    plan: 0.5c-512mb   # $7/mån
    disk:
      name: memorial-data
      mountPath: /opt/render/project/src/data
      sizeGB: 1        # $0.25/mån
```

Commit och pusha ändringen. Render uppdaterar tjänsten och monterar disken på samma katalog som `DATABASE_PATH` pekar på, så databasen finns kvar mellan deploys. Disken kräver en betald instans och ett betalkort i Render.

För att starta med en tom minnesplats sätter du `SEED_DEMO` till `false` i `render.yaml` innan första deployen.

## Köra i GitHub Codespaces

Repot har en devcontainer, så appen kan köras i GitHub Codespaces utan lokal Ruby-installation.

1. Öppna repot på GitHub och välj **Code → Codespaces → Create codespace on main**.
2. Första gången installeras gemmen automatiskt, och servern startar på port 4567.
3. Öppna fliken **Ports** och klicka på länken för port 4567. Porten är satt till **Public**, så alla med länken kan öppna sidan.

Om servern inte skulle köra:

```bash
bundle exec ruby app.rb
```

Loggen från bakgrundsstarten finns i `/tmp/till-minne-av.log`.

### Lagring och livslängd

`db/memorial.db` ligger i codespacens arbetsyta och finns kvar när codespacen stoppas och startas igen. Filen försvinner om codespacen raderas – GitHub tar som standard bort codespaces efter 30 dagars inaktivitet. Säkerhetskopiera databasen så här:

```bash
gh codespace cp -e 'remote:db/memorial.db' ./db/memorial.db
```

En codespace är alltså en tillfällig server. När den stoppas (efter 30 minuters inaktivitet som standard) slutar sidan svara. För en permanent sajt behövs en host som Render eller Fly.io med beständig lagring.

## Projektstruktur

```
.
├── app.rb                  Sinatra-app och JSON-rutter
├── config.ru               Rack-ingång
├── Gemfile
├── .devcontainer/          GitHub Codespaces-konfiguration
├── .ruby-version           Ruby-version för Render
├── render.yaml             Render Blueprint
├── db/
│   ├── schema.sql          SQLite-schema
│   ├── seeds.rb            Prototypens ursprungliga minnen
│   └── memorial.db         Skapas vid första starten (ignoreras av git)
├── data/                   Databas i Render (skapas vid körning, ignoreras av git)
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

- Gränssnittet är som standard på svenska. Språkmenyn uppe till höger byter till engelska och kommer ihåg valet i `localStorage`; minnestexterna visas som de skrevs. Temaikonen intill växlar mellan mörkt och ljust tema, sparar valet i `localStorage` och följer systemets inställning tills du väljer själv.
- Fältet laddar upp till 500 minnen och filtrerar på namnet i webbläsaren. Minnesrader driver över en canvas som är två skärmar bred och börjar i mitten, så du kan scrolla i sidled åt båda hållen; scrolla nedåt för fler rader. Nästa sats laddas när du når botten, och rader utanför skärmen pausas. Sökningen når ändå alla laddade minnen. API:t stöder också `q` för framtida sökning på servern.
- På touchskärmar pausas driften medan fingret vilar på fältet, så att ett minne går att trycka på.
- Sökträffar läggs i ett centrerat rutnät: två kolumner på desktop och en kolumn på mobil. Större träfflistor blir rullbara. När sökningen rensas tonar träffarna bort och fältet börjar driva igen.
- Klick på ett minne öppnar hela texten, signaturen och det relativa datumet.
- Formulärets "Ut i tomheten" anropar aldrig API:t.
- `prefers-reduced-motion` gör det drivande fältet till en vanlig, rullbar lista med alla laddade minnen.
- Dialoger fångar fokus, Escape stänger dem och meddelandena är riktiga knappar för tangentbordsanvändare.
- Inga byggverktyg behövs för frontend.

## Möjliga nästa steg

- En modereringsvy med autentisering och mjuk borttagning
- Paginering eller oändlig laddning på servern när minnesplatsen växer
- Beständig begränsning av anrop (till exempel med Redis) för driftsättning med flera processer
- Automatiska tester för API:t och databaslagret
- Driftsättning med beständig lagring för `db/memorial.db` och regelbundna säkerhetskopior
