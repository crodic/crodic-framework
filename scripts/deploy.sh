#!/usr/bin/env bash
# ==============================================================================
# Production Deployment Script for VPS
# ==============================================================================
# Usage:
#   ./scripts/deploy.sh              # Standard deploy (pull + build + up + migrate)
#   ./scripts/deploy.sh --skip-pull  # Deploy without pulling latest git commit
# ==============================================================================

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Flags
SKIP_PULL=false
SKIP_MIGRATION=false

for arg in "$@"; do
  case $arg in
    --skip-pull)
      SKIP_PULL=true
      shift
      ;;
    --skip-migration)
      SKIP_MIGRATION=true
      shift
      ;;
    *)
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
  log "Pulling latest changes from remote repository..."
  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")"
  git pull origin "$CURRENT_BRANCH"
else
  warn "Skipping git pull (--skip-pull flag active)."
fi

# 3. Build & Orchestrate with Docker Compose
log "Building Docker production images..."
docker compose -f docker-compose.prod.yml build

log "Starting / Updating production containers..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 4. Database Migrations & Permission Sync
if [[ "$SKIP_MIGRATION" == "false" ]]; then
  log "Waiting for API container and database to be healthy..."
  sleep 5

  log "Running database migrations..."
  docker compose -f docker-compose.prod.yml exec -T api pnpm migration:run:prod

  log "Syncing RBAC permissions..."
  docker compose -f docker-compose.prod.yml exec -T api pnpm permissions:sync:prod
else
  warn "Skipping database migrations (--skip-migration flag active)."
fi

# 5. Smoke Test & Health Check
log "Performing health check verification..."

RETRIES=15
HEALTH_OK=false

for i in $(seq 1 $RETRIES); do
  if curl -sf http://127.0.0.1:8000/health >/dev/null 2>&1; then
    HEALTH_OK=true
    break
  fi
  sleep 2
done

if [[ "$HEALTH_OK" == "true" ]]; then
  info "API Health Check passed (http://127.0.0.1:8000/health)."
else
  warn "API Health Check did not respond with 200 within 30s. Check logs: docker compose -f docker-compose.prod.yml logs api"
fi

# 6. Cleanup dangling images
log "Cleaning up dangling images..."
docker image prune -f >/dev/null 2>&1 || true

info "Deployment completed successfully!"
