const express = require('express');
const { searchGames, getGameById, getUpcomingReleases } = require('../services/igdb');
const router = express.Router();

// Search games
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const games = await searchGames(q, parseInt(limit));
    res.json(games);
  } catch (error) {
    console.error('Search games error:', error);
    res.status(500).json({ error: 'Failed to search games' });
  }
});

// Get game by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const game = await getGameById(parseInt(id));
    res.json(game);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(404).json({ error: 'Game not found' });
  }
});

// Get upcoming releases
router.get('/upcoming/releases', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const games = await getUpcomingReleases(parseInt(limit));
    res.json(games);
  } catch (error) {
    console.error('Get upcoming releases error:', error);
    res.status(500).json({ error: 'Failed to get upcoming releases' });
  }
});

module.exports = router;

