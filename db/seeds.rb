# frozen_string_literal: true

module Remembered
  # The original prototype's memories, kept as demo data.
  # days_ago is converted to a UTC timestamp the first time the database is seeded.
  SEED_MEMORIES = [
    {
      text: "She hummed while she cooked, always the same three notes. I hum them now when I make coffee.",
      for_name: "Margareta Lindqvist",
      by_name: "Anna",
      days_ago: 3
    },
    {
      text: "You taught me to drive in a snowstorm and never once raised your voice.",
      for_name: "Farfar Olle",
      by_name: "Teo",
      days_ago: 8
    },
    {
      text: "Thank you for the Sunday walks. I did not know they were the best part of the week.",
      for_name: "Margareta Lindqvist",
      by_name: "Johan",
      days_ago: 12
    },
    {
      text: "He left the porch light on for everyone, even people he had never met.",
      for_name: "Sami",
      by_name: nil,
      days_ago: 17
    },
    {
      text: "We never finished the puzzle. It is still on the table.",
      for_name: nil,
      by_name: "Ingrid",
      days_ago: 21
    },
    {
      text: "Eli, the dog still waits at the gate around five.",
      for_name: "Eli",
      by_name: "Mum",
      days_ago: 27
    },
    {
      text: "You made every room feel like it had been waiting for you to arrive.",
      for_name: "Farfar Olle",
      by_name: nil,
      days_ago: 34
    },
    {
      text: "I can still hear your laugh in the stairwell. It never got old.",
      for_name: "Sami",
      by_name: "Maja",
      days_ago: 41
    },
    {
      text: "She kept every postcard I ever sent. All of them, in a shoebox.",
      for_name: "Ingrid",
      by_name: "Lena",
      days_ago: 53
    },
    {
      text: "Your terrible jokes live on. I told one at the funeral and everybody groaned, exactly right.",
      for_name: "Eli",
      by_name: "Noor",
      days_ago: 62
    },
    {
      text: "We were only friends for one summer. It was enough to change me.",
      for_name: nil,
      by_name: nil,
      days_ago: 74
    },
    {
      text: "You always said the sea was the only honest thing. I went today. You were right.",
      for_name: "Tobias Ek",
      by_name: "Elin",
      days_ago: 88
    },
    {
      text: "I wish I had called one more time.",
      for_name: "Ingrid",
      by_name: nil,
      days_ago: 101
    },
    {
      text: "Thank you for believing in me before I did.",
      for_name: "Tobias Ek",
      by_name: "A former student",
      days_ago: 126
    }
  ].freeze
end
