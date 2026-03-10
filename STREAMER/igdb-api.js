// IGDB API Module - Completo y separado
const IGDB_CONFIG = {
  CLIENT_ID: 'zmwek6l7ykxudbtr7ujbyujop0swlc',
  CLIENT_SECRET: 'it9vqr7gd23dcixei0602fta8vx8xi',
  BASE_URL: 'https://api.igdb.com/v4/games',
  PROXY_URL: 'https://api.cors.lol/?url='
};

let igdbToken = null;
let tokenExpires = 0;

// 1) Obtiene token (cacheado)
async function getIGDBToken() {
  if (igdbToken && Date.now() < tokenExpires) {
    return igdbToken;
  }

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: IGDB_CONFIG.CLIENT_ID,
      client_secret: IGDB_CONFIG.CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });

  const data = await response.json();
  igdbToken = data.access_token;
  tokenExpires = Date.now() + (data.expires_in * 1000);
  return igdbToken;
}

// 2) Busca juegos y trae covers reales
async function searchGames(gameNames) {
  try {
    const token = await getIGDBToken();
    
    const response = await fetch(IGDB_CONFIG.PROXY_URL + encodeURIComponent(IGDB_CONFIG.BASE_URL), {
      method: 'POST',
      headers: {
        'Client-ID': IGDB_CONFIG.CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain'
      },
      body: `
        fields name, cover.url;
        search "${gameNames.slice(0, 5).join(' OR ')}";
        limit 20;
      `
    });

    const games = await response.json();
    return games.map(game => ({
      name: game.name,
      cover: game.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.url.slice(6)}` : '/streamer/assets/game-placeholder.jpg'
    }));
  } catch (error) {
    console.error('IGDB Error:', error);
    return [];
  }
}

// Exporta para usar en otros archivos
window.searchGamesIGDB = searchGames;
