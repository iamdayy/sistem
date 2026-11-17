#!/usr/bin/env bash
#
# start-servers.sh
#
# Starts the HW Katering backend (Laravel) and frontend (Next.js) servers for
# Playwright tests. Idempotent: a server that is already listening on its port
# is left running and not restarted.
#
# Exit code 0 once the frontend port (3000) is accepting connections.
#
set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/../hw-catering"
FRONTEND_DIR="${REPO_ROOT}"

BACKEND_URL="http://127.0.0.1:8000"
FRONTEND_URL="http://localhost:3000"

log() { printf '[start-servers] %s\n' "$*"; }

wait_for() {
  local url="$1" name="$2" max="${3:-60}"
  local i
  for i in $(seq 1 "$max"); do
    if curl -sf "$url" > /dev/null 2>&1; then
      log "$name is ready ($url)"
      return 0
    fi
    sleep 1
  done
  log "WARNING: $name did not become ready at $url"
  return 1
}

# ---------------------------------------------------------------------------
# Backend: Laravel (php artisan serve) on port 8000
# ---------------------------------------------------------------------------
if curl -sf "${BACKEND_URL}/api/login" > /dev/null 2>&1; then
  log "Backend already running at ${BACKEND_URL}"
else
  log "Starting backend at ${BACKEND_URL} ..."
  (cd "$BACKEND_DIR" && php artisan serve --host=127.0.0.1 --port=8000 \
    > /tmp/opencode/backend.log 2>&1 &)
  wait_for "${BACKEND_URL}/api/login" "backend" 60 || true
fi

# ---------------------------------------------------------------------------
# Frontend: Next.js (npm run dev) on port 3000
# ---------------------------------------------------------------------------
if curl -sf "${FRONTEND_URL}/" > /dev/null 2>&1; then
  log "Frontend already running at ${FRONTEND_URL}"
  exit 0
fi

log "Starting frontend at ${FRONTEND_URL} ..."
cd "$FRONTEND_DIR"
# Run dev server in the foreground so Playwright's webServer can supervise it.
PORT=3000 exec npm run dev -- --port 3000
