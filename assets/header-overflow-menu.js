/*
 * Keeps the header nav row on a single line.
 *
 * Any top-level menu item that would wrap onto a second row is moved into a
 * trailing "More" item, which opens as a dropdown using the theme's existing
 * submenu styles. Re-runs on resize, so items move back when there is room.
 */
(function () {
  const WRAP_TOLERANCE = 1.5;
  const OPEN_CLASS = 'm-header__menu-more--open';

  class HeaderOverflowMenu extends HTMLElement {
    connectedCallback() {
      this.list = this.querySelector('[data-menu-list]');
      this.more = this.querySelector('[data-menu-more]');
      if (!this.list || !this.more) return;

      this.moreList = this.more.querySelector('[data-menu-more-list]');
      this.items = Array.from(this.list.children).filter((item) => item !== this.more);
      if (!this.moreList || this.items.length === 0) return;

      this.toggle = this.more.querySelector('a');
      if (this.toggle) {
        this.toggle.addEventListener('click', (event) => {
          event.preventDefault();
          this.setOpen(!this.more.classList.contains(OPEN_CLASS));
        });
      }

      this.onDocumentClick = (event) => {
        if (!this.more.contains(event.target)) this.setOpen(false);
      };
      this.onKeydown = (event) => {
        if (event.key === 'Escape') this.setOpen(false);
      };
      document.addEventListener('click', this.onDocumentClick);
      document.addEventListener('keydown', this.onKeydown);

      this.layout = this.layout.bind(this);
      this.onResize = debounce(this.layout, 100);

      this.layout();

      if ('ResizeObserver' in window) {
        // Observe the container, not this element: its width is independent of
        // how many items we move, so re-layouts cannot retrigger the observer.
        this.observer = new ResizeObserver(this.onResize);
        this.observer.observe(this.parentElement || this);
      }
      window.addEventListener('resize', this.onResize);

      // Web fonts land after first paint and change how much fits on the row.
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(this.layout);
    }

    disconnectedCallback() {
      if (this.observer) this.observer.disconnect();
      window.removeEventListener('resize', this.onResize);
      document.removeEventListener('click', this.onDocumentClick);
      document.removeEventListener('keydown', this.onKeydown);
    }

    setOpen(open) {
      this.more.classList.toggle(OPEN_CLASS, open);
      if (this.toggle) this.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    // The list is flex-wrap: wrap, so overflow shows up as extra height.
    isWrapping() {
      const reference = this.items[0] || this.more;
      const rowHeight = reference.offsetHeight;
      if (!rowHeight) return false;
      return this.list.offsetHeight > rowHeight * WRAP_TOLERANCE;
    }

    layout() {
      this.setOpen(false);

      // Start from the full row every time, so widening the window restores items.
      this.items.forEach((item) => this.list.insertBefore(item, this.more));
      this.more.hidden = true;

      if (!this.isWrapping()) return;

      // "More" takes up room itself, so reveal it before measuring again.
      this.more.hidden = false;

      for (let i = this.items.length - 1; i >= 0; i--) {
        if (!this.isWrapping()) break;
        this.moreList.insertBefore(this.items[i], this.moreList.firstChild);
      }

      if (this.moreList.children.length === 0) this.more.hidden = true;
    }
  }

  function debounce(fn, wait) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  if (!customElements.get('header-overflow-menu')) {
    customElements.define('header-overflow-menu', HeaderOverflowMenu);
  }
})();
