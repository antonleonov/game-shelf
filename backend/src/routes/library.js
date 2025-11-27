const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../db/connection');
const { getGameById } = require('../services/igdb');
const router = express.Router();

// Get user's game library
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ug.*, g.igdb_id, g.name, g.cover_url, g.platforms, g.genres, g.rating
       FROM user_games ug
       JOIN games g ON ug.game_id = g.id
       WHERE ug.user_id = $1
       ORDER BY ug.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get library error:', error);
    res.status(500).json({ error: 'Failed to get library' });
  }
});

// Get library statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_games,
        COUNT(*) FILTER (WHERE ug.status = 'Completed') as completed,
        COUNT(*) FILTER (WHERE ug.status = 'Playing') as playing,
        COALESCE(SUM(ug.hours_played), 0) as total_hours
       FROM user_games ug
       WHERE ug.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Add game to library
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { igdbId, type, platform, purchaseDate, purchasePrice, notes, status, hoursPlayed } = req.body;

    if (!igdbId || !type || !platform) {
      return res.status(400).json({ error: 'Missing required fields: igdbId, type, platform' });
    }

    if (!['physical', 'digital'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "physical" or "digital"' });
    }

    if (status && !['Backlog', 'Playing', 'Completed', 'Dropped'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: Backlog, Playing, Completed, Dropped' });
    }

    // Get or fetch game
    let gameResult = await pool.query('SELECT id FROM games WHERE igdb_id = $1', [igdbId]);
    let gameId;

    if (gameResult.rows.length === 0) {
      // Fetch from IGDB and cache
      try {
        const game = await getGameById(igdbId);
        if (!game || !game.id) {
          return res.status(404).json({ error: 'Game not found in IGDB' });
        }
        gameId = game.id;
      } catch (error) {
        console.error('Error fetching game from IGDB:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch game data',
          details: error.message 
        });
      }
    } else {
      gameId = gameResult.rows[0].id;
    }

    // Add to library
    const result = await pool.query(
      `INSERT INTO user_games (user_id, game_id, type, platform, purchase_date, purchase_price, notes, status, hours_played)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, game_id, type, platform) 
       DO UPDATE SET 
         purchase_date = EXCLUDED.purchase_date,
         purchase_price = EXCLUDED.purchase_price,
         notes = EXCLUDED.notes,
         status = EXCLUDED.status,
         hours_played = EXCLUDED.hours_played
       RETURNING *`,
      [req.user.id, gameId, type, platform, purchaseDate || null, purchasePrice || null, notes || null, status || 'Backlog', hoursPlayed || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add to library error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Game already exists in library for this platform and type' });
    }
    res.status(500).json({ error: 'Failed to add game to library' });
  }
});

// Remove game from library
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM user_games WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found in library' });
    }

    res.json({ message: 'Game removed from library' });
  } catch (error) {
    console.error('Remove from library error:', error);
    res.status(500).json({ error: 'Failed to remove game from library' });
  }
});

// Update game in library
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { purchaseDate, purchasePrice, notes, platform, type, status, hoursPlayed } = req.body;

    if (type && !['physical', 'digital'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "physical" or "digital"' });
    }

    if (platform !== undefined && platform !== null && platform.trim() === '') {
      return res.status(400).json({ error: 'Platform cannot be empty' });
    }

    if (status && !['Backlog', 'Playing', 'Completed', 'Dropped'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: Backlog, Playing, Completed, Dropped' });
    }

    const result = await pool.query(
      `UPDATE user_games 
       SET purchase_date = COALESCE($1, purchase_date),
           purchase_price = COALESCE($2, purchase_price),
           notes = COALESCE($3, notes),
           platform = COALESCE($4, platform),
           type = COALESCE($5, type),
           status = COALESCE($6, status),
           hours_played = COALESCE($7, hours_played)
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [purchaseDate, purchasePrice, notes, platform, type, status, hoursPlayed, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found in library' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update library error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Another entry already exists with this type and platform' });
    }
    res.status(500).json({ error: 'Failed to update game in library' });
  }
});

module.exports = router;

