const countryCodes = {
  'venezuela': 'VE',
  'chile': 'CL',
  'argentina': 'AR',
  'brasil': 'BR',
  'colombia': 'CO',
  'perú': 'PE',
  'ecuador': 'EC',
  'bolivia': 'BO',
  'uruguay': 'UY',
  'paraguay': 'PY',
  'mexico': 'MX',
  'estados unidos': 'US',
  'españa': 'ES',
  'portugal': 'PT',
  'italia': 'IT',
  'francia': 'FR',
  'alemania': 'DE'
};

const CREATOR_TARGET = 'BillyBillete';
const BASE_PATH = '/'; // 
const PROFILE_PLACEHOLDER = `${BASE_PATH}/assets/profile-placeholder.jpg`;
const GAME_PLACEHOLDER = `${BASE_PATH}/assets/game-placeholder.jpg`;

function findCreator(creators, target) {
  const safeTarget = String(target).trim().toLowerCase();

  return creators.find(c => {
    const id = String(c.id || '').trim().toLowerCase();
    const slug = String(c.slug || '').trim().toLowerCase();
    const username = String(c.username || '').trim().toLowerCase();

    return id === safeTarget || slug === safeTarget || username === safeTarget;
  });
}

function resolveAssetUrl(path) {
  if (!path || typeof path !== 'string') return '';

  const trimmed = path.trim();

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('//')
  ) {
    return trimmed;
  }

  const cleanedBase = BASE_PATH.replace(/\/+$/, '');
  const cleanedPath = trimmed.replace(/^\/+/, '');

  return `${cleanedBase}/${cleanedPath}`;
}

function loadCreatorProfile() {
  fetch('/data/creators.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar creators.json');
      }
      return response.json();
    })
    .then(creators => {
      const creator = findCreator(creators, CREATOR_TARGET);

      if (!creator) {
        console.error(`No se encontró el creador "${CREATOR_TARGET}" en creators.json`);
        return;
      }

      console.log('Creator encontrado:', creator);

      const profilePhotoEl = document.querySelector('.profile-photo');
      if (profilePhotoEl) {
        const avatarUrl = resolveAssetUrl(creator.avatar_url);

        console.log('avatar_url original:', creator.avatar_url);
        console.log('avatar_url resuelto:', avatarUrl);

        if (avatarUrl) {
          profilePhotoEl.src = avatarUrl;
          profilePhotoEl.alt = `Foto de perfil de ${creator.username || CREATOR_TARGET}`;

          profilePhotoEl.onerror = function () {
            console.warn('No se pudo cargar avatar_url:', avatarUrl);
            this.onerror = null;
            this.src = PROFILE_PLACEHOLDER;
          };
        } else {
          profilePhotoEl.src = PROFILE_PLACEHOLDER;
        }
      }

      const usernameEl = document.querySelector('.username');
      if (usernameEl) {
        const username = creator.username || CREATOR_TARGET;
        usernameEl.textContent = username.startsWith('@') ? username : `@${username}`;
      }

      const descEl = document.querySelector('.profile-description');
      if (descEl && creator.description) {
        descEl.textContent = creator.description;
      }

      const natEl = document.getElementById('creator-nationality');
      const resEl = document.getElementById('creator-residence');

      if (natEl && creator.nationality) {
        natEl.textContent = creator.nationality;
      }

      if (resEl && creator.residence) {
        resEl.textContent = creator.residence;
      }

      loadFlags(creator);

      const tagsContainer = document.getElementById('creator-tags');
      if (tagsContainer && Array.isArray(creator.tags)) {
        tagsContainer.innerHTML = '';

        creator.tags.forEach(tag => {
          const span = document.createElement('span');
          span.className = 'tag';
          span.textContent = tag;
          tagsContainer.appendChild(span);
        });
      }

      const gamesContainer = document.getElementById('creator-games');
      if (gamesContainer && Array.isArray(creator.games)) {
        gamesContainer.innerHTML = '<div class="loading-games">Cargando juegos...</div>';

        const gameNames = creator.games
          .map(g => g.title || g.name || g)
          .slice(0, 8);

        if (window.searchGamesRAWG) {
          window.searchGamesRAWG(gameNames)
            .then(rawgGames => {
              gamesContainer.innerHTML = '';

              rawgGames.forEach(game => {
                const card = document.createElement('article');
                card.className = 'game-card';

                const coverWrapper = document.createElement('div');
                coverWrapper.className = 'game-cover-wrapper';

                const img = document.createElement('img');
                img.className = 'game-cover';
                img.src = game.cover;
                img.alt = game.name;
                img.loading = 'lazy';

                img.onerror = function () {
                  this.onerror = null;
                  this.src = GAME_PLACEHOLDER;
                };

                const title = document.createElement('p');
                title.className = 'game-title';
                title.textContent = game.name;

                coverWrapper.appendChild(img);
                card.appendChild(coverWrapper);
                card.appendChild(title);
                gamesContainer.appendChild(card);
              });

              if (!rawgGames.length) {
                gamesContainer.innerHTML = '<p class="error-games">No se encontraron juegos</p>';
              }
            })
            .catch(error => {
              console.error(error);
              gamesContainer.innerHTML = '<p class="error-games">Error cargando juegos</p>';
            });
        } else {
          console.error('searchGamesRAWG no está disponible');
          gamesContainer.innerHTML = '<p class="error-games">RAWG no está cargado</p>';
        }
      }
    })
    .catch(err => {
      console.error(err);
    });
}

function loadFlags(creator) {
  if (creator.nationality) {
    const natFlag = document.getElementById('creator-nationality-flag');
    if (natFlag) {
      const countryName = creator.nationality.toLowerCase().trim();
      const countryCode = countryCodes[countryName] || countryName.slice(0, 2).toUpperCase();
      natFlag.innerHTML = `<img src="https://flagsapi.com/${countryCode}/flat/24.png" alt="${creator.nationality}" width="24" height="18">`;
    }
  }

  if (creator.residence) {
    const resFlag = document.getElementById('creator-residence-flag');
    if (resFlag) {
      const countryName = creator.residence.toLowerCase().trim();
      const countryCode = countryCodes[countryName] || countryName.slice(0, 2).toUpperCase();
      resFlag.innerHTML = `<img src="https://flagsapi.com/${countryCode}/flat/24.png" alt="${creator.residence}" width="24" height="18">`;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCreatorProfile);
} else {
  loadCreatorProfile();
}