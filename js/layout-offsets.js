(function () {
  const root = document.documentElement;

  function px(n) {
    return `${Math.max(0, Math.round(n))}px`;
  }

  function setOffsets() {
    const header = document.querySelector(".site-header");
    const filtersBar = document.querySelector(".filters-bar");
    const filtersSection = document.querySelector(".filters-section");

    const headerH = header ? header.offsetHeight : 0;

    // Medimos SOLO lo visible fijo (barra), no el panel desplegable
    let filtersH = filtersBar ? filtersBar.offsetHeight : 0;

    // Suma padding vertical de la sección fija (tu "padding: 10px 0")
    if (filtersSection) {
      const cs = getComputedStyle(filtersSection);
      filtersH += parseFloat(cs.paddingTop) || 0;
      filtersH += parseFloat(cs.paddingBottom) || 0;
    }

    root.style.setProperty("--site-header-h", px(headerH));
    root.style.setProperty("--filters-h", px(filtersH));
  }

  window.addEventListener("DOMContentLoaded", setOffsets);
  window.addEventListener("load", setOffsets);
  window.addEventListener("resize", setOffsets);
  window.addEventListener("orientationchange", setOffsets);
})();
