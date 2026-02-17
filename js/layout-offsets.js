(function () {
  const root = document.documentElement;

  function setOffsets() {
    const header = document.querySelector(".site-header");
    const filters = document.querySelector(".filters-section");

    if (header) root.style.setProperty("--site-header-h", `${header.offsetHeight}px`);
    if (filters) root.style.setProperty("--filters-h", `${filters.offsetHeight}px`);
  }

  window.addEventListener("DOMContentLoaded", setOffsets);
  window.addEventListener("load", setOffsets);
  window.addEventListener("resize", setOffsets);
  window.addEventListener("orientationchange", setOffsets);
})();