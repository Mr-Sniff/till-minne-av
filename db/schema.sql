-- Remembered — SQLite schema

CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL CHECK (length(trim(text)) BETWEEN 1 AND 400),
  for_name TEXT CHECK (for_name IS NULL OR length(for_name) <= 80),
  by_name TEXT CHECK (by_name IS NULL OR length(by_name) <= 80),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memories_created_at
  ON memories (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memories_for_name
  ON memories (for_name COLLATE NOCASE)
  WHERE for_name IS NOT NULL;
