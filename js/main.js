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

  /* ── Init all ── */
  document.addEventListener('DOMContentLoaded', function () {
    initModal();
    initHamburger();
    initDropdowns();
    initFAQ();
    initHeaderScroll();
    initForms();
  });
})();

