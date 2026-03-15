#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default command
CMD="${1:-up}"

# Check for required .env
check_env() {
  if [[ "$CMD" == "up" || "$CMD" == "build" || "$CMD" == "rebuild" ]]; then
    if [[ ! -f ".env" ]]; then
      echo "Error: .env not found."
      [[ -f ".env.example" ]] && echo "  Run: cp .env.example .env"
      exit 1
    fi
  fi
}

case "$CMD" in
  up)
    check_env
    echo "Starting OneVOnePlay stack..."
    docker compose -f docker/docker-compose.yml up -d
    echo ""
    echo "Services started:"
    echo "  App:       http://localhost:3000"
    echo "  PostgreSQL: localhost:5434 (from .env DATABASE_URL)"
    echo "  Redis:     localhost:6379"
    echo ""
    echo "Run 'docker compose -f docker/docker-compose.yml logs -f' to follow logs."
    ;;
  down)
    echo "Stopping OneVOnePlay stack..."
    docker compose -f docker/docker-compose.yml down
    ;;
  build)
    check_env
    echo "Building images..."
    docker compose -f docker/docker-compose.yml build --no-cache
    echo "Build complete. Run './run.sh up' to start."
    ;;
  rebuild)
    check_env
    echo "Rebuilding and starting..."
    docker compose -f docker/docker-compose.yml up -d --build
    ;;
  logs)
    docker compose -f docker/docker-compose.yml logs -f "${@:2}"
    ;;
  *)
    echo "Usage: $0 {up|down|build|rebuild|logs}"
    echo ""
    echo "  up      - Start all services (default)"
    echo "  down    - Stop all services"
    echo "  build   - Build images without cache"
    echo "  rebuild - Rebuild and start"
    echo "  logs    - Follow logs (pass service names for specific services)"
    exit 1
    ;;
esac
