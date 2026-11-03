# frozen_string_literal: true

require "sinatra/base"
require "json"

require_relative "lib/database"
require_relative "lib/rate_limiter"
require_relative "db/seeds"

module Remembered
  class App < Sinatra::Base
    APP_ROOT = File.expand_path(__dir__)

    MAX_TEXT = 400
    MAX_NAME = 80
    MAX_BODY_BYTES = 8_192

    set :root, APP_ROOT
    set :public_folder, File.join(APP_ROOT, "public")
    set :static, true
    set :show_exceptions, false
    set :raise_errors, false
    set :logging, true
    set :bind, ENV.fetch("HOST", "127.0.0.1")
    set :port, ENV.fetch("PORT", "4567").to_i
    set :server, :puma
    # SQLite-anslutningen öppnas innan Puma startar. Om Puma kör i cluster
    # mode och forkar en worker stänger sqlite3-gemet den ärvda anslutningen,
    # vilket gör alla frågor i workern till ett fel. Kör därför alltid en
    # enda process; WEB_CONCURRENCY sätts av vissa hosts (till exempel Render).
    set :server_settings, { workers: 0 }

    configure do
      db_path = ENV.fetch("DATABASE_PATH", File.join(APP_ROOT, "db", "memorial.db"))
      database = Database.new(db_path)
      database.seed(SEED_MEMORIES) unless ENV["SEED_DEMO"] == "false"

      set :db, database
      set :rate_limiter, RateLimiter.new(
        limit: ENV.fetch("RATE_LIMIT", "10").to_i,
        window: ENV.fetch("RATE_WINDOW", "600").to_i
      )
    end

    before do
      next unless request.path_info.start_with?("/api/")

      content_type :json
      headers "Cache-Control" => "no-store"
    end

    after do
      headers(
        "X-Content-Type-Options" => "nosniff",
        "Referrer-Policy" => "strict-origin-when-cross-origin",
        "X-Frame-Options" => "DENY",
        "Content-Security-Policy" => [
          "default-src 'self'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src https://fonts.gstatic.com",
          "script-src 'self'",
          "img-src 'self' data:",
          "connect-src 'self'",
          "base-uri 'none'",
          "form-action 'self'",
          "frame-ancestors 'none'"
        ].join("; ")
      )
    end

    helpers do
      def halt_json(status_code, message)
        halt status_code, JSON.generate(error: message)
      end

      def parse_json_body
        halt_json(413, "Request body is too large.") if request.content_length.to_i > MAX_BODY_BYTES

        request.body.rewind
        raw = request.body.read
        halt_json(400, "Request body is empty.") if raw.strip.empty?

        JSON.parse(raw)
      rescue JSON::ParserError
        halt_json(400, "Request body must be valid JSON.")
      end

      def clean_text(value)
        value.to_s
          .gsub(/\r\n?/, "\n")
          .gsub(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/, "")
          .strip
      end

      def clean_name(value)
        return nil if value.nil?

        name = value.to_s.gsub(/\s+/, " ").strip
        name.empty? ? nil : name
      end
    end

    get "/" do
      send_file File.join(settings.public_folder, "index.html")
    end

    get "/api/health" do
      JSON.generate(status: "ok", memories: settings.db.count)
    end

    get "/api/memories" do
      limit = params.fetch("limit", "500").to_i.clamp(1, Database::MAX_LIMIT)
      offset = [params.fetch("offset", "0").to_i, 0].max
      query = params["q"]

      memories, total = settings.db.list(limit: limit, offset: offset, query: query)

      JSON.generate(
        memories: memories,
        total: total,
        names: settings.db.names,
        limit: limit,
        offset: offset
      )
    end

    post "/api/memories" do
      unless settings.rate_limiter.allow?(request.ip.to_s)
        headers "Retry-After" => settings.rate_limiter.window.to_s
        halt_json(429, "Too many memories at once. Please wait a little while.")
      end

      payload = parse_json_body
      halt_json(400, "Request body must be a JSON object.") unless payload.is_a?(Hash)

      text = clean_text(payload["text"])
      for_name = clean_name(payload["for_name"])
      by_name = clean_name(payload["by_name"])

      halt_json(422, "A memory is required.") if text.empty?
      halt_json(422, "A memory can be at most #{MAX_TEXT} characters.") if text.length > MAX_TEXT

      if [for_name, by_name].compact.any? { |name| name.length > MAX_NAME }
        halt_json(422, "Names can be at most #{MAX_NAME} characters.")
      end

      memory = settings.db.create(text: text, for_name: for_name, by_name: by_name)

      status 201
      JSON.generate(memory)
    end

    not_found do
      if request.path_info.start_with?("/api/")
        content_type :json
        JSON.generate(error: "Not found.")
      else
        content_type :html
        <<~HTML
          <!doctype html>
          <html lang="en">
          <head><meta charset="utf-8"><title>Not found &mdash; Remembered</title></head>
          <body style="font-family: Georgia, serif; text-align: center; margin-top: 20vh;">
            <p>This page has drifted away.</p>
            <p><a href="/">Return to Remembered</a></p>
          </body>
          </html>
        HTML
      end
    end

    error do
      exception = env["sinatra.error"]
      warn "[remembered] #{exception.class}: #{exception.message}"
      warn exception.backtrace&.first(5)&.join("\n") if exception.respond_to?(:backtrace)

      if request.path_info.start_with?("/api/")
        content_type :json
        status 500
        JSON.generate(error: "Something went wrong.")
      else
        content_type :text
        status 500
        "Something went wrong."
      end
    end

    run! if File.expand_path(__FILE__) == File.expand_path($PROGRAM_NAME)
  end
end
