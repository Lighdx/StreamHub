(function () {
  const root = document.documentElement;

  function px(n) {
    return `${Math.max(0, Math.round(n))}px`;
  }

  function setOffsets() {
    const header = document.querySelector(".site-header");
    const filtersBar = document.querySelector(".filters-bar");
    const filtersSection = document.querySelector(".filters-section");

    const headerH = header ? header.offsetHeight : 0; // incluye padding/borde [web:344]

    // Solo la barra visible (sin contar el panel desplegable)
    let filtersH = filtersBar ? filtersBar.offsetHeight : 0; // incluye padding/borde [web:344]

    // Suma el padding vertical del contenedor fijo (tu 10px 0)
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