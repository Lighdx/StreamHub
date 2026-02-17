(function () {
  const DATA_URL = "data/creators.json";

  function fetchCreators() {
    return fetch(DATA_URL)
      .then(r => r.json())
      .catch(err => {
        console.error("Error loading creators.json", err);
        return [];
      });
  }

  function normalizePlatformKey(platform) {
    const p = (platform || "").trim().toLowerCase();
    if (!p) return null;

    if (p === "twitch") return "twitch";
    if (p === "kick") return "kick";
    if (p === "youtube" || p === "you tube") return "youtube";
    if (p === "x" || p === "twitter") return "x";
    if (p === "instagram" || p === "ig") return "ig";
    if (p === "email" || p === "mail" || p === "correo") return "email";

    return null;
  }

  function createRrssIcon(key) {
    const span = document.createElement("span");
    span.className = `rrss-icon rrss--${key}`;
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  function initModal() {
    const backdrop = document.getElementById("profileModal");
    const blurOverlay = document.getElementById("appBlurOverlay");
    const closeBtn = document.getElementById("modalCloseBtn");
    const avatar = document.getElementById("modalAvatar");
    const usernameEl = document.getElementById("modalUsername");
    const bioEl = document.getElementById("modalBio");
    const tagsContainer = document.getElementById("modalTagsContainer");
    const gamesContainer = document.getElementById("modalGamesContainer");
    const followersEl = document.getElementById("modalFollowers");
    const residenceEl = document.getElementById("modalLiveStatus");
    const nationalityEl = document.getElementById("modalStreamTitle");
    const twitchBtn = document.getElementById("modalTwitchButton");
    const platformsContainer = document.getElementById("modalPlatformsContainer");

    let currentCreator = null;

    function close() {
      backdrop.classList.remove("is-visible");
      backdrop.setAttribute("aria-hidden", "true");
      blurOverlay.classList.remove("is-active");
      document.body.style.overflow = "";
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      currentCreator = null;
    }

    function open(creator) {
      currentCreator = creator;

      avatar.src = creator.avatar_url || "assets/avatar-placeholder-1.png";
      avatar.alt = `Avatar de ${creator.username}`;
      usernameEl.textContent = `@${creator.username}`;
      bioEl.textContent = creator.bio || "Este creador aún no tiene biografía.";

      tagsContainer.innerHTML = "";
      (creator.tags || []).forEach(tag => {
        const span = document.createElement("span");
        span.className = "modal-tag-pill";
        span.textContent = tag;
        tagsContainer.appendChild(span);
      });

      gamesContainer.innerHTML = "";
      (creator.games || []).forEach(game => {
        const span = document.createElement("span");
        span.className = "modal-tag-pill";
        span.textContent = game;
        gamesContainer.appendChild(span);
      });

      followersEl.textContent = creator.followers || "—";
      residenceEl.textContent = creator.residence || "Desconocido";
      nationalityEl.textContent = creator.nationality || "Sin datos";

      // ✅ Redes (iconos desde /assets/rrss)
      platformsContainer.innerHTML = "";
      (creator.platforms || []).forEach(platform => {
        const key = normalizePlatformKey(platform);
        if (!key) return;

        const item = document.createElement("div");
        item.className = "modal-platform-icon";
        item.setAttribute("title", platform);
        item.setAttribute("aria-label", platform);
        item.appendChild(createRrssIcon(key));
        platformsContainer.appendChild(item);
      });

      const twitchId = creator.twitch_id || creator.username;
      const twitchUrl = `https://twitch.tv/${encodeURIComponent(twitchId)}`;
      twitchBtn.dataset.twitchUrl = twitchUrl;

      backdrop.setAttribute("aria-hidden", "false");
      backdrop.classList.add("is-visible");
      blurOverlay.classList.add("is-active");
      document.body.style.overflow = "hidden";

      if (closeBtn) closeBtn.focus();
    }

    backdrop.addEventListener("click", function (evt) {
      if (evt.target === backdrop) close();
    });

    closeBtn.addEventListener("click", close);

    document.addEventListener("keydown", function (evt) {
      if (evt.key === "Escape") close();
    });

    twitchBtn.addEventListener("click", function () {
      const url = twitchBtn.dataset.twitchUrl;
      if (!url) return;
      window.open(url, "_blank", "noopener");
    });

    window.VSDModal = { open, close };
  }

  document.addEventListener("DOMContentLoaded", function () {
    initModal();

    fetchCreators().then(creators => {
      if (window.VSDFilters) window.VSDFilters.init(creators);
      if (window.VSDInfiniteScroll) window.VSDInfiniteScroll.init(creators);
    });
  });
})();