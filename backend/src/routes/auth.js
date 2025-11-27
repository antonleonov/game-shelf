const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');
const router = express.Router();

// Google OAuth callback - creates or updates user
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    let result = await pool.query(
      'SELECT id, email, name, picture FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    let user;
    if (result.rows.length > 0) {
      // Update existing user
      user = result.rows[0];
      await pool.query(
        'UPDATE users SET google_id = $1, name = $2, picture = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
        [googleId, name, picture, user.id]
      );
    } else {
      // Create new user
      result = await pool.query(
        'INSERT INTO users (google_id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING id, email, name, picture',
        [googleId, email, name, picture]
      );
      user = result.rows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user
router.get('/me', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, picture, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;

