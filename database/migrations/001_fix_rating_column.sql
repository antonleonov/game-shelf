-- Migration: Fix rating column to support IGDB rating scale (0-100)
-- IGDB ratings are on a 0-100 scale, but the original schema only allowed 0-9.99

ALTER TABLE games 
ALTER COLUMN rating TYPE DECIMAL(5, 2);

-- Add comment for clarity
COMMENT ON COLUMN games.rating IS 'IGDB rating on a scale of 0-100';

