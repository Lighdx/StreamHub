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

    function createPlatformIcon(platform) {
      const wrapper = document.createElement("div");
      wrapper.className = "modal-platform-icon";

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "12");
      circle.setAttribute("cy", "12");
      circle.setAttribute("r", "9");

      const p = (platform || "").toLowerCase();
      if (p === "twitch") {
        circle.setAttribute("fill", "#9146FF");
      } else if (p === "youtube") {
        circle.setAttribute("fill", "#FF0000");
      } else if (p === "kick") {
        circle.setAttribute("fill", "#53FC18");
      } else if (p === "x" || p === "twitter") {
        circle.setAttribute("fill", "#000000");
      } else if (p === "instagram") {
        circle.setAttribute("fill", "#E1306C");
      } else {
        circle.setAttribute("fill", "#6b7280");
      }

      svg.appendChild(circle);
      wrapper.appendChild(svg);
      return wrapper;
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

      platformsContainer.innerHTML = "";
      (creator.platforms || []).forEach(p => {
        const icon = createPlatformIcon(p);
        platformsContainer.appendChild(icon);
      });

      const twitchId = creator.twitch_id || creator.username;
      const twitchUrl = `https://twitch.tv/${encodeURIComponent(twitchId)}`;
      twitchBtn.dataset.twitchUrl = twitchUrl;

      backdrop.setAttribute("aria-hidden", "false");
      backdrop.classList.add("is-visible");
      blurOverlay.classList.add("is-active");
      document.body.style.overflow = "hidden";

      if (closeBtn) {
        closeBtn.focus();
      }
    }

    backdrop.addEventListener("click", function (evt) {
      if (evt.target === backdrop) {
        close();
      }
    });

    closeBtn.addEventListener("click", close);

    document.addEventListener("keydown", function (evt) {
      if (evt.key === "Escape") {
        close();
      }
    });

    twitchBtn.addEventListener("click", function () {
      const url = twitchBtn.dataset.twitchUrl;
      if (!url) return;
      window.open(url, "_blank", "noopener");
    });

    window.VSDModal = {
      open,
      close
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    initModal();

    fetchCreators().then(creators => {
      if (window.VSDFilters) {
        window.VSDFilters.init(creators);
      }
      if (window.VSDInfiniteScroll) {
        window.VSDInfiniteScroll.init(creators);
      }
    });
  });
})();
