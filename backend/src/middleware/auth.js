const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Dev mode: allow dev tokens
  if (process.env.NODE_ENV === 'development' && token && token.startsWith('dev-mode-token-')) {
    try {
      const decoded = JSON.parse(Buffer.from(token.replace('dev-mode-token-', ''), 'base64').toString());
      if (decoded.dev && decoded.userId) {
        // Check if dev user exists, create if not
        let result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [decoded.userId]);
        
        if (result.rows.length === 0) {
          // Create dev user if it doesn't exist
          const insertResult = await pool.query(
            'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id, email, name',
            ['dev-user-' + decoded.userId, 'dev@example.com', 'Dev User']
          );
          result = insertResult;
        }
        
        req.user = result.rows[0];
        return next();
      }
    } catch (error) {
      // If dev token parsing fails, fall through to normal auth
      console.log('Dev token parsing failed, trying normal auth:', error.message);
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };

