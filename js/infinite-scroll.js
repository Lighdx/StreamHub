(function () {
  const GRID = document.getElementById("creatorsGrid");
  const SENTINEL = document.getElementById("gridSentinel");
  const LOADER = document.getElementById("loadingIndicator");
  const BATCH_SIZE = 20;

  let allCreators = [];
  let filteredCreators = [];
  let renderedCount = 0;
  let observer = null;

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

    const handle = raw.startsWith("@") ? raw.slice(1) : raw;

    if (key === "twitch") return `https://twitch.tv/${encodeURIComponent(handle)}`;
    if (key === "kick") return `https://kick.com/${encodeURIComponent(handle)}`;
    if (key === "x") return `https://x.com/${encodeURIComponent(handle)}`;
    if (key === "ig") return `https://instagram.com/${encodeURIComponent(handle)}`;
    if (key === "youtube") return `https://youtube.com/@${encodeURIComponent(handle)}`;
    if (key === "email") return `mailto:${handle}`;

    return null;
  }

  function getCreatorLink(creator, key) {
    // 1) Prioridad: creator.links[key] (handle o URL completa)
    if (creator && creator.links && creator.links[key]) {
      return buildUrlFromHandle(key, creator.links[key]);
    }

    // 2) Fallback: twitch_id o username si existe
    if (key === "twitch") {
      const twitchId = (creator.twitch_id || creator.username || "").trim();
      if (!twitchId) return null;
      return buildUrlFromHandle("twitch", twitchId);
    }

    return null;
  }

  function createPlatformIcon(creator, platform) {
    const key = normalizePlatformKey(platform);
    if (!key) return null;

    const url = getCreatorLink(creator, key);
    if (!url) return null;

    // ✅ Link real (clickeable)
    const a = document.createElement("a");
    a.className = "platform-icon-btn";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.title = platform;
    a.setAttribute("aria-label", platform);

    // Evita que el click “burbujee” y dispare otros handlers (por si luego haces click en card)
    a.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    const icon = document.createElement("span");
    icon.className = `rrss-icon rrss--${key}`;
    icon.setAttribute("aria-hidden", "true");

    a.appendChild(icon);
    return a;
  }

  function createCard(creator) {
    const card = document.createElement("article");
    card.className = "creator-card";
    card.dataset.id = creator.id;

    const avatarWrapper = document.createElement("div");
    avatarWrapper.className = "creator-avatar-wrapper";

    const img = document.createElement("img");
    img.className = "creator-avatar";
    img.alt = `Avatar de ${creator.username}`;
    img.loading = "lazy";
    img.src = creator.avatar_url || "assets/avatar-placeholder-1.png";

    avatarWrapper.appendChild(img);
    card.appendChild(avatarWrapper);

    function openModal() {
      if (window.VSDModal) window.VSDModal.open(creator);
    }

    avatarWrapper.addEventListener("click", openModal);

    const body = document.createElement("div");
    body.className = "creator-card-body";

    const usernameBtn = document.createElement("button");
    usernameBtn.type = "button";
    usernameBtn.className = "creator-username-btn";
    usernameBtn.textContent = `@${creator.username}`;
    usernameBtn.addEventListener("click", openModal);

    body.appendChild(usernameBtn);

    const platformsRow = document.createElement("div");
    platformsRow.className = "creator-platforms";

    (creator.platforms || []).forEach(p => {
      const el = createPlatformIcon(creator, p);
      if (el) platformsRow.appendChild(el);
    });

    body.appendChild(platformsRow);
    card.appendChild(body);

    requestAnimationFrame(() => {
      card.classList.add("is-visible");
    });

    return card;
  }

  function renderNextBatch() {
    if (renderedCount >= filteredCreators.length) return;
    LOADER.classList.add("is-visible");

    const start = renderedCount;
    const end = Math.min(start + BATCH_SIZE, filteredCreators.length);

    for (let i = start; i < end; i++) {
      GRID.appendChild(createCard(filteredCreators[i]));
    }

    renderedCount = end;
    LOADER.classList.remove("is-visible");
  }

  function recomputeFiltered() {
    filteredCreators = allCreators.filter(c => {
      return window.VSDFilters ? window.VSDFilters.matches(c) : true;
    });
  }

  function resetAndRender() {
    GRID.innerHTML = "";
    renderedCount = 0;
    recomputeFiltered();
    renderNextBatch();
  }

  function initObserver() {
    if (!SENTINEL) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) renderNextBatch();
      });
    }, { rootMargin: "200px 0px" });
    observer.observe(SENTINEL);
  }

  function init(creators) {
    allCreators = creators.slice();
    recomputeFiltered();
    renderNextBatch();
    initObserver();
  }

  window.VSDInfiniteScroll = {
    init,
    resetAndRender
  };
})();