const RAWG_API_KEY = '260344fe144e46b8861179c7e412bfc3';
const RAWG_BASE_URL = 'https://api.rawg.io/api';
const RAWG_CACHE_PREFIX = 'streamhub_rawg_';
const RAWG_CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

const gameAliases = {
  'cs2': 'Counter-Strike 2',
  'counter strike 2': 'Counter-Strike 2',
  'counter-strike 2': 'Counter-Strike 2',
  'counter strike': 'Counter-Strike 2',
  'lol': 'League of Legends',
  'league': 'League of Legends',
  'rl': 'Rocket League',
  'valorant': 'Valorant',
  'fortnite': 'Fortnite',
  'gta v': 'Grand Theft Auto V',
  'gta 5': 'Grand Theft Auto V',
  'cod warzone': 'Call of Duty: Warzone',
  'warzone': 'Call of Duty: Warzone',
  'stumble': 'Stumble Guys'
};

function normalizeGameName(input) {
  if (!input) return '';
  const raw = String(input).trim();
  const lowered = raw.toLowerCase();
  return gameAliases[lowered] || raw;
}

function getCacheKey(gameName) {
  return `${RAWG_CACHE_PREFIX}${gameName.toLowerCase().trim()}`;
}

function getCachedGame(gameName) {
  try {
    const key = getCacheKey(gameName);
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!parsed.timestamp || !parsed.data) return null;

    const isExpired = (Date.now() - parsed.timestamp) > RAWG_CACHE_TTL_MS;
    if (isExpired) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('RAWG cache read error:', error);
    return null;
  }
}

function setCachedGame(gameName, data) {
  try {
    const key = getCacheKey(gameName);
    sessionStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        data
      })
    );
  } catch (error) {
    console.error('RAWG cache write error:', error);
  }
}

async function fetchRAWG(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`RAWG error ${response.status}`);
  }
  return response.json();
}

function buildSearchUrl(gameName, options = {}) {
  const params = new URLSearchParams({
    key: RAWG_API_KEY,
    search: gameName,
    page_size: options.pageSize || 5
  });

  if (options.searchPrecise) {
    params.set('search_precise', 'true');
  }

  if (options.searchExact) {
    params.set('search_exact', 'true');
  }

  return `${RAWG_BASE_URL}/games?${params.toString()}`;
}

function pickBestResult(results, originalName) {
  if (!Array.isArray(results) || results.length === 0) return null;

  const normalizedOriginal = originalName.toLowerCase().trim();

  const exact = results.find(game => game.name?.toLowerCase() === normalizedOriginal);
  if (exact) return exact;

  const contains = results.find(game =>
    game.name?.toLowerCase().includes(normalizedOriginal) ||
    normalizedOriginal.includes(game.name?.toLowerCase() || '')
  );
  if (contains) return contains;

  const withImage = results.find(game => game.background_image);
  if (withImage) return withImage;

  return results[0];
}

async function searchSingleGameRAWG(rawName) {
  const originalName = typeof rawName === 'string'
    ? rawName
    : (rawName?.title || rawName?.name || '');

  if (!originalName) return null;

  const normalizedName = normalizeGameName(originalName);

  const cached = getCachedGame(normalizedName);
  if (cached) {
    return cached;
  }

  const attempts = [
    { searchPrecise: true, searchExact: true, pageSize: 3 },
    { searchPrecise: true, searchExact: false, pageSize: 5 },
    { searchPrecise: false, searchExact: false, pageSize: 5 }
  ];

  for (const attempt of attempts) {
    try {
      const url = buildSearchUrl(normalizedName, attempt);
      const data = await fetchRAWG(url);
      const best = pickBestResult(data?.results || [], normalizedName);

      if (best) {
        const result = {
          requestedName: originalName,
          matchedName: best.name || normalizedName,
          cover: best.background_image || '/streamer/assets/game-placeholder.jpg',
          slug: best.slug || '',
          rawgId: best.id || null
        };

        setCachedGame(normalizedName, result);
        return result;
      }
    } catch (error) {
      console.error(`RAWG search failed for "${normalizedName}":`, error);
    }
  }

  const fallback = {
    requestedName: originalName,
    matchedName: normalizedName,
    cover: '/streamer/assets/game-placeholder.jpg',
    slug: '',
    rawgId: null
  };

  setCachedGame(normalizedName, fallback);
  return fallback;
}

async function searchGamesRAWG(gameNames) {
  const safeList = Array.isArray(gameNames) ? gameNames.slice(0, 8) : [];
  const results = [];

  for (const gameName of safeList) {
    const result = await searchSingleGameRAWG(gameName);
    if (result) {
      results.push({
        name: result.matchedName || result.requestedName,
        cover: result.cover,
        slug: result.slug,
        rawgId: result.rawgId
      });
    }
  }

  return results;
}

window.searchGamesRAWG = searchGamesRAWG;
