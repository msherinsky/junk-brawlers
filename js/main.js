/* ============================================================
   Junk Brawlers LLC — Main JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Modal ── */
  function initModal() {
    var overlay = document.getElementById('quoteModal');
    if (!overlay) return;
    var closeBtn = overlay.querySelector('.modal-close');

    function closeModal() {
      overlay.classList.remove('open');
      sessionStorage.setItem('modalDismissed', '1');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    document.querySelectorAll('[data-modal="quote"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        overlay.classList.add('open');
      });
    });
  }

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
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ── Form submission (basic) ── */
  function initForms() {
    document.querySelectorAll('.quote-form, .contact-form-el').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('[type="submit"]');
        if (btn) {
          btn.textContent = 'Sent! Tony will be in touch.';
          btn.disabled = true;
          btn.style.background = '#2a7a2a';
        }
      });
    });
  }

  /* ── Truck scroll animation ── */
  function initTruckAnimation() {
    var truck = document.querySelector('.truck-svg');
    if (!truck) return;
    if (!('IntersectionObserver' in window)) {
      truck.classList.add('truck-arrived');
      return;
    }
    var trigger = document.querySelector('.about-section') || truck;
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          truck.classList.add('truck-arrived');
          obs.disconnect();
        }
      });
    }, { threshold: 0.15 }).observe(trigger);
  }

  /* ── Init all ── */
  document.addEventListener('DOMContentLoaded', function () {
    initModal();
    initHamburger();
    initDropdowns();
    initFAQ();
    initHeaderScroll();
    initForms();
    initTruckAnimation();
  });
})();

/* ── Chat Widget — loaded on every page ── */
if (!window.__wgInit) {
  window.WG_CONFIG = {
    client:       'junk-brawlers',
    name:         'Tony',
    avatar:       '',
    phone:        '(404) 632-9165',
    greeting:     'Hey! Need to get rid of some junk? I can help you get a free quote fast.',
    subtitle:     'Get a free quote in minutes',
    colorPrimary: '#8000FF',
    colorDark:    '#6600CC',
    colorHeader:  '#1a0030',
    autoOpen:     '7000',
    quickReplies: 'Get a free quote|Schedule a pickup|What do you haul?'
  };
  var wgScript = document.createElement('script');
  wgScript.src = '/js/chat-widget.js';
  document.body.appendChild(wgScript);
}
