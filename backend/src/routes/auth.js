const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');
const router = express.Router();

// Google OAuth callback - creates or updates user
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    console.log('Google auth request received:', {
      hasGoogleId: !!googleId,
      hasEmail: !!email,
      hasName: !!name,
      email: email
    });

    if (!googleId || !email || !name) {
      console.error('Missing required fields:', { googleId: !!googleId, email: !!email, name: !!name });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          googleId: !googleId ? 'missing' : 'present',
          email: !email ? 'missing' : 'present',
          name: !name ? 'missing' : 'present'
        }
      });
    }

    // Check JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error: JWT_SECRET not set' });
    }

    // Check if user exists
    let result;
    try {
      result = await pool.query(
        'SELECT id, email, name, picture FROM users WHERE google_id = $1 OR email = $2',
        [googleId, email]
      );
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).json({ 
        error: 'Database error',
        details: dbError.message 
      });
    }

    let user;
    if (result.rows.length > 0) {
      // Update existing user
      user = result.rows[0];
      console.log('Updating existing user:', user.id);
      try {
        await pool.query(
          'UPDATE users SET google_id = $1, name = $2, picture = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
          [googleId, name, picture, user.id]
        );
      } catch (dbError) {
        console.error('Database update error:', dbError);
        return res.status(500).json({ 
          error: 'Failed to update user',
          details: dbError.message 
        });
      }
    } else {
      // Create new user
      console.log('Creating new user');
      try {
        result = await pool.query(
          'INSERT INTO users (google_id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING id, email, name, picture',
          [googleId, email, name, picture]
        );
        user = result.rows[0];
        console.log('New user created:', user.id);
      } catch (dbError) {
        console.error('Database insert error:', dbError);
        return res.status(500).json({ 
          error: 'Failed to create user',
          details: dbError.message 
        });
      }
    }

    // Generate JWT token
    let token;
    try {
      token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (jwtError) {
      console.error('JWT signing error:', jwtError);
      return res.status(500).json({ 
        error: 'Failed to generate authentication token',
        details: jwtError.message 
      });
    }

    console.log('Authentication successful for user:', user.id);
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
    console.error('Auth error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

