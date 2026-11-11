/* MALLIRIS.GR — redesign sample · main.js (v2)
   Tabs, mega-menus (Προϊόντα / Κατασκευαστές), mobile menu, gallery, carousels,
   Q&A scroll, demo υπολογισμός μεταφορικών, category ?cat= εναλλαγή.
   Καθαρό vanilla JS — καμία βιβλιοθήκη πέρα από το Bootstrap bundle. */

(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------- bootstrap tabs */
  $$('[data-bs-toggle="tab"]').forEach(function (btn) {
    btn.addEventListener("shown.bs.tab", function (e) {
      $$('[data-bs-toggle="tab"]').forEach(function (b) {
        b.setAttribute("aria-selected", b === e.target ? "true" : "false");
      });
    });
  });

  /* --------------------------------------------------------------- mega menus */
  var panels = { products: $("#megaProducts"), brands: $("#megaBrands"),
                  productsOld: $("#megaProductsOld") };
  var triggers = $$('[data-mega]');
  var closeTimer = null;
  var isDesktop = function () { return window.matchMedia("(min-width: 992px)").matches; };

  function setTriggerState(which, open) {
    triggers.forEach(function (t) {
      if (t.dataset.mega === which) {
        t.classList.toggle("is-open", open);
        t.setAttribute("aria-expanded", open ? "true" : "false");
      }
    });
  }

  function closeAll() {
    Object.keys(panels).forEach(function (k) {
      if (!panels[k]) return;
      panels[k].classList.remove("is-open");
      setTriggerState(k, false);
    });
  }

  function openPanel(which) {
    closeAll();
    var p = panels[which];
    if (!p) return;
    p.classList.add("is-open");
    setTriggerState(which, true);
  }

  function togglePanel(which) {
    var p = panels[which];
    if (!p) return;
    if (p.classList.contains("is-open")) closeAll();
    else openPanel(which);
  }

  triggers.forEach(function (t) {
    var which = t.dataset.mega;
    t.addEventListener("mouseenter", function () {
      if (!isDesktop()) return;
      clearTimeout(closeTimer);
      openPanel(which);
    });
    t.addEventListener("click", function (e) {
      e.preventDefault();
      togglePanel(which);
    });
  });

  Object.keys(panels).forEach(function (k) {
    var p = panels[k];
    if (!p) return;
    p.addEventListener("mouseenter", function () {
      if (isDesktop()) clearTimeout(closeTimer);
    });
    p.addEventListener("mouseleave", function () {
      if (!isDesktop()) return;
      closeTimer = setTimeout(closeAll, 180);
    });
  });

  var header = $(".site-header");
  if (header) {
    header.addEventListener("mouseleave", function () {
      if (isDesktop()) closeTimer = setTimeout(closeAll, 220);
    });
    header.addEventListener("mouseenter", function () { clearTimeout(closeTimer); });
    window.addEventListener("scroll", function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }, { passive: true });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeAll(); closeMobile(); }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".site-header")) closeAll();
  });

  /* ------------------------------------------------- mega «Προϊόντα» — tabs */
  $$(".mp-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.dataset.tab;
      $$(".mp-tab").forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      $$(".mp-pane").forEach(function (p) {
        p.classList.toggle("is-active", p.dataset.pane === key);
      });
    });
    tab.addEventListener("mouseenter", function () {
      if (isDesktop()) tab.click();
    });
  });

  /* ------------------------------------------------------------ mobile menu */
  var mToggle = $(".nav-toggle");
  var mMenu = $("#mobileMenu");
  function closeMobile() {
    if (!mMenu) return;
    mMenu.classList.remove("is-open");
    if (mToggle) { mToggle.classList.remove("is-open"); mToggle.setAttribute("aria-expanded", "false"); }
  }
  if (mToggle && mMenu) {
    mToggle.addEventListener("click", function () {
      var openNow = !mMenu.classList.contains("is-open");
      mMenu.classList.toggle("is-open", openNow);
      mToggle.classList.toggle("is-open", openNow);
      mToggle.setAttribute("aria-expanded", openNow ? "true" : "false");
    });
    $$("a", mMenu).forEach(function (a) { a.addEventListener("click", closeMobile); });
  }

  /* ------------------------------------------------- product: gallery thumbs */
  var mainImg = document.getElementById("pp2MainImage") || document.getElementById("ppMainImage");
  if (mainImg) {
    var thumbs = $$(".pp2-thumb, .pp-thumb");
    thumbs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var src = btn.getAttribute("data-src");
        if (src) mainImg.src = src;
        thumbs.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      });
    });
  }

  /* ------------------------------------------------------- product: carousels */
  $$(".pp-carousel").forEach(function (section) {
    var track = $(".car-track", section);
    if (!track) return;
    $$(".car-arrows button", section).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = $(".product-card", track);
        var step = card ? card.getBoundingClientRect().width + 16 : 260;
        track.scrollBy({ left: step * parseInt(btn.dataset.dir, 10), behavior: "smooth" });
      });
    });
  });

  /* ------------------------------------------- product: «Τι λένε οι χρήστες» */
  $$('[data-scroll="qa"]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ------------------------------------------------- product: wishlist toggle */
  $$(".pp2-wish").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.classList.toggle("is-on");
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.innerHTML = on ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>';
    });
  });

  /* ------------- product: «Προσθήκη στο καλάθι» → stepper [−] n [+] (v3) */
  function bindAdd(btn) {
    btn.addEventListener("click", function () {
      var qty = 1;
      var wrap = document.createElement("div");
      wrap.className = "pp2-stepper";
      wrap.innerHTML =
        '<button type="button" data-step="-1" aria-label="Μείωση ποσότητας">&minus;</button>' +
        '<span class="qty" aria-live="polite">1</span>' +
        '<button type="button" data-step="1" aria-label="Αύξηση ποσότητας">+</button>';
      btn.replaceWith(wrap);

      var label = wrap.querySelector(".qty");
      wrap.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        var next = qty + parseInt(b.dataset.step, 10);
        if (next < 1) {                       /* στο 0 ξαναγίνεται το κουμπί */
          var back = document.createElement("button");
          back.type = "button";
          back.className = "pp2-add";
          back.innerHTML = '<i class="bi bi-cart2"></i> Προσθήκη στο καλάθι';
          bindAdd(back);
          wrap.replaceWith(back);
          return;
        }
        qty = next;
        label.textContent = qty;
      });
    });
  }
  $$(".pp2-add").forEach(bindAdd);

  /* --------------------------- product: demo υπολογισμός μεταφορικών (ACS) */
  var shipForm = document.getElementById("shipForm");
  var courier = document.getElementById("courierCard");
  var courierNote = document.getElementById("courierNote");
  if (shipForm && courier) {
    shipForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var field = document.getElementById("shipTk");
      var tk = field ? field.value.trim() : "";
      if (!tk) { if (field) field.focus(); return; }
      courier.classList.remove("is-idle");
      if (courierNote) courierNote.textContent = "Παράδοση 1-3 εργάσιμες · Τ.Κ. " + tk;
    });
  }

  /* ------------------------------- category: ενεργή κατηγορία από ?cat=slug */
  function isErgNow(slug) { return slug.indexOf("ergalia") > -1; }

  var catTitle = document.getElementById("catTitle");
  if (catTitle) {
    /* ο χάρτης slug→όνομα βγαίνει από το ίδιο το mega-menu (καμία διπλή λίστα) */
    var map = {};
    $$('.mp-col a[href*="cat="]').forEach(function (a) {
      var slug = decodeURIComponent((a.getAttribute("href") || "").split("cat=")[1] || "");
      if (slug) map[slug] = a.textContent.trim();
    });

    var activeSlug = new URLSearchParams(location.search).get("cat") || "53-kapakia";
    var name = map[activeSlug] || "ΚΑΠΑΚΙΑ";

    catTitle.textContent = name;
    var crumb = document.getElementById("catCrumb");
    if (crumb) {
      /* τα ονόματα στο site είναι ΚΕΦΑΛΑΙΑ χωρίς τόνους — για το breadcrumb
         κρατάμε σωστή ορθογραφία στις κατηγορίες που έχουν σελίδα */
      var nice = { kapakia: "Καπάκια", ergalia: "Εργαλεία" };
      var key = isErgNow(activeSlug) ? "ergalia" : (activeSlug.indexOf("kapakia") > -1 ? "kapakia" : "");
      crumb.textContent = nice[key] || name;
    }
    document.title = name + " | malliris.gr";

    var isErg = isErgNow(activeSlug);
    var isKap = activeSlug.indexOf("kapakia") > -1;

    $$(".product-grid[data-set]").forEach(function (g) {
      g.hidden = isErg ? g.dataset.set !== "ergalia" : g.dataset.set !== "kapakia";
    });

    var note = document.getElementById("catDemoNote");
    if (note) note.hidden = (isErg || isKap);

    var count = isErg ? 5 : 6;
    ["cntStock", "cntTo", "cntAll"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = count;
    });

    var checks = document.getElementById("brandChecks");
    if (checks) {
      checks.innerHTML = isErg
        ? '<label class="filter-check"><input type="checkbox" checked><span>KOLBENSCHMIDT (5)</span></label>'
        : '<label class="filter-check"><input type="checkbox" checked><span>CHINA (1)</span></label>' +
          '<label class="filter-check"><input type="checkbox" checked><span>AMC (5)</span></label>';
    }
  }
})();
