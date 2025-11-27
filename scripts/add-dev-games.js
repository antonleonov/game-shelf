const axios = require('axios');

const API_URL = 'http://localhost:3001';
const DEV_TOKEN = 'dev-mode-token-' + Buffer.from(JSON.stringify({ userId: 1, dev: true })).toString('base64');

// Top 10 popular games with different statuses and hours
const gamesToAdd = [
  { name: 'The Witcher 3: Wild Hunt', status: 'Completed', hours: 120, platform: 'PC', type: 'digital' },
  { name: 'Elden Ring', status: 'Playing', hours: 85, platform: 'PlayStation 5', type: 'digital' },
  { name: 'Red Dead Redemption 2', status: 'Completed', hours: 95, platform: 'PC', type: 'digital' },
  { name: 'God of War', status: 'Playing', hours: 25, platform: 'PlayStation 5', type: 'digital' },
  { name: 'The Last of Us Part II', status: 'Completed', hours: 30, platform: 'PlayStation 4', type: 'physical' },
  { name: 'Cyberpunk 2077', status: 'Backlog', hours: 0, platform: 'PC', type: 'digital' },
  { name: 'Baldur\'s Gate 3', status: 'Playing', hours: 150, platform: 'PC', type: 'digital' },
  { name: 'Horizon Zero Dawn', status: 'Completed', hours: 45, platform: 'PlayStation 4', type: 'digital' },
  { name: 'Dark Souls III', status: 'Dropped', hours: 15, platform: 'PC', type: 'digital' },
  { name: 'Hollow Knight', status: 'Completed', hours: 60, platform: 'Nintendo Switch', type: 'digital' },
];

async function searchGame(name) {
  try {
    const response = await axios.get(`${API_URL}/api/games/search`, {
      params: { q: name, limit: 1 }
    });
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    return null;
  } catch (error) {
    console.error(`Failed to search for ${name}:`, error.message);
    return null;
  }
}

async function addGame(gameData, igdbGame) {
  try {
    const response = await axios.post(
      `${API_URL}/api/library`,
      {
        igdbId: igdbGame.id,
        type: gameData.type,
        platform: gameData.platform,
        status: gameData.status,
        hoursPlayed: gameData.hours,
      },
      {
        headers: {
          'Authorization': `Bearer ${DEV_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, game: gameData.name };
  } catch (error) {
    return { 
      success: false, 
      game: gameData.name, 
      error: error.response?.data?.error || error.message 
    };
  }
}

async function main() {
  console.log('🎮 Adding 10 top games to library...\n');
  
  const results = [];
  
  for (const gameData of gamesToAdd) {
    console.log(`Searching for: ${gameData.name}...`);
    const igdbGame = await searchGame(gameData.name);
    
    if (!igdbGame) {
      console.log(`  ❌ Game not found: ${gameData.name}\n`);
      results.push({ success: false, game: gameData.name, error: 'Not found in IGDB' });
      continue;
    }
    
    console.log(`  ✓ Found: ${igdbGame.name} (ID: ${igdbGame.id})`);
    console.log(`  Adding with status: ${gameData.status}, hours: ${gameData.hours}, platform: ${gameData.platform}...`);
    
    const result = await addGame(gameData, igdbGame);
    
    if (result.success) {
      console.log(`  ✅ Added successfully!\n`);
    } else {
      console.log(`  ❌ Failed: ${result.error}\n`);
    }
    
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`  ✅ Successfully added: ${successful}`);
  console.log(`  ❌ Failed: ${failed}`);
  
  if (successful > 0) {
    console.log('\n🎉 Games added! Check your library at http://localhost:3000/');
  }
}

main().catch(console.error);

