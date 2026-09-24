#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
OUTPUT="$BACKUP_DIR/booking-$TIMESTAMP.sql"
mysqldump "$DATABASE_URL" > "$OUTPUT"
find "$BACKUP_DIR" -name '*.sql' -type f -printf '%T@ %p\n' | sort -nr | tail -n +15 | cut -d' ' -f2- | xargs -r rm -f
printf '%s\n' "$OUTPUT"
