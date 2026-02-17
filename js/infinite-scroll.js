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
    if (p === "youtube" || p === "you tube") return "youtube";
    if (p === "kick") return "kick";
    if (p === "x" || p === "twitter") return "x";
    if (p === "instagram" || p === "ig") return "ig";
    if (p === "email" || p === "mail" || p === "correo") return "email";

    return null;
  }

  function createPlatformIcon(platform) {
    const key = normalizePlatformKey(platform);
    if (!key) return null;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "platform-icon-btn";
    btn.title = platform;
    btn.setAttribute("aria-label", platform);

    const icon = document.createElement("span");
    icon.className = `rrss-icon rrss--${key}`;
    icon.setAttribute("aria-hidden", "true");
    btn.appendChild(icon);

    return btn;
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
      const btn = createPlatformIcon(p);
      if (btn) platformsRow.appendChild(btn);
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
      const creator = filteredCreators[i];
      GRID.appendChild(createCard(creator));
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