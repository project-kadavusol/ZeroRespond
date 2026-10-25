#!/bin/bash
# ==============================================================================
# ZeroRespond - Database Restore Script
# Owner: Prethiv Raj (Module 4B - DevOps & Deployment)
#
# Usage:
#   ./scripts/restore.sh                          # Restores the latest backup found
#   ./scripts/restore.sh data/backups/db_xyz.sql  # Restores a specific backup
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/data/backups}"
CONTAINER_NAME="${DB_CONTAINER:-zerorespond-db}"
DB_USER="${POSTGRES_USER:-zerorespond}"
DB_NAME="${POSTGRES_DB:-zerorespond}"

TARGET_FILE="${1:-}"

# Verify container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[ERROR] Database container '${CONTAINER_NAME}' is not running."
  echo "        Run 'docker compose up -d zerorespond-db' before restoring."
  exit 1
fi

# Pick latest backup if not specified
if [ -z "$TARGET_FILE" ]; then
  LATEST_BACKUP=$(find "$BACKUP_DIR" -type f \( -name "*.sql" -o -name "*.sql.gz" \) 2>/dev/null | sort -r | head -n 1)
  if [ -z "$LATEST_BACKUP" ]; then
    echo "[ERROR] No backup files found in $BACKUP_DIR"
    exit 1
  fi
  TARGET_FILE="$LATEST_BACKUP"
fi

if [ ! -f "$TARGET_FILE" ]; then
  echo "[ERROR] Backup file '$TARGET_FILE' does not exist."
  exit 1
fi

echo "=========================================================="
echo " ZeroRespond PostgreSQL Database Restore"
echo "=========================================================="
echo "Target Container : $CONTAINER_NAME"
echo "Database / User  : $DB_NAME / $DB_USER"
echo "Restoring File   : $TARGET_FILE"
echo "=========================================================="

if [[ "$TARGET_FILE" == *.gz ]]; then
  echo "Streaming and decompressing into $CONTAINER_NAME..."
  gunzip -c "$TARGET_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
else
  echo "Streaming SQL dump into $CONTAINER_NAME..."
  cat "$TARGET_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
fi

echo "=========================================================="
echo "[SUCCESS] Database restored successfully from: $TARGET_FILE"
echo "=========================================================="
