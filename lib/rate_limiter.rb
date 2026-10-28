# frozen_string_literal: true

module Remembered
  # A deliberately small in-memory limiter for public submissions.
  # It resets when the process restarts and is not shared between processes.
  class RateLimiter
    attr_reader :window

    def initialize(limit:, window:)
      @limit = limit
      @window = window
      @attempts = Hash.new { |hash, key| hash[key] = [] }
      @mutex = Mutex.new
    end

    def allow?(key)
      now = Process.clock_gettime(Process::CLOCK_MONOTONIC)

      @mutex.synchronize do
        attempts = @attempts[key]
        attempts.reject! { |time| time <= now - @window }
        return false if attempts.length >= @limit

        attempts << now
        true
      end
    end
  end
end
