const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../db/connection');
const { getGameById } = require('../services/igdb');
const router = express.Router();

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, g.igdb_id, g.name, g.cover_url, g.release_date, g.platforms, g.genres, g.rating
       FROM wishlist w
       JOIN games g ON w.game_id = g.id
       WHERE w.user_id = $1
       ORDER BY w.priority DESC, w.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});

// Add game to wishlist
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { igdbId, priority = 0, notes } = req.body;

    if (!igdbId) {
      return res.status(400).json({ error: 'igdbId required' });
    }

    // Get or fetch game
    let gameResult = await pool.query('SELECT id FROM games WHERE igdb_id = $1', [igdbId]);
    let gameId;

    if (gameResult.rows.length === 0) {
      const game = await getGameById(igdbId);
      gameId = game.id;
    } else {
      gameId = gameResult.rows[0].id;
    }

    // Add to wishlist
    const result = await pool.query(
      `INSERT INTO wishlist (user_id, game_id, priority, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, game_id) 
       DO UPDATE SET 
         priority = EXCLUDED.priority,
         notes = EXCLUDED.notes
       RETURNING *`,
      [req.user.id, gameId, priority, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add game to wishlist' });
  }
});

// Remove game from wishlist
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM wishlist WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found in wishlist' });
    }

    res.json({ message: 'Game removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove game from wishlist' });
  }
});

// Update wishlist item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, notes } = req.body;

    const result = await pool.query(
      `UPDATE wishlist 
       SET priority = COALESCE($1, priority),
           notes = COALESCE($2, notes)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [priority, notes, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update wishlist error:', error);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

module.exports = router;

