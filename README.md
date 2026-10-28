# Remembered

A quiet place for small thoughts about the ones we miss. Memories drift across the screen; visitors can search by the name of the person remembered, read a memory, or leave one of their own. A memory can be kept in the memorial or released "into the void" without being saved.

This started as a single-file prototype. The original is preserved in git history. The frontend now lives in three files (`index.html`, `styles.css`, `app.js`) and the backend is a small Sinatra API backed by SQLite.

## Stack

- **Sinatra 4 + Puma** for the web server and JSON API
- **SQLite** via the `sqlite3` gem
- **Vanilla HTML, CSS and JavaScript** — no build step
- **Google Fonts** (Cormorant Garamond and Inter) with system fallbacks

## Run it

You need Ruby 3.2+ and Bundler.

```bash
bundle config set --local path vendor/bundle
bundle install
bundle exec ruby app.rb
```

Open <http://127.0.0.1:4567>.

You can also run it through Rack:

```bash
bundle exec rackup -p 4567
```

On first boot the app creates `db/memorial.db` and seeds it with the prototype's demo memories. To start with an empty memorial:

```bash
SEED_DEMO=false bundle exec ruby app.rb
```

To use a different database file:

```bash
DATABASE_PATH=/tmp/remembered.db bundle exec ruby app.rb
```

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Bind address |
| `PORT` | `4567` | HTTP port |
| `DATABASE_PATH` | `db/memorial.db` | SQLite file location |
| `SEED_DEMO` | unset | Set to `false` to skip demo memories |
| `RATE_LIMIT` | `10` | Allowed POSTs per IP per window |
| `RATE_WINDOW` | `600` | Rate-limit window in seconds |

## Project layout

```
.
├── app.rb                  Sinatra app and JSON routes
├── config.ru               Rack entry point
├── Gemfile
├── db/
│   ├── schema.sql          SQLite schema
│   ├── seeds.rb            Original prototype memories
│   └── memorial.db         Created on first boot (gitignored)
├── lib/
│   ├── database.rb         SQLite queries and serialization
│   └── rate_limiter.rb     Small in-memory POST limiter
└── public/
    ├── index.html          The three frontend files
    ├── styles.css
    └── app.js
```

## API

All API responses are JSON. The frontend is same-origin, so no CORS layer is needed.

### `GET /api/health`

```json
{ "status": "ok", "memories": 14 }
```

### `GET /api/memories`

Query parameters:

- `limit` — 1 to 500, default 500
- `offset` — default 0
- `q` — optional case-insensitive name search

```json
{
  "memories": [
    {
      "id": 1,
      "text": "She hummed while she cooked...",
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
    "text": "You always saved me the last piece of cake.",
    "for_name": "Mormor",
    "by_name": "Teo"
  }'
```

Returns `201 Created` with the stored memory. Validation:

- `text` is required, trimmed, and limited to 400 characters.
- `for_name` and `by_name` are optional and limited to 80 characters.
- The JSON body is limited to 8 KB.
- Submissions are limited to 10 per IP per 10 minutes by default. The limiter is in-memory, so it resets when the process restarts.

## Privacy

The "keep their name private" and "send anonymously" options are handled in the browser: the name is **not sent to the server at all** when either option is checked. The database only stores names that were deliberately submitted. Missing names are rendered with the localized anonymous labels.

The server never renders user text as HTML. The frontend inserts memories with `textContent`, so submitted text cannot inject markup.

## Database

```sql
CREATE TABLE memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL CHECK (length(trim(text)) BETWEEN 1 AND 400),
  for_name TEXT CHECK (for_name IS NULL OR length(for_name) <= 80),
  by_name TEXT CHECK (by_name IS NULL OR length(by_name) <= 80),
  created_at TEXT NOT NULL
);
```

The database uses WAL mode and a mutex around queries, which is enough for this single-process prototype.

To reset the local database:

```bash
rm -f db/memorial.db db/memorial.db-shm db/memorial.db-wal
```

## Frontend notes

- The interface defaults to Swedish. The top-right language menu switches it to English and remembers the choice in `localStorage`; memory texts are shown as written.
- The field loads up to 500 memories and filters by remembered name in the browser. On desktop it drifts a viewport-sized sample so messages stay readable instead of piling up; search still reaches every loaded memory. The API also supports `q` for future server-side search.
- A few search results settle into a centered grid. Larger result sets slide into a scrollable two-column grid, so every match is reachable. Clearing the search fades the results away and returns to the drift.
- Clicking a memory opens its full text, byline, and relative date.
- The form's "Into the void" option never calls the API.
- `prefers-reduced-motion` turns the drifting field into a normal, scrollable list, and narrow screens use the same readable list layout. Both list modes show every loaded memory.
- Dialogs trap focus, Escape closes them, and messages are real buttons for keyboard users.
- No frontend build tools are required.

## Possible next steps

- A moderation/admin view with authentication and soft delete
- Server-side pagination or infinite loading once the memorial grows
- Persistent rate limiting (for example with Redis) for multi-process deployments
- Automated tests for the API and database layer
- Deployment with a persistent volume for `db/memorial.db` and regular backups
