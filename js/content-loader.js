/* Junk Brawlers — Content Loader
 * Fetches /content.json and applies dynamic values to the page.
 * Also listens for postMessage from the Site Editor for live preview.
 */
(function () {
  'use strict';

  var DAYS_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var DAY_FULL   = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

  function slugFromPath() {
    var p = window.location.pathname.replace(/\/$/, '').split('/').pop();
    return p ? p.replace(/\.html$/, '') : 'home';
  }

  function fmtTime(t) {
    if (!t) return '';
    var parts = t.split(':');
    var h = parseInt(parts[0], 10);
    var m = parts[1];
    var ampm = h < 12 ? 'AM' : 'PM';
    var h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return h12 + (m !== '00' ? ':' + m : '') + ' ' + ampm;
  }

  function applyContent(c) {
    if (!c) return;

    /* ── Phone ── */
    if (c.phone) {
      var raw = c.phone.replace(/\D/g, '');
      document.querySelectorAll('[data-phone-href]').forEach(function (el) {
        el.href = 'tel:' + raw;
        el.textContent = c.phone;
      });
      /* sticky bar has phone text in a child span */
      document.querySelectorAll('.sticky-call-bar__phone').forEach(function (el) {
        el.href = 'tel:' + raw;
        el.childNodes.forEach(function (node) {
          if (node.nodeType === 3 && node.textContent.trim()) {
            node.textContent = '\n      ' + c.phone;
          }
        });
      });
      /* inline phone links not marked with data-phone-href */
      document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
        el.href = 'tel:' + raw;
        /* only update text if it looks like a formatted phone number */
        if (/^\s*\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}\s*$/.test(el.textContent)) {
          el.textContent = c.phone;
        }
      });
    }

    /* ── CTA / brand color ── */
    if (c.ctaColor) {
      document.documentElement.style.setProperty('--clr-primary', c.ctaColor);
    }

    /* ── Review count & rating (already handled by main.js / JBSiteData,
          but content.json is the new source of truth) ── */
    if (c.reviewCount !== undefined) {
      document.querySelectorAll('[data-jb-count]').forEach(function (el) {
        el.textContent = c.reviewCount;
      });
    }
    if (c.rating !== undefined) {
      document.querySelectorAll('[data-jb-rating]').forEach(function (el) {
        el.textContent = c.rating;
      });
      document.querySelectorAll('[data-jb-badge]').forEach(function (el) {
        el.setAttribute('aria-label', c.rating + ' stars, ' + (c.reviewCount || '') + ' Google reviews');
      });
    }

    /* ── Per-page hero ── */
    var slug = slugFromPath();
    var pg = c.pages && c.pages[slug];
    if (pg) {
      /* headline: text node before .hero-em, em: span.hero-em */
      var tagline = document.querySelector('.hero-tagline');
      if (tagline) {
        var emSpan = tagline.querySelector('.hero-em');
        if (emSpan) {
          /* update text node before the span */
          var beforeText = tagline.childNodes[0];
          if (beforeText && beforeText.nodeType === 3) {
            beforeText.textContent = pg.headline ? pg.headline + '' : '';
          }
          /* update em span — preserve inner <br> by inserting \n as <br> */
          if (pg.headlineEm !== undefined) {
            emSpan.innerHTML = pg.headlineEm.replace(/\n/g, '<br>');
          }
        }
      }

      /* subheadline */
      if (pg.subheadline !== undefined) {
        var sub = document.querySelector('.hero-sub');
        if (sub) sub.textContent = pg.subheadline;
      }
    }

    /* ── Business hours ── */
    if (c.hours) {
      /* Render into any element with data-jb-hours */
      document.querySelectorAll('[data-jb-hours]').forEach(function (el) {
        var html = '';
        DAYS_ORDER.forEach(function (day) {
          var d = c.hours[day];
          if (!d) return;
          html += '<div class="hours-row"><span class="hours-day">' + DAY_FULL[day] + '</span>';
          html += '<span class="hours-time">' + (d.x ? 'Closed' : fmtTime(d.o) + ' – ' + fmtTime(d.c)) + '</span></div>';
        });
        el.innerHTML = html;
      });
    }
  }

  /* Load from content.json on the deployed site */
  function loadAndApply() {
    fetch('/content.json?v=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(applyContent)
      .catch(function () { /* silently ignore — hardcoded values remain */ });
  }

  /* Live preview: receive content from the Site Editor iframe parent */
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'JB_CONTENT') {
      applyContent(e.data.content);
    }
  });

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndApply);
  } else {
    loadAndApply();
  }
}());
