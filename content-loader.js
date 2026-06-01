(function () {
  fetch('/content.json?v=' + Date.now())
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (c) {
      if (!c) return;
      var page = (c.pages && c.pages.home) || {};

      // ── Hero ──────────────────────────────────────────────────────────────────
      fill('wg-hero-line1', page.headline);
      fill('wg-hero-em',    page.headlineEm);
      fill('wg-hero-sub',   page.subheadline);
      fill('wg-hero-cta',   page.ctaText);

      // ── Named photo slots ─────────────────────────────────────────────────────
      var photoMap = {
        heroPhoto:          'wg-hero-img',
        ownerPhoto1:        'wg-ownerPhoto1',
        ownerPhoto2:        'wg-ownerPhoto2',
        ba_shed_before:     'wg-ba-shed-before',
        ba_shed_after:      'wg-ba-shed-after',
        ba_basement_before: 'wg-ba-basement-before',
        ba_basement_after:  'wg-ba-basement-after',
        ba_yard_before:     'wg-ba-yard-before',
        ba_yard_after:      'wg-ba-yard-after',
        ba_loft_before:     'wg-ba-loft-before',
        ba_loft_after:      'wg-ba-loft-after',
      };
      Object.keys(photoMap).forEach(function (key) {
        if (c[key]) {
          var el = document.getElementById(photoMap[key]);
          if (el) el.src = c[key];
        }
      });

      // ── Before/after section visibility ──────────────────────────────────────
      var baSection = document.getElementById('wg-ba-section');
      if (baSection) {
        var baPairs = ['shed', 'basement', 'yard', 'loft'];
        var anyPair = false;
        baPairs.forEach(function (id) {
          var hasBefore = !!c['ba_' + id + '_before'];
          var hasAfter  = !!c['ba_' + id + '_after'];
          if (hasBefore || hasAfter) {
            var pair = document.getElementById('wg-ba-pair-' + id);
            if (pair) pair.style.display = 'block';
            anyPair = true;
          }
        });
        if (anyPair) baSection.style.display = 'block';
      }

      // ── Phone ─────────────────────────────────────────────────────────────────
      if (c.phone) {
        var digits = c.phone.replace(/\D/g, '');
        document.querySelectorAll('[data-phone-href]').forEach(function (el) {
          el.href = 'tel:' + digits;
          var txt = el.textContent.trim();
          if (/\d{3}/.test(txt)) el.textContent = c.phone;
        });
      }

      // ── Services ──────────────────────────────────────────────────────────────
      if (c.services && c.services.length) {
        c.services.forEach(function (svc, i) {
          var body = document.querySelector('[data-svc="' + i + '"]');
          if (!body) return;
          var h3 = body.querySelector('h3');
          var p  = body.querySelector('p');
          if (h3 && svc.title) h3.textContent = svc.title;
          if (p  && svc.desc)  p.textContent  = svc.desc;
        });
      }

      // ── Service areas ─────────────────────────────────────────────────────────
      var areasEl = document.getElementById('wg-areas');
      if (areasEl && c.serviceAreas && c.serviceAreas.length) {
        areasEl.style.display = 'flex';
        areasEl.innerHTML = c.serviceAreas.map(function (area) {
          return '<span style="display:inline-block;padding:6px 14px;background:rgba(128,0,255,0.1);border-radius:4px;font-size:14px;font-weight:600;color:#8000FF;">' + esc(area) + '</span>';
        }).join('');
      }

      // ── Testimonials ──────────────────────────────────────────────────────────
      var reviews = document.getElementById('wg-reviews');
      if (reviews && c.testimonials && c.testimonials.length) {
        reviews.innerHTML = c.testimonials.map(function (t) {
          var stars = '★'.repeat(t.rating || 5);
          return '<div class="rw-card">' +
            '<span class="rw-card-stars">' + stars + '</span>' +
            '<p class="rw-card-text">&ldquo;' + esc(t.quote) + '&rdquo;</p>' +
            '<div class="rw-card-author"><strong>' + esc(t.name) + '</strong></div>' +
          '</div>';
        }).join('');
      }

      // ── Gallery ───────────────────────────────────────────────────────────────
      var galSection = document.getElementById('wg-gallery-section');
      var galGrid    = document.getElementById('wg-gallery');
      if (galGrid && c.gallery && c.gallery.length) {
        if (galSection) galSection.style.display = 'block';
        galGrid.innerHTML = c.gallery.map(function (url) {
          return '<div style="aspect-ratio:1;overflow:hidden;border-radius:6px;background:#1a0030;">' +
            '<img src="' + esc(url) + '" alt="Job photo" loading="lazy" style="width:100%;height:100%;object-fit:cover;">' +
          '</div>';
        }).join('');
      }

      // ── CTA color ─────────────────────────────────────────────────────────────
      if (c.ctaColor) {
        document.documentElement.style.setProperty('--color-primary', c.ctaColor);
        document.documentElement.style.setProperty('--accent', c.ctaColor);
        document.querySelectorAll('[data-cta-bg]').forEach(function (el) {
          el.style.background = c.ctaColor;
        });
      }

      // ── Business hours (footer summary) ───────────────────────────────────────
      var hoursEl = document.getElementById('wg-hours');
      if (hoursEl && c.hours) {
        var DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        function fmt12h(v) {
          if (!v) return '';
          var h = parseInt(v.split(':')[0]);
          return (h === 0 ? 12 : h > 12 ? h - 12 : h) + (h < 12 ? 'am' : 'pm');
        }
        var parts = [], i = 0;
        while (i < DAYS.length) {
          var d = DAYS[i], row = c.hours[d];
          if (!row) { i++; continue; }
          var j = i + 1;
          while (j < DAYS.length && c.hours[DAYS[j]] &&
                 c.hours[DAYS[j]].x === row.x &&
                 c.hours[DAYS[j]].o === row.o &&
                 c.hours[DAYS[j]].c === row.c) { j++; }
          var label = j > i + 1 ? DAYS[i] + '–' + DAYS[j - 1] : DAYS[i];
          parts.push(label + ' · ' + (row.x ? 'Closed' : fmt12h(row.o) + '–' + fmt12h(row.c)));
          i = j;
        }
        hoursEl.textContent = parts.join(' | ');
      }

      // ── Footer social links ───────────────────────────────────────────────────
      if (c.facebook)  document.querySelectorAll('[data-social="facebook"]').forEach(function (el) { el.href = c.facebook; });
      if (c.googleBiz) document.querySelectorAll('[data-social="google"]').forEach(function (el) { el.href = c.googleBiz; });
      if (c.instagram) document.querySelectorAll('[data-social="instagram"]').forEach(function (el) { el.href = c.instagram; });
      if (c.copyright) document.querySelectorAll('[data-copyright]').forEach(function (el) { el.textContent = c.copyright; });
    })
    .catch(function () {});

  function fill(id, val) {
    if (!val) return;
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
}());
