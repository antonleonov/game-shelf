const axios = require('axios');
const { pool } = require('../db/connection');

let accessToken = null;
let tokenExpiry = null;

const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
const BASE_URL = 'https://api.igdb.com/v4';

async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });

    accessToken = response.data.access_token;
    // Set expiry to 90% of actual expiry time for safety
    tokenExpiry = Date.now() + (response.data.expires_in * 900);

    return accessToken;
  } catch (error) {
    console.error('Error getting IGDB access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with IGDB API');
  }
}

async function makeIGDBRequest(endpoint, query) {
  const token = await getAccessToken();
  
  try {
    const response = await axios.post(`${BASE_URL}/${endpoint}`, query, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain'
      }
    });

    return response.data;
  } catch (error) {
    console.error(`IGDB API error for ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

async function searchGames(query, limit = 20) {
  // Request expanded fields for platforms and genres
  const igdbQuery = `search "${query}"; fields id,name,summary,cover.url,first_release_date,platforms.name,genres.name,rating; limit ${limit};`;
  const games = await makeIGDBRequest('games', igdbQuery);
  
  // Cache games in database
  for (const game of games) {
    await cacheGame(game);
  }
  
  return games;
}

async function getGameById(igdbId) {
  // Check cache first
  const cached = await pool.query('SELECT * FROM games WHERE igdb_id = $1', [igdbId]);
  if (cached.rows.length > 0) {
    return cached.rows[0];
  }

  // Fetch from IGDB
  const igdbQuery = `fields *; where id = ${igdbId};`;
  const games = await makeIGDBRequest('games', igdbQuery);
  
  if (games.length === 0) {
    throw new Error('Game not found');
  }

  const game = games[0];
  await cacheGame(game);
  
  return await pool.query('SELECT * FROM games WHERE igdb_id = $1', [igdbId]).then(r => r.rows[0]);
}

async function getUpcomingReleases(limit = 50) {
  const now = Math.floor(Date.now() / 1000);
  const igdbQuery = `fields id,name,summary,cover.url,first_release_date,platforms.name,genres.name,rating; where first_release_date > ${now} & rating > 0; sort first_release_date asc; limit ${limit};`;
  const games = await makeIGDBRequest('games', igdbQuery);
  
  // Cache games
  for (const game of games) {
    await cacheGame(game);
  }
  
  return games;
}

async function cacheGame(igdbGame) {
  try {
    // Handle platforms - can be array of objects or array of IDs
    let platforms = [];
    if (Array.isArray(igdbGame.platforms)) {
      platforms = igdbGame.platforms.map(p => typeof p === 'object' ? p.name : String(p));
    }
    
    // Handle genres - can be array of objects or array of IDs
    let genres = [];
    if (Array.isArray(igdbGame.genres)) {
      genres = igdbGame.genres.map(g => typeof g === 'object' ? g.name : String(g));
    }
    
    // Handle cover - can be object with url or just a number (ID)
    let coverUrl = null;
    if (igdbGame.cover) {
      if (typeof igdbGame.cover === 'object' && igdbGame.cover.url) {
        coverUrl = `https:${igdbGame.cover.url.replace('t_thumb', 't_cover_big')}`;
      } else if (typeof igdbGame.cover === 'number') {
        // If cover is just an ID, we'd need to fetch it separately
        // For now, we'll leave it null
      }
    }
    
    const releaseDate = igdbGame.first_release_date 
      ? new Date(igdbGame.first_release_date * 1000).toISOString().split('T')[0]
      : null;

    await pool.query(
      `INSERT INTO games (igdb_id, name, summary, cover_url, release_date, platforms, genres, rating, igdb_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (igdb_id) 
       DO UPDATE SET 
         name = EXCLUDED.name,
         summary = EXCLUDED.summary,
         cover_url = EXCLUDED.cover_url,
         release_date = EXCLUDED.release_date,
         platforms = EXCLUDED.platforms,
         genres = EXCLUDED.genres,
         rating = EXCLUDED.rating,
         igdb_data = EXCLUDED.igdb_data,
         updated_at = CURRENT_TIMESTAMP`,
      [
        igdbGame.id,
        igdbGame.name,
        igdbGame.summary || null,
        coverUrl,
        releaseDate,
        platforms,
        genres,
        igdbGame.rating || null,
        JSON.stringify(igdbGame)
      ]
    );
  } catch (error) {
    console.error('Error caching game:', error);
    // Re-throw the error so callers know caching failed
    throw error;
  }
}

module.exports = {
  searchGames,
  getGameById,
  getUpcomingReleases,
  cacheGame
};

