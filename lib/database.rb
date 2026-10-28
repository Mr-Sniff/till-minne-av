# frozen_string_literal: true

require "fileutils"
require "sqlite3"
require "time"

module Remembered
  class Database
    DEFAULT_LIMIT = 500
    MAX_LIMIT = 500

    def initialize(path)
      @path = path
      FileUtils.mkdir_p(File.dirname(path))

      @db = SQLite3::Database.new(path)
      @db.results_as_hash = true
      @db.busy_timeout = 5_000
      @db.execute("PRAGMA journal_mode = WAL")
      @db.execute("PRAGMA synchronous = NORMAL")
      @db.execute("PRAGMA foreign_keys = ON")
      @db.execute_batch(File.read(schema_path))

      @mutex = Mutex.new
    end

    def count
      synchronize { @db.get_first_value("SELECT COUNT(*) FROM memories").to_i }
    end

    def names
      synchronize do
        @db.execute(<<~SQL).map { |row| row["for_name"] }
          SELECT DISTINCT for_name
          FROM memories
          WHERE for_name IS NOT NULL AND trim(for_name) <> ''
          ORDER BY for_name COLLATE NOCASE
        SQL
      end
    end

    def list(limit: DEFAULT_LIMIT, offset: 0, query: nil)
      limit = limit.to_i.clamp(1, MAX_LIMIT)
      offset = [offset.to_i, 0].max
      query = query.to_s.strip

      synchronize do
        if query.empty?
          rows = @db.execute(
            "SELECT id, text, for_name, by_name, created_at " \
            "FROM memories ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?",
            [limit, offset]
          )
          total = @db.get_first_value("SELECT COUNT(*) FROM memories").to_i
        else
          pattern = "%#{escape_like(query)}%"
          rows = @db.execute(
            "SELECT id, text, for_name, by_name, created_at " \
            "FROM memories WHERE for_name LIKE ? ESCAPE '\\' " \
            "ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?",
            [pattern, limit, offset]
          )
          total = @db.get_first_value(
            "SELECT COUNT(*) FROM memories WHERE for_name LIKE ? ESCAPE '\\'",
            [pattern]
          ).to_i
        end

        [rows.map { |row| serialize(row) }, total]
      end
    end

    def create(text:, for_name: nil, by_name: nil)
      created_at = Time.now.utc.iso8601

      synchronize do
        @db.execute(
          "INSERT INTO memories (text, for_name, by_name, created_at) VALUES (?, ?, ?, ?)",
          [text, for_name, by_name, created_at]
        )

        id = @db.last_insert_row_id
        serialize(@db.get_first_row("SELECT * FROM memories WHERE id = ?", [id]))
      end
    end

    def seed(entries)
      return false unless count.zero?

      synchronize do
        @db.transaction do
          entries.each do |entry|
            created_at = entry[:created_at] ||
              (Time.now.utc - (entry[:days_ago] || 0) * 86_400).iso8601

            @db.execute(
              "INSERT INTO memories (text, for_name, by_name, created_at) VALUES (?, ?, ?, ?)",
              [entry.fetch(:text), entry[:for_name], entry[:by_name], created_at]
            )
          end
        end
      end

      true
    end

    def close
      @db.close
    end

    private

    def schema_path
      File.expand_path("../db/schema.sql", __dir__)
    end

    def synchronize(&block)
      @mutex.synchronize(&block)
    end

    def escape_like(value)
      value.gsub(/[\\%_]/) { |character| "\\#{character}" }
    end

    def serialize(row)
      {
        id: row["id"],
        text: row["text"],
        for_name: row["for_name"],
        by_name: row["by_name"],
        created_at: row["created_at"]
      }
    end
  end
end
