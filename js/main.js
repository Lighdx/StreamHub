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

  function isProbablyUrl(value) {
    const v = (value || "").trim().toLowerCase();
    return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("mailto:");
  }

  function buildUrlFromHandle(key, handleOrUrl) {
    if (!handleOrUrl) return null;
    const raw = String(handleOrUrl).trim();
    if (!raw) return null;

    if (isProbablyUrl(raw)) return raw;

    // Si te pasan "@usuario", lo normalizamos
    const handle = raw.startsWith("@") ? raw.slice(1) : raw;

    if (key === "twitch") return `https://twitch.tv/${encodeURIComponent(handle)}`;
    if (key === "kick") return `https://kick.com/${encodeURIComponent(handle)}`;
    if (key === "x") return `https://x.com/${encodeURIComponent(handle)}`;
    if (key === "ig") return `https://instagram.com/${encodeURIComponent(handle)}`;
    if (key === "youtube") {
      // YouTube puede ser canal/handle; con @handle suele funcionar:
      return `https://youtube.com/@${encodeURIComponent(handle)}`;
    }
    if (key === "email") return `mailto:${handle}`;

    return null;
  }

  function getCreatorLink(creator, key) {
    // 1) Si existe creator.links[key], lo usamos (puede ser URL completa o handle corto)
    if (creator && creator.links && creator.links[key]) {
      return buildUrlFromHandle(key, creator.links[key]);
    }

    // 2) Fallbacks de compatibilidad con tu JSON antiguo
    if (key === "twitch") {
      const twitchId = (creator.twitch_id || creator.username || "").trim();
      if (!twitchId) return null;
      return buildUrlFromHandle("twitch", twitchId);
    }

    return null;
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

      // ✅ Redes clickeables (anchors)
      platformsContainer.innerHTML = "";

      (creator.platforms || []).forEach(platformName => {
        const key = normalizePlatformKey(platformName);
        if (!key) return;

        const url = getCreatorLink(creator, key);
        if (!url) return;

        const a = document.createElement("a");
        a.className = "modal-platform-icon";
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.title = platformName;
        a.setAttribute("aria-label", platformName);

        const icon = document.createElement("span");
        icon.className = `rrss-icon rrss--${key}`;
        icon.setAttribute("aria-hidden", "true");

        a.appendChild(icon);
        platformsContainer.appendChild(a);
      });

      // Botón Twitch: usa links.twitch si existe; si no, fallback a twitch_id/username
      const twitchUrl = getCreatorLink(creator, "twitch");
      if (twitchUrl) {
        twitchBtn.dataset.twitchUrl = twitchUrl;
        twitchBtn.disabled = false;
        twitchBtn.style.opacity = "";
        twitchBtn.style.cursor = "";
      } else {
        twitchBtn.dataset.twitchUrl = "";
        twitchBtn.disabled = true;
        twitchBtn.style.opacity = "0.6";
        twitchBtn.style.cursor = "not-allowed";
      }

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