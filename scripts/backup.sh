#!/bin/bash
# Backup Script for ZeroRespond PostgreSQL Database
# To be run via crontab daily

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/data/backups}"
DATE=$(date +%Y%m%d_%H%M%S)

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."

# Dump PostgreSQL database running inside Docker container
# Assumes the container is named 'zerorespond-db' and uses DB credentials from .env
docker exec zerorespond-db pg_dump -U zerorespond zerorespond > $BACKUP_DIR/db_$DATE.sql

# Compress the dump
gzip $BACKUP_DIR/db_$DATE.sql

# Keep only last 30 days of backups to save disk space
find $BACKUP_DIR -name '*.sql.gz' -mtime +30 -delete

echo "Backup complete: db_$DATE.sql.gz"
