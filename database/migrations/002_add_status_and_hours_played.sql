-- Migration: Add status and hours_played columns to user_games table
-- Status: 'Backlog', 'Playing', 'Completed', 'Dropped'
-- Hours played: decimal value for tracking playtime

ALTER TABLE user_games 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Backlog' CHECK (status IN ('Backlog', 'Playing', 'Completed', 'Dropped'));

ALTER TABLE user_games 
ADD COLUMN IF NOT EXISTS hours_played DECIMAL(10, 2) DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN user_games.status IS 'Game status: Backlog, Playing, Completed, or Dropped';
COMMENT ON COLUMN user_games.hours_played IS 'Total hours played for this game entry';

