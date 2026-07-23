/* ================================================================
   FAIRTRANSITION.CH – Shared JavaScript
   Version 2.0
================================================================ */

(function() {
  'use strict';

  /* ── Nav toggle ─────────────────────────────────────────── */
  var navToggle = document.getElementById('navToggle');
  var nav       = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function() {
      nav.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', nav.classList.contains('nav-open'));
    });
    document.querySelectorAll('.nav-links a, .nav-cta').forEach(function(a) {
      a.addEventListener('click', function() {
        nav.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Active nav link (current page) ─────────────────────── */
  var path = window.location.pathname.replace(/\/$/, '');
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    var href = a.getAttribute('href');
    if (!href) return;
    var hrefPath = href.split('#')[0].replace(/\/$/, '');
    if (hrefPath && path.endsWith(hrefPath)) a.classList.add('active');
  });

  /* ── Ablauf tabs ─────────────────────────────────────────── */
  document.querySelectorAll('.ablauf-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.ablauf-tab').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.ablauf-steps').forEach(function(p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add('active');
    });
  });

  /* ── FAQ tabs ────────────────────────────────────────────── */
  document.querySelectorAll('.faq-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.faq-tab').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.faq-panel').forEach(function(p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById(btn.dataset.panel);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── FAQ accordion ───────────────────────────────────────── */
  document.querySelectorAll('.faq-q').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item   = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Scroll reveal ───────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(function(el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el) {
      el.classList.add('visible');
    });
  }

  /* ── Kontakt form (Formspree AJAX) ──────────────────────── */
  var kontaktForm = document.getElementById('kontakt-form');
  if (kontaktForm) {
    kontaktForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var btn    = document.getElementById('submit-btn');
      var status = document.getElementById('form-status');
      if (!btn || !status) return;

      btn.disabled    = true;
      btn.textContent = 'Wird gesendet…';
      status.style.display = 'none';

      try {
        var res = await fetch(kontaktForm.action, {
          method: 'POST',
          body: new FormData(kontaktForm),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          status.style.display = 'block';
          status.style.color   = '#065f46';
          status.textContent   = '✓ Vielen Dank – wir melden uns innerhalb von 24 Stunden.';
          kontaktForm.reset();
          trackEvent('form_submit', { form: 'kontakt' });
        } else {
          throw new Error('error');
        }
      } catch(err) {
        status.style.display = 'block';
        status.style.color   = '#991b1b';
        status.textContent   = 'Etwas ist schiefgelaufen. Bitte schreiben Sie direkt an kontakt@fairtransition.ch';
      } finally {
        btn.textContent = 'Nachricht senden';
        btn.disabled    = false;
      }
    });
  }

  /* ── Assessment multi-step form ─────────────────────────── */
  var assessmentForm = document.getElementById('assessment-form');
  if (assessmentForm) {
    var currentStep = 1;
    var totalSteps  = 6;

    function showStep(n) {
      document.querySelectorAll('.assessment-step').forEach(function(s) { s.classList.remove('active'); });
      document.querySelectorAll('.progress-step').forEach(function(s, i) {
        s.classList.remove('active', 'done');
        if (i + 1 < n) s.classList.add('done');
        if (i + 1 === n) s.classList.add('active');
      });
      var step = document.getElementById('step-' + n);
      if (step) step.classList.add('active');
      currentStep = n;
      var nextBtn = document.getElementById('next-btn');
      var backBtn = document.getElementById('back-btn');
      if (nextBtn) nextBtn.textContent = (n === totalSteps) ? 'Vertraulich absenden' : 'Weiter';
      if (backBtn) backBtn.style.visibility = (n === 1) ? 'hidden' : 'visible';
    }

    document.querySelectorAll('.choice-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var group = btn.closest('.choice-grid');
        if (!group) return;
        group.querySelectorAll('.choice-btn').forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
      });
    });

    var nextBtn = document.getElementById('next-btn');
    var backBtn = document.getElementById('back-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', async function() {
        if (currentStep < totalSteps) {
          showStep(currentStep + 1);
        } else {
          // Submit
          var btn    = nextBtn;
          var status = document.getElementById('assessment-status');
          btn.disabled    = true;
          btn.textContent = 'Wird übermittelt…';
          try {
            var formData = new FormData(assessmentForm);
            // Collect choice selections
            document.querySelectorAll('.choice-btn.selected').forEach(function(cb) {
              var name  = cb.closest('[data-field]') ? cb.closest('[data-field]').dataset.field : 'option';
              var value = cb.textContent.trim();
              formData.append(name, value);
            });
            var res = await fetch(assessmentForm.action, {
              method: 'POST', body: formData,
              headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
              assessmentForm.innerHTML = '<div style="text-align:center;padding:32px 0"><p style="font-size:1.5rem;margin-bottom:12px">✓</p><h3 style="color:var(--blue);margin-bottom:12px">Vielen Dank.</h3><p style="color:var(--gray)">Ihre Angaben wurden übermittelt. FairTransition prüft die Situation persönlich und meldet sich über den von Ihnen gewählten Kontaktweg.<br><br><em>Es erfolgt keine automatische Entscheidung oder Bewertung.</em></p></div>';
              trackEvent('assessment_complete');
            } else { throw new Error('error'); }
          } catch(err) {
            if (status) { status.style.display = 'block'; status.textContent = 'Fehler beim Senden. Bitte schreiben Sie an kontakt@fairtransition.ch'; }
            btn.disabled = false; btn.textContent = 'Vertraulich absenden';
          }
        }
      });
    }
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        if (currentStep > 1) showStep(currentStep - 1);
      });
    }
    showStep(1);
  }

  /* ── Modal ───────────────────────────────────────────────── */
  window.openModal = function(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
  };
  window.closeModal = function(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
  };
  document.querySelectorAll('.modal-close').forEach(function(btn) {
    btn.addEventListener('click', function() { closeModal(btn.dataset.close); });
  });
  document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(overlay.id); });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(function(o) { closeModal(o.id); });
    }
  });

  /* ── Lightweight Analytics tracking ─────────────────────── */
  function trackEvent(name, data) {
    // Privacy-friendly: no external service. Can be wired to Plausible/Fathom later.
    if (window.console && window.location.hostname !== 'localhost') {
      // placeholder for privacy-respecting analytics
    }
  }

  // CTA click tracking
  document.querySelectorAll('[data-track]').forEach(function(el) {
    el.addEventListener('click', function() { trackEvent(el.dataset.track); });
  });

  // Link tracking
  var emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(function(a) { a.addEventListener('click', function() { trackEvent('click_email'); }); });
  var telLinks = document.querySelectorAll('a[href^="tel:"]');
  telLinks.forEach(function(a) { a.addEventListener('click', function() { trackEvent('click_phone'); }); });

})();
