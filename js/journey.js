/* ══════════════════════════════════════════════════════════════
   FairTransition – Customer Journey (Vanilla JS, keine Abhängigkeiten)
   Progressive Enhancement: Ohne JS sind alle Inhalte sichtbar.
   ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── MEDIENKONFIGURATION ─────────────────────────────────────
     Vor dem produktiven Livegang prüfen.
     Sobald das echte Medium unter media/fairtransition/ liegt,
     den jeweiligen Wert auf true setzen.
     showProductionGuides erst auf false setzen, wenn alle
     sichtbaren Platzhalter ersetzt wurden. */
  var mediaConfig = {
    showProductionGuides: true,
    heroPortrait: true ,        // 01-artem-hero-portrait.webp
    officeArrivalVideo: true ,  // 02-office-arrival.webm/.mp4
    reflectionVideo: true ,     // 03-reflection.webm/.mp4
    transitionRoomPhoto: true , // 04-empty-transition-room.webp
    knowledgeTransferPhoto: true , // 05-knowledge-transfer.webp
    founderClosingVideo: false, // 06-founder-closing.webm/.mp4 (+ -poster.webp)
    founderClosingPoster: true  // Poster als Standbild, bis das Video vorliegt
  };

  document.documentElement.classList.add("js");
  if (!mediaConfig.showProductionGuides) {
    document.body.classList.add("jr-hide-guides");
  }

  /* ── Echte Medien aktivieren (ersetzt die graue Box) ── */
  var MEDIA = {
    heroPortrait:        { type: "photo", src: "media/fairtransition/01-artem-hero-portrait.webp",
                           alt: "Artem Senik, Gründer von FairTransition, Halbportrait in ruhiger Büroumgebung" },
    officeArrivalVideo:  { type: "photo", src: "media/fairtransition/02-office-arrival.webp",
                           alt: "Artem Senik betritt einen ruhigen, hellen Besprechungsraum – der Moment vor einem wichtigen Gespräch" },
    reflectionVideo:     { type: "photo", src: "media/fairtransition/03-reflection.webp",
                           alt: "Artem Senik in der Abenddämmerung am Seeufer – ruhiger, nachdenklicher Moment" },
    transitionRoomPhoto: { type: "photo", src: "media/fairtransition/04-shoreline-perspective.webp",
                           alt: "Artem Senik am Seeufer, Blick Richtung Horizont – der nächste Abschnitt beginnt" },
    knowledgeTransferPhoto: { type: "photo", src: "media/fairtransition/05-knowledge-transfer.webp",
                           alt: "Strukturierte Notizen und Unterlagen beim Ordnen von Erfahrungswissen" },
    founderClosingVideo: { type: "video", base: "media/fairtransition/06-founder-closing",
                           poster: "media/fairtransition/06-founder-closing-poster.webp", controls: true }
  };

  Object.keys(MEDIA).forEach(function (key) {
    if (!mediaConfig[key]) return;
    var slot = document.querySelector('[data-media-key="' + key + '"]');
    if (!slot) return;
    var def = MEDIA[key], el;
    if (def.type === "photo") {
      el = document.createElement("img");
      el.src = def.src; el.alt = def.alt; el.loading = "lazy"; el.decoding = "async";
    } else {
      el = document.createElement("video");
      el.setAttribute("playsinline", "");
      el.preload = "metadata"; el.muted = !def.controls;
      if (def.controls) { el.controls = true; } else { el.loop = true; el.autoplay = false; }
      if (def.poster) el.poster = def.poster;
      ["webm", "mp4"].forEach(function (ext) {
        var s = document.createElement("source");
        s.src = def.base + "." + ext;
        s.type = "video/" + (ext === "mp4" ? "mp4" : "webm");
        el.appendChild(s);
      });
    }
    var ph = slot.querySelector(".jr-ph");
    if (ph) ph.remove();
    slot.appendChild(el);
    /* B-Roll ohne Controls: nur abspielen, wenn sichtbar (spart Akku/Daten) */
    if (def.type === "video" && !def.controls && "IntersectionObserver" in window &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? el.play().catch(function(){}) : el.pause(); });
      }, { threshold: 0.35 }).observe(el);
    }
  });

  /* Zwischenlösung: Poster als Standbild in Station 9, solange das
     Abschlussvideo noch nicht aufgenommen wurde. Sobald
     founderClosingVideo auf true steht, hat das Video Vorrang. */
  if (!mediaConfig.founderClosingVideo && mediaConfig.founderClosingPoster) {
    var vSlot = document.querySelector('[data-media-key="founderClosingVideo"]');
    if (vSlot && !vSlot.querySelector("img,video")) {
      var pImg = document.createElement("img");
      pImg.src = "media/fairtransition/06-founder-closing-poster.webp";
      pImg.alt = "Artem Senik, Gründer von FairTransition, in einem ruhigen Besprechungsraum – die persönliche Video-Botschaft folgt in Kürze";
      pImg.loading = "lazy"; pImg.decoding = "async";
      var vPh = vSlot.querySelector(".jr-ph");
      if (vPh) vPh.remove();
      vSlot.appendChild(pImg);
    }
  }

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Reveals, Sequenzen, Linien, Prozessschritte ── */
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in-view");
        if (e.target.classList.contains("jr-line")) e.target.classList.add("draw");
        io.unobserve(e.target);
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".jr-reveal, .jr-stagger, .jr-line, .jr-step")
      .forEach(function (n) { io.observe(n); });

    /* Station 2: aktive Sequenzzeile hervorheben */
    var seqIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle("in-view", e.isIntersecting);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll(".jr-seq p").forEach(function (p) { seqIo.observe(p); });

    /* Station 7: Prozesslinie wächst mit dem Scrollfortschritt */
    var proc = document.querySelector(".jr-proc");
    var procLine = document.querySelector(".jr-proc-line");
    if (proc && procLine) {
      var ticking = false;
      var updateLine = function () {
        var r = proc.getBoundingClientRect();
        var vh = window.innerHeight;
        var progress = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
        procLine.style.height = (progress * 100) + "%";
        ticking = false;
      };
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(updateLine); }
      }, { passive: true });
      updateLine();
    }
  } else {
    /* Ohne Observer/mit Reduced Motion: alles sofort sichtbar */
    document.querySelectorAll(".jr-line").forEach(function (l) { l.classList.add("draw"); });
    var pl = document.querySelector(".jr-proc-line");
    if (pl) pl.style.height = "100%";
  }

  /* ── Persistenter Kontaktzugang (Desktop): nach Station 1
        sichtbar, in der Einladung/Kontakt wieder ausgeblendet ── */
  var fixedCta = document.getElementById("jrFixedCta");
  var hero = document.getElementById("station-1");
  var endZone = document.getElementById("station-9");
  if (fixedCta && hero && endZone && "IntersectionObserver" in window) {
    var heroVisible = true, endVisible = false;
    var apply = function () {
      fixedCta.classList.toggle("visible", !heroVisible && !endVisible);
    };
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { heroVisible = e.isIntersecting; }); apply();
    }, { threshold: 0.15 }).observe(hero);
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { endVisible = e.isIntersecting; }); apply();
    }, { threshold: 0.05 }).observe(endZone);
  }
})();
