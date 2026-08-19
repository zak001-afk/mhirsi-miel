/* =========================================================
   MHIRSI MIEL - PHASE 1 CUSTOMER EXPERIENCE
   ========================================================= */
(function () {
  "use strict";

  const body = document.body;
  const nav = document.querySelector(".site-nav");
  const navList = document.querySelector(".site-nav ul");
  const languageSwitcher = document.querySelector(".language-switcher");

  /* ---------- Mobile navigation ---------- */
  if (nav && navList && !document.querySelector(".mobile-menu-toggle")) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-menu-toggle";
    toggle.setAttribute("aria-label", "Open navigation menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<i class="fa-solid fa-bars"></i><span>Menu</span>';

    nav.insertBefore(toggle, navList);

    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("mobile-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      toggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i><span>Close</span>'
        : '<i class="fa-solid fa-bars"></i><span>Menu</span>';
    });

    navList.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("mobile-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i><span>Menu</span>';
      });
    });
  }

  /* ---------- WhatsApp floating button ---------- */
  if (!document.querySelector(".whatsapp-float")) {
    const whatsapp = document.createElement("a");
    whatsapp.className = "whatsapp-float";
    whatsapp.href = "https://wa.me/21623797050";
    whatsapp.target = "_blank";
    whatsapp.rel = "noopener noreferrer";
    whatsapp.setAttribute("aria-label", "Contact Mhirsi Miel on WhatsApp");
    whatsapp.innerHTML = '<i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span>';
    body.appendChild(whatsapp);
  }

  /* ---------- Back to top ---------- */
  if (!document.querySelector(".back-to-top")) {
    const topButton = document.createElement("button");
    topButton.type = "button";
    topButton.className = "back-to-top";
    topButton.setAttribute("aria-label", "Back to top");
    topButton.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    body.appendChild(topButton);

    const updateTopButton = function () {
      topButton.classList.toggle("visible", window.scrollY > 450);
    };

    window.addEventListener("scroll", updateTopButton, { passive: true });
    updateTopButton();

    topButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Toast notifications ---------- */
  if (!document.querySelector(".site-toast")) {
    const toast = document.createElement("div");
    toast.className = "site-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    body.appendChild(toast);

    window.mhirsiToast = function (message) {
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(window.mhirsiToastTimer);
      window.mhirsiToastTimer = setTimeout(function () {
        toast.classList.remove("show");
      }, 2800);
    };
  }

  /* ---------- Loading animation ---------- */
  const loader = document.querySelector(".loading-spinner");
  if (loader) {
    loader.classList.add("active");
    window.addEventListener("load", function () {
      setTimeout(function () {
        loader.classList.remove("active");
        body.classList.add("page-ready");
      }, 250);
    });
  }

  /* ---------- Smooth page transitions ---------- */
  document.querySelectorAll('a[href]').forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
    if (link.target === "_blank" || href.startsWith("http") && !href.includes(window.location.host)) return;

    link.addEventListener("click", function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (link.closest(".language-dropdown")) return;

      event.preventDefault();
      const destination = link.href;
      const transition = document.createElement("div");
      transition.className = "page-transition page-transition-in";
      body.appendChild(transition);

      requestAnimationFrame(function () {
        transition.classList.add("visible");
      });

      setTimeout(function () {
        window.location.href = destination;
      }, 280);
    });
  });

  /* ---------- Keyboard shortcut ---------- */
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav) {
      nav.classList.remove("mobile-open");
      const toggle = document.querySelector(".mobile-menu-toggle");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i><span>Menu</span>';
      }
    }
  });

  /* ---------- Product search + filtering ---------- */
  const productGrid = document.querySelector(".product-grid");
  if (productGrid) {
    const cards = Array.from(productGrid.querySelectorAll(".product-card"));

    const controls = document.createElement("div");
    controls.className = "product-controls";
    controls.innerHTML = `
      <div class="product-search-wrap">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input id="product-search" type="search" placeholder="Search products..." autocomplete="off" />
      </div>
      <div class="product-filter-wrap" role="group" aria-label="Product filters">
        <button type="button" class="product-filter active" data-filter="all">All</button>
        <button type="button" class="product-filter" data-filter="floral">Floral</button>
        <button type="button" class="product-filter" data-filter="herbal">Herbal</button>
      </div>
    `;

    productGrid.parentElement.insertBefore(controls, productGrid);

    cards.forEach(function (card, index) {
      card.dataset.category = index === 0 ? "floral" : "herbal";
      card.dataset.search = card.textContent.toLowerCase();
    });

    const searchInput = controls.querySelector("#product-search");
    const filterButtons = controls.querySelectorAll(".product-filter");
    let currentFilter = "all";

    function applyProductFilter() {
      const query = searchInput.value.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach(function (card) {
        const categoryMatch = currentFilter === "all" || card.dataset.category === currentFilter;
        const searchMatch = !query || card.dataset.search.includes(query);
        const visible = categoryMatch && searchMatch;

        card.classList.toggle("product-hidden", !visible);
        if (visible) visibleCount += 1;
      });

      let empty = productGrid.parentElement.querySelector(".product-empty");
      if (!visibleCount) {
        if (!empty) {
          empty = document.createElement("p");
          empty.className = "product-empty";
          empty.textContent = "No products match your search.";
          productGrid.parentElement.appendChild(empty);
        }
        if (window.mhirsiToast) window.mhirsiToast("No products found.");
      } else if (empty) {
        empty.remove();
      }
    }

    searchInput.addEventListener("input", applyProductFilter);
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;
        filterButtons.forEach(function (item) { item.classList.remove("active"); });
        button.classList.add("active");
        applyProductFilter();
      });
    });
  }
})();
