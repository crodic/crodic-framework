#!/usr/bin/env bash
# ==============================================================================
# Production Deployment Script for VPS
# ==============================================================================
# Usage:
#   ./scripts/deploy.sh                      # Smart deploy (pull + build changed services + up + migrate)
#   ./scripts/deploy.sh --all                # Force rebuild all app images (api, web, client)
#   ./scripts/deploy.sh --skip-pull          # Deploy without pulling latest git commit
#   ./scripts/deploy.sh --changed-from SHA   # Build only services affected since SHA
# ==============================================================================

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Flags
SKIP_PULL=false
SKIP_MIGRATION=false
RUN_SEED=false
REBUILD_ALL=false
CHANGED_FROM=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-pull)
      SKIP_PULL=true
      shift
      ;;
    --skip-migration)
      SKIP_MIGRATION=true
      shift
      ;;
    --seed)
      RUN_SEED=true
      shift
      ;;
    --all)
      REBUILD_ALL=true
      shift
      ;;
    --changed-from)
      CHANGED_FROM="${2:-}"
      shift 2
      ;;
    --changed-from=*)
      CHANGED_FROM="${1#*=}"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Helpers
log() {
  printf '\033[1;34m[deploy %s]\033[0m %s\n' "$(date +'%T')" "$*"
}

info() {
  printf '\033[1;32m[deploy %s]\033[0m %s\n' "$(date +'%T')" "$*"
}

warn() {
  printf '\033[1;33m[deploy %s]\033[0m %s\n' "$(date +'%T')" "$*"
}

fail() {
  printf '\033[1;31m[deploy %s]\033[0m %s\n' "$(date +'%T')" "$*" >&2
  exit 1
}

# 1. Verify Prerequisites
log "Verifying deployment prerequisites..."

if ! command -v docker >/dev/null 2>&1; then
  fail "Docker is not installed or not in PATH."
fi

if ! docker compose version >/dev/null 2>&1; then
  fail "Docker Compose (v2) is not installed."
fi

# Check required .env files
REQUIRED_ENVS=(
  ".env"
  "apps/api/.env"
  "apps/web/.env"
  "apps/client/.env"
)

for env_file in "${REQUIRED_ENVS[@]}"; do
  if [[ ! -f "$ROOT_DIR/$env_file" ]]; then
    fail "Missing required environment file: $env_file. Copy from ${env_file}.example before deploying."
  fi
done

# 2. Git Pull (if not skipped)
if [[ "$SKIP_PULL" == "false" ]]; then
  if [[ -z "$CHANGED_FROM" ]]; then
    CHANGED_FROM="$(git rev-parse HEAD 2>/dev/null || true)"
  fi
  log "Pulling latest changes from remote repository..."
  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")"
  git pull origin "$CURRENT_BRANCH"
else
  warn "Skipping git pull (--skip-pull flag active)."
fi

# 3. Determine Changed Services to Build
ALL_APP_SERVICES=("api" "web" "client")
SERVICES_TO_BUILD=()

if [[ "$REBUILD_ALL" == "true" ]]; then
  SERVICES_TO_BUILD=("${ALL_APP_SERVICES[@]}")
elif [[ -n "$CHANGED_FROM" ]] && git cat-file -e "${CHANGED_FROM}^{commit}" 2>/dev/null; then
  CURRENT_HEAD="$(git rev-parse HEAD)"
  if [[ "$CHANGED_FROM" == "$CURRENT_HEAD" ]]; then
    # When invoked directly with no new git commits, rebuild all to reflect any local edits
    SERVICES_TO_BUILD=("${ALL_APP_SERVICES[@]}")
  else
    CHANGED_FILES="$(git diff --name-only "$CHANGED_FROM" "$CURRENT_HEAD" || true)"
    if echo "$CHANGED_FILES" | grep -qE '^(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|\.npmrc|turbo\.json|\.dockerignore|docker-compose\.prod\.yml|packages/)'; then
      SERVICES_TO_BUILD=("${ALL_APP_SERVICES[@]}")
    else
      echo "$CHANGED_FILES" | grep -qE '^apps/api/' && SERVICES_TO_BUILD+=("api") || true
      echo "$CHANGED_FILES" | grep -qE '^apps/web/' && SERVICES_TO_BUILD+=("web") || true
      echo "$CHANGED_FILES" | grep -qE '^apps/client/' && SERVICES_TO_BUILD+=("client") || true
    fi
  fi
else
  SERVICES_TO_BUILD=("${ALL_APP_SERVICES[@]}")
fi

# Build sequentially to avoid CPU/RAM/I/O contention on VPS
API_REBUILT=false
if [[ ${#SERVICES_TO_BUILD[@]} -gt 0 ]]; then
  log "Building Docker production images sequentially for: ${SERVICES_TO_BUILD[*]}..."
  for svc in "${SERVICES_TO_BUILD[@]}"; do
    log "Building image: $svc"
    docker compose -f docker-compose.prod.yml build "$svc"
    if [[ "$svc" == "api" ]]; then
      API_REBUILT=true
    fi
  done
else
  info "No application source changes detected since ${CHANGED_FROM:0:7}; skipping Docker image rebuild."
fi

log "Starting / Updating production containers..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 4. Database Migrations & Permission Sync (only when API changed or forced)
if [[ "$SKIP_MIGRATION" == "false" && "$API_REBUILT" == "true" ]]; then
  log "Waiting for API container and database to be healthy..."
  sleep 5

  log "Running database migrations..."
  docker compose -f docker-compose.prod.yml exec -T -e CI=true api node ./node_modules/typeorm/cli.js -d dist/database/data-source.js migration:run

  log "Syncing RBAC permissions..."
  docker compose -f docker-compose.prod.yml exec -T -e CI=true api node dist/database/sync-permissions.js
elif [[ "$SKIP_MIGRATION" == "true" ]]; then
  warn "Skipping database migrations (--skip-migration flag active)."
else
  log "API image unchanged; skipping database migrations and RBAC permission sync."
fi

if [[ "$RUN_SEED" == "true" ]]; then
  log "Running database seeds..."
  docker compose -f docker-compose.prod.yml exec -T -e CI=true api node dist/database/seeds/run-seed.js
fi

# 5. Smoke Test & Health Check
log "Performing health check verification..."

CHECK_PORT="8001"
if [ -f "$ROOT_DIR/.env" ]; then
  ENV_PORT=$(grep -E '^API_PORT=' "$ROOT_DIR/.env" | cut -d '=' -f2 | tr -d ' "\r' || true)
  if [ -n "$ENV_PORT" ]; then
    CHECK_PORT="$ENV_PORT"
  fi
fi

RETRIES=15
HEALTH_OK=false

for i in $(seq 1 $RETRIES); do
  if curl -sf "http://127.0.0.1:${CHECK_PORT}/health" >/dev/null 2>&1; then
    HEALTH_OK=true
    break
  fi
  sleep 2
done

if [[ "$HEALTH_OK" == "true" ]]; then
  info "API Health Check passed (http://127.0.0.1:${CHECK_PORT}/health)."
else
  warn "API Health Check did not respond with 200 within 30s. Check logs: docker compose -f docker-compose.prod.yml logs api"
fi

# 6. Cleanup dangling images
log "Cleaning up dangling images..."
docker image prune -f >/dev/null 2>&1 || true

info "Deployment completed successfully!"
