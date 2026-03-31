document.addEventListener(
  "submit",
  function (e) {
    const form = e.target;
    if (!form || form.tagName !== "FORM" || form.getAttribute("data-category-search") !== "true") return;
    const valueInput = form.querySelector("[data-header-search-category-value]");
    if (!valueInput) return;
    const handle = (valueInput.value || "").trim();
    if (!handle) return;
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

(function initHeaderSearchCategory() {
  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function closePanel(dd) {
    const btn = qs(dd, ".m-search-category-dd__toggle");
    const panel = qs(dd, ".m-search-category-dd__panel");
    if (!btn || !panel) return;
    dd.classList.remove("m-open");
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  }

  function openPanel(dd) {
    const btn = qs(dd, ".m-search-category-dd__toggle");
    const panel = qs(dd, ".m-search-category-dd__panel");
    if (!btn || !panel) return;
    dd.classList.add("m-open");
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  }

  function applyOption(dd, optionEl) {
    const hidden = qs(dd, "[data-header-search-category-value]");
    const labelEl = qs(dd, "[data-search-category-current]");
    const val = optionEl.getAttribute("data-value") || "";
    const lab = optionEl.getAttribute("data-label") || optionEl.textContent.trim();
    if (hidden) hidden.value = val;
    if (labelEl) labelEl.textContent = lab;
    dd.querySelectorAll("[data-search-category-option]").forEach((o) => {
      const on = o === optionEl;
      o.classList.toggle("is-selected", on);
      o.setAttribute("aria-selected", on ? "true" : "false");
    });
    closePanel(dd);
  }

  function initDropdown(dd) {
    const btn = qs(dd, ".m-search-category-dd__toggle");
    const panel = qs(dd, ".m-search-category-dd__panel");
    if (!btn || !panel) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const wasOpen = dd.classList.contains("m-open");
      document.querySelectorAll("[data-search-category-dropdown].m-open").forEach(closePanel);
      if (!wasOpen) openPanel(dd);
    });
    panel.addEventListener("click", function (e) {
      const opt = e.target.closest("[data-search-category-option]");
      if (!opt || !dd.contains(opt)) return;
      e.preventDefault();
      applyOption(dd, opt);
    });
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-search-category-dropdown]")) return;
    document.querySelectorAll("[data-search-category-dropdown].m-open").forEach(closePanel);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll("[data-search-category-dropdown].m-open").forEach(closePanel);
  });

  function syncDefault(form) {
    const handle = form.getAttribute("data-default-collection");
    if (!handle) return;
    const dd = form.querySelector("[data-search-category-dropdown]");
    if (!dd) return;
    const opts = dd.querySelectorAll("[data-search-category-option]");
    for (let i = 0; i < opts.length; i++) {
      if ((opts[i].getAttribute("data-value") || "") === handle) {
        applyOption(dd, opts[i]);
        return;
      }
    }
  }

  function run() {
    document.querySelectorAll("[data-search-category-dropdown]").forEach(initDropdown);
    document.querySelectorAll('form[data-category-search="true"]').forEach(syncDefault);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
