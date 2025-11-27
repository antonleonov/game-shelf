const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../db/connection');
const router = express.Router();

// Get user's location
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_locations WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Failed to get location' });
  }
});

// Set user's location
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, city, country, isPublic = false } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const result = await pool.query(
      `INSERT INTO user_locations (user_id, latitude, longitude, city, country, is_public)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         city = EXCLUDED.city,
         country = EXCLUDED.country,
         is_public = EXCLUDED.is_public,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.id, latitude, longitude, city || null, country || null, isPublic]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Set location error:', error);
    res.status(500).json({ error: 'Failed to set location' });
  }
});

// Get nearby users for game exchange
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query; // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    // Get user's location first
    const userLocation = await pool.query(
      'SELECT latitude, longitude FROM user_locations WHERE user_id = $1',
      [req.user.id]
    );

    if (userLocation.rows.length === 0) {
      return res.status(400).json({ error: 'Please set your location first' });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    // Find nearby users using Haversine formula
    const result = await pool.query(
      `SELECT ul.*, u.id as user_id, u.name, u.email, u.picture
       FROM user_locations ul
       JOIN users u ON ul.user_id = u.id
       WHERE ul.is_public = true 
         AND ul.user_id != $1
         AND (
           6371 * acos(
             cos(radians($2)) * cos(radians(ul.latitude)) *
             cos(radians(ul.longitude) - radians($3)) +
             sin(radians($2)) * sin(radians(ul.latitude))
           )
         ) <= $4
       ORDER BY (
         6371 * acos(
           cos(radians($2)) * cos(radians(ul.latitude)) *
           cos(radians(ul.longitude) - radians($3)) +
           sin(radians($2)) * sin(radians(ul.latitude))
         )
       ) ASC
       LIMIT 20`,
      [req.user.id, userLat, userLon, radiusKm]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({ error: 'Failed to get nearby users' });
  }
});

// Update location privacy
router.put('/privacy', authenticateToken, async (req, res) => {
  try {
    const { isPublic } = req.body;

    const result = await pool.query(
      `UPDATE user_locations 
       SET is_public = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [isPublic, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update location privacy error:', error);
    res.status(500).json({ error: 'Failed to update location privacy' });
  }
});

module.exports = router;

