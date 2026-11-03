#!/usr/bin/env bash
# Startar appen i bakgrunden om den inte redan kör.
set -euo pipefail
cd "$(dirname "$0")/.."

if curl -fsS --max-time 2 http://127.0.0.1:4567/api/health >/dev/null 2>&1; then
  exit 0
fi

bundle check >/dev/null 2>&1 || bundle install

nohup bundle exec ruby app.rb >/tmp/till-minne-av.log 2>&1 &
echo "Till minne av startar på port 4567. Logg: /tmp/till-minne-av.log"
