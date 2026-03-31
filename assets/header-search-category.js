document.addEventListener(
  "submit",
  function (e) {
    const form = e.target;
    if (!form || form.tagName !== "FORM" || form.getAttribute("data-category-search") !== "true") return;
    const select = form.querySelector("[data-header-search-category-select]");
    if (!select) return;
    const handle = (select.value || "").trim();
    if (!handle) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof select.reportValidity === "function") select.reportValidity();
      return;
    }
    const input = form.querySelector('input[name="q"]');
    const q = input ? input.value.trim() : "";
    if (!q) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const base = form.getAttribute("data-collections-base") || "";
    let url = base + encodeURIComponent(handle) + "?q=" + encodeURIComponent(q);
    const productType = form.querySelector("#product_type_input");
    if (productType && productType.name && productType.value) {
      const sep = url.includes("?") ? "&" : "?";
      url = url + sep + encodeURIComponent(productType.name) + "=" + encodeURIComponent(productType.value);
    }
    window.location.assign(url);
  },
  true
);

(function initHeaderSearchCategorySelect() {
  function syncDefault(form) {
    const handle = form.getAttribute("data-default-collection");
    const sel = form.querySelector("[data-header-search-category-select]");
    if (!sel) return;
    if (handle) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === handle) {
          sel.selectedIndex = i;
          return;
        }
      }
      sel.selectedIndex = 0;
    }
  }
  function run() {
    document.querySelectorAll('form[data-category-search="true"]').forEach(syncDefault);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
