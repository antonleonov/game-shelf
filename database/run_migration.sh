#!/bin/bash

# Script to run the rating column migration
# This fixes the rating column to support IGDB's 0-100 rating scale

echo "Running migration to fix rating column..."

docker compose exec postgres psql -U gameshelf -d gameshelf <<EOF
-- Migration: Fix rating column to support IGDB rating scale (0-100)
ALTER TABLE games 
ALTER COLUMN rating TYPE DECIMAL(5, 2);

-- Add comment for clarity
COMMENT ON COLUMN games.rating IS 'IGDB rating on a scale of 0-100';
EOF

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
    echo "The rating column now supports values from 0-100"
else
    echo "❌ Migration failed"
    exit 1
fi

