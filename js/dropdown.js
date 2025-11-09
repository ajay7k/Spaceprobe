// dropdown.js
(function () {
  "use strict";

  // Safe init after DOM ready (works even without defer)
  function initDropdown() {
    const toggle = document.querySelector(".dropdown-toggle");
    const card = document.querySelector(".dropdown-card");

    // if elements aren't present, stop silently
    if (!toggle || !card) {
      // Uncomment for debugging:
      // console.warn("Dropdown: .dropdown-toggle or .dropdown-card not found.");
      return;
    }

    // Accessibility attributes
    toggle.setAttribute("aria-expanded", "false");
    card.setAttribute("aria-hidden", "true");
    card.style.overflow = "hidden";

    // Helper to open / close using maxHeight for smooth transition
    function openCard() {
      card.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      card.setAttribute("aria-hidden", "false");

      // ensure it's visible for measurements
      card.style.display = "block";

      // allow the browser to compute layout before measuring
      requestAnimationFrame(() => {
        const h = card.scrollHeight;
        card.style.maxHeight = h + "px";
        // remove inline maxHeight after transition to allow content changes
        setTimeout(() => { 
          if (card.classList.contains("active")) card.style.maxHeight = "1000px";
        }, 650);
      });
    }

    function closeCard() {
      card.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      card.setAttribute("aria-hidden", "true");

      // set to measured height first so transition works from current size
      const h = card.scrollHeight;
      card.style.maxHeight = h + "px";

      // need rAF to ensure previous line takes effect
      requestAnimationFrame(() => {
        card.style.maxHeight = "0px";
      });

      // hide after transition (matching CSS duration ~600ms)
      setTimeout(() => {
        if (!card.classList.contains("active")) card.style.display = "none";
      }, 650);
    }

    // Toggle handler
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (card.classList.contains("active")) closeCard();
      else openCard();
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!card.classList.contains("active")) return;
      if (!card.contains(e.target) && !toggle.contains(e.target)) {
        closeCard();
      }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && card.classList.contains("active")) {
        closeCard();
      }
    });

    // If page is loaded with CSS showing .active, ensure maxHeight set
    if (card.classList.contains("active")) {
      card.style.display = "block";
      card.style.maxHeight = card.scrollHeight + "px";
      toggle.setAttribute("aria-expanded", "true");
      card.setAttribute("aria-hidden", "false");
    } else {
      // ensure hidden at start
      card.style.display = "none";
      card.style.maxHeight = "0px";
    }
  }

  // DOMContentLoaded fallback
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDropdown);
  } else {
    initDropdown();
  }
})();
