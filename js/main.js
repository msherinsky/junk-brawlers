/* ============================================================
   Junk Brawlers LLC — Main JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Hamburger / Mobile Nav ── */
  function initHamburger() {
    var hamburger = document.getElementById('hamburger');
    var mobileNav = document.getElementById('mobileNav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
      }
    });
  }

  /* ── Dropdown Nav ── */
  function initDropdowns() {
    document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
      var btn = dropdown.querySelector('button');
      if (!btn) return;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = dropdown.classList.toggle('open');
        document.querySelectorAll('.nav-dropdown').forEach(function (other) {
          if (other !== dropdown) other.classList.remove('open');
        });
        btn.setAttribute('aria-expanded', isOpen);
      });
    });

    document.addEventListener('click', function () {
      document.querySelectorAll('.nav-dropdown').forEach(function (d) {
        d.classList.remove('open');
      });
    });
  }

  /* ── FAQ Accordion ── */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  /* ── Sticky header shadow on scroll ── */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle('scrolled', window.scrollY > 10);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Site data (review count, rating) ── */
  function initSiteData() {
    if (typeof JBSiteData === 'undefined') return;
    document.querySelectorAll('[data-jb-count]').forEach(function (el) {
      el.textContent = JBSiteData.reviewCount;
    });
    document.querySelectorAll('[data-jb-rating]').forEach(function (el) {
      el.textContent = JBSiteData.rating;
    });
    document.querySelectorAll('[data-jb-badge]').forEach(function (el) {
      el.setAttribute('aria-label', JBSiteData.rating + ' stars, ' + JBSiteData.reviewCount + ' Google reviews');
    });
  }

  /* ── Quote Modal ── */
  function initQuoteModal() {
    var isContactPage = window.location.pathname.toLowerCase().indexOf('contact') !== -1;

    if (isContactPage) {
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('a[href*="contact"]');
        if (!btn) return;
        var section = document.getElementById('contact-form');
        if (!section) return;
        e.preventDefault();
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    var overlay = document.createElement('div');
    overlay.id = 'jb-quote-modal';
    overlay.className = 'jb-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Get a Free Quote');
    overlay.innerHTML =
      '<div class="jb-modal-card">' +
        '<button class="jb-modal-close" aria-label="Close">&times;</button>' +
        '<img src="images/logo.webp" alt="Junk Brawlers" class="jb-modal-logo">' +
        '<h2 class="jb-modal-heading">Get a Free Quote.</h2>' +
        '<p class="jb-modal-sub">North Georgia\'s 5-star rated hauler. Usually responds within minutes.</p>' +
        '<form class="jb-modal-form" novalidate>' +
          '<div class="jb-form-row">' +
            '<div class="jb-form-group">' +
              '<label for="jb-firstName">First Name *</label>' +
              '<input type="text" id="jb-firstName" name="firstName" placeholder="Your first name" autocomplete="given-name">' +
            '</div>' +
            '<div class="jb-form-group">' +
              '<label for="jb-lastName">Last Name</label>' +
              '<input type="text" id="jb-lastName" name="lastName" placeholder="Your last name" autocomplete="family-name">' +
            '</div>' +
          '</div>' +
          '<div class="jb-form-group">' +
            '<label for="jb-email">Email</label>' +
            '<input type="email" id="jb-email" name="email" placeholder="your@email.com" autocomplete="email">' +
          '</div>' +
          '<div class="jb-form-group">' +
            '<label for="jb-phone">Phone *</label>' +
            '<input type="tel" id="jb-phone" name="phone" placeholder="+1 (000) 000-0000" autocomplete="tel">' +
          '</div>' +
          '<button type="submit" class="jb-form-submit">Send My Request &rarr;</button>' +
          '<p class="jb-form-status" aria-live="polite"></p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(overlay);

    var closeBtn = overlay.querySelector('.jb-modal-close');
    var form = overlay.querySelector('.jb-modal-form');
    var statusEl = overlay.querySelector('.jb-form-status');
    var submitBtn = overlay.querySelector('.jb-form-submit');

    function openModal() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(function () {
        var first = form.querySelector('input');
        if (first) first.focus();
      }, 280);
    }

    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('a[href*="contact"][class*="btn"], a.sticky-call-bar__quote, [data-quote-modal]');
      if (!btn) return;
      e.preventDefault();
      openModal();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        firstName: form.querySelector('[name="firstName"]').value.trim(),
        lastName: form.querySelector('[name="lastName"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
      };
      if (!data.firstName || (!data.email && !data.phone)) {
        statusEl.textContent = 'Please enter your name and either email or phone.';
        statusEl.className = 'jb-form-status error';
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      statusEl.className = 'jb-form-status';
      statusEl.textContent = '';
      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      .then(function (res) {
        if (!res.ok) throw new Error();
        statusEl.textContent = 'Got it — Tony will reach out shortly.';
        statusEl.className = 'jb-form-status success';
        form.reset();
        setTimeout(closeModal, 2500);
      })
      .catch(function () {
        statusEl.textContent = 'Something went wrong. Please call (404) 632–9165.';
        statusEl.className = 'jb-form-status error';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send My Request →';
      });
    });
  }

  /* ── Init all ── */
  document.addEventListener('DOMContentLoaded', function () {
    initSiteData();
    initHamburger();
    initDropdowns();
    initFAQ();
    initHeaderScroll();
    initQuoteModal();
  });
})();

/* ── Trust Ticker Autoscroll (mobile) ── */
(function(){
  if(!window.matchMedia||!window.matchMedia('(max-width:768px)').matches) return;
  var track=document.querySelector('.trust-ticker-track');
  if(!track) return;
  var orig=track.innerHTML;
  track.innerHTML=orig+orig;
  var x=0,halfW=0;
  function tick(){
    if(!halfW) halfW=track.scrollWidth/2;
    x+=0.5;
    if(x>=halfW) x-=halfW;
    track.style.transform='translateX(-'+x+'px)';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

