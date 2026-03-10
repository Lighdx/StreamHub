// 🎌 Mapa de países a códigos ISO2 correctos (agregué los principales)
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

// función principal
function loadCreatorProfile() {
  // 1) Pedimos el JSON
  fetch('/data/creators.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar creators.json');
      }
      return response.json();
    })
    .then(creators => {
      // 2) Buscamos específicamente al creador "BillyBillete"
      const creator = creators.find(c => c.id === 'BillyBillete' || c.slug === 'BillyBillete' || c.username === 'BillyBillete');

      if (!creator) {
        console.error('No se encontró el creador "BillyBillete" en creators.json');
        return;
      }

      // 3) Rellenamos los campos del DOM

      // descripción
      const descEl = document.querySelector('.profile-description');
      if (descEl && creator.description) {
        descEl.textContent = creator.description;
      }

      // nacionalidad y residencia (TEXTO)
      const natEl = document.getElementById('creator-nationality');
      const resEl = document.getElementById('creator-residence');

      if (natEl && creator.nationality) {
        natEl.textContent = creator.nationality;
      }
      if (resEl && creator.residence) {
        resEl.textContent = creator.residence;
      }

      // 🎌 FlagsAPI para banderas (dinámico por cualquier creador)
      loadFlags(creator);

      // tags de "tipo de contenido"
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

      // 🎮 JUEGOS CON IGDB API REAL (nuevo)
      const gamesContainer = document.getElementById('creator-games');
      if (gamesContainer && Array.isArray(creator.games)) {
        gamesContainer.innerHTML = '<div class="loading-games">🔄 Cargando juegos...</div>';
        
        // Llamamos IGDB (requiere igdb-api.js cargado antes)
        const gameNames = creator.games.map(g => g.title || g.name || g).slice(0, 8);
        window.searchGamesIGDB(gameNames)
          .then(igdbGames => {
            gamesContainer.innerHTML = '';
            
            igdbGames.forEach(game => {
              const card = document.createElement('article');
              card.className = 'game-card';

              const coverWrapper = document.createElement('div');
              coverWrapper.className = 'game-cover-wrapper';

              const img = document.createElement('img');
              img.className = 'game-cover';
              img.src = game.cover;
              img.alt = game.name;
              img.loading = 'lazy';

              const title = document.createElement('p');
              title.className = 'game-title';
              title.textContent = game.name;

              coverWrapper.appendChild(img);
              card.appendChild(coverWrapper);
              card.appendChild(title);
              gamesContainer.appendChild(card);
            });
          })
          .catch(() => {
            gamesContainer.innerHTML = '<p class="error-games">Error cargando juegos</p>';
          });
      }
    })
    .catch(err => {
      console.error(err);
    });
}

// 🎌 FUNCIÓN FlagsAPI con mapa de países
function loadFlags(creator) {
  // Nacionalidad
  if (creator.nationality) {
    const natFlag = document.getElementById('creator-nationality-flag');
    if (natFlag) {
      const countryName = creator.nationality.toLowerCase().trim();
      const countryCode = countryCodes[countryName] || countryName.slice(0, 2).toUpperCase();
      
      natFlag.innerHTML = `<img src="https://flagsapi.com/${countryCode}/flat/24.png" alt="${creator.nationality}" width="24" height="18">`;
    }
  }

  // Residencia
  if (creator.residence) {
    const resFlag = document.getElementById('creator-residence-flag');
    if (resFlag) {
      const countryName = creator.residence.toLowerCase().trim();
      const countryCode = countryCodes[countryName] || countryName.slice(0, 2).toUpperCase();
      
      resFlag.innerHTML = `<img src="https://flagsapi.com/${countryCode}/flat/24.png" alt="${creator.residence}" width="24" height="18">`;
    }
  }
}

// 4) DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCreatorProfile);
} else {
  loadCreatorProfile();
}
