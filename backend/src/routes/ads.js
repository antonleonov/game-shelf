const express = require('express');
const { pool } = require('../db/connection');
const router = express.Router();

// Get active banner ads
router.get('/banners', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, g.name as game_name, g.cover_url as game_cover
       FROM advertisements a
       JOIN games g ON a.game_id = g.id
       WHERE a.ad_type = 'banner' 
         AND a.is_active = true
         AND (a.end_date IS NULL OR a.end_date >= CURRENT_DATE)
       ORDER BY a.created_at DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get banner ads error:', error);
    res.status(500).json({ error: 'Failed to get banner ads' });
  }
});

// Get sponsored game recommendations
router.get('/sponsored', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const result = await pool.query(
      `SELECT a.*, g.*
       FROM advertisements a
       JOIN games g ON a.game_id = g.id
       WHERE a.ad_type = 'sponsored' 
         AND a.is_active = true
         AND (a.end_date IS NULL OR a.end_date >= CURRENT_DATE)
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get sponsored ads error:', error);
    res.status(500).json({ error: 'Failed to get sponsored ads' });
  }
});

// Track ad impression (for analytics)
router.post('/:id/impression', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE advertisements SET impressions = impressions + 1 WHERE id = $1',
      [id]
    );
    res.json({ message: 'Impression tracked' });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({ error: 'Failed to track impression' });
  }
});

// Track ad click (for analytics)
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE advertisements SET clicks = clicks + 1 WHERE id = $1',
      [id]
    );
    res.json({ message: 'Click tracked' });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

module.exports = router;

