const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../db/connection');
const router = express.Router();

// Get user's friends
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, 
              CASE 
                WHEN f.user_id = $1 THEN u2.id
                ELSE u1.id
              END as friend_user_id,
              CASE 
                WHEN f.user_id = $1 THEN u2.name
                ELSE u1.name
              END as friend_name,
              CASE 
                WHEN f.user_id = $1 THEN u2.email
                ELSE u1.email
              END as friend_email,
              CASE 
                WHEN f.user_id = $1 THEN u2.picture
                ELSE u1.picture
              END as friend_picture
       FROM friendships f
       JOIN users u1 ON f.user_id = u1.id
       JOIN users u2 ON f.friend_id = u2.id
       WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'
       ORDER BY f.updated_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

// Get pending friend requests
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.name, u.email, u.picture
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

// Send friend request
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ error: 'friendId required' });
    }

    if (friendId === req.user.id) {
      return res.status(400).json({ error: 'Cannot add yourself as friend' });
    }

    // Check if friendship already exists
    const existing = await pool.query(
      'SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [req.user.id, friendId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Friendship already exists' });
    }

    // Create friend request
    const result = await pool.query(
      'INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, friendId, 'pending']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept friend request
router.put('/accept/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE friendships 
       SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Reject/Remove friend
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM friendships WHERE id = $1 AND (user_id = $2 OR friend_id = $2) RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    res.json({ message: 'Friendship removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

module.exports = router;

