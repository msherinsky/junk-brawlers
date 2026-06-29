/* Junk Brawlers — premium service-area coverage map.
   Renders a real, brand-styled map of Tony's North-Georgia territory as a set of
   CLICKABLE COVERAGE ZONES: each of the 14 cities owns a region (Voronoi cell)
   clipped to the overall service-area boundary, so the zones tile edge-to-edge
   like a real sectioned map. Click a zone -> that city's page.

   Reads its city list from the in-page links (a[data-lat][data-lng] inside
   .locations-hub) so those links stay the single source of truth + the crawlable
   / no-JS fallback. Lazy-inits on scroll-into-view. Reused across every page.

   Deps (loaded before this file): Leaflet 1.9.x, d3-delaunay 6.x (global `d3`).
*/
(function () {
  var BRAND = {
    zone: '#7B35D4', zoneDark: '#5E22AA',
    home: '#FF7A00', homeDark: '#E06A00',
    border: '#ffffff'
  };

  function readCities() {
    var links = document.querySelectorAll('.locations-hub a[data-lat][data-lng]');
    var out = [];
    links.forEach(function (a) {
      var lat = parseFloat(a.getAttribute('data-lat'));
      var lng = parseFloat(a.getAttribute('data-lng'));
      if (isNaN(lat) || isNaN(lng)) return;
      out.push({
        name: a.getAttribute('data-name') || a.textContent.trim(),
        lat: lat, lng: lng, url: a.getAttribute('href'), link: a
      });
    });
    return out;
  }

  /* ---- geometry helpers (work in [x=lng, y=lat] space) ---- */

  function convexHull(pts) {
    var p = pts.map(function (c) { return [c.lng, c.lat]; })
      .sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    if (p.length < 3) return p;
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = [], i;
    for (i = 0; i < p.length; i++) {
      while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p[i]) <= 0) lo.pop();
      lo.push(p[i]);
    }
    for (i = p.length - 1; i >= 0; i--) {
      while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p[i]) <= 0) up.pop();
      up.push(p[i]);
    }
    lo.pop(); up.pop();
    var hull = lo.concat(up);
    // guarantee CCW (positive signed area)
    var area = 0;
    for (i = 0; i < hull.length; i++) {
      var a = hull[i], b = hull[(i + 1) % hull.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    if (area < 0) hull.reverse();
    return hull;
  }

  /* Push each vertex outward from the centroid by `pad` degrees, then lightly
     round the ring (midpoint subdivision) for an organic, non-"drawn-on" edge. */
  function bufferAndSmooth(hull, pad) {
    var cx = 0, cy = 0;
    hull.forEach(function (v) { cx += v[0]; cy += v[1]; });
    cx /= hull.length; cy /= hull.length;
    var out = hull.map(function (v) {
      var dx = v[0] - cx, dy = v[1] - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
      return [v[0] + (dx / d) * pad, v[1] + (dy / d) * pad];
    });
    // one round of corner-cutting (Chaikin) for softness
    var soft = [];
    for (var i = 0; i < out.length; i++) {
      var p = out[i], q = out[(i + 1) % out.length];
      soft.push([p[0] * 0.75 + q[0] * 0.25, p[1] * 0.75 + q[1] * 0.25]);
      soft.push([p[0] * 0.25 + q[0] * 0.75, p[1] * 0.25 + q[1] * 0.75]);
    }
    return soft;
  }

  /* Sutherland–Hodgman: clip subject polygon to a CONVEX clip polygon (CCW). */
  function clipToConvex(subject, clip) {
    function side(a, b, p) { return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); }
    function isect(a, b, p, q) {
      var A1 = b[1] - a[1], B1 = a[0] - b[0], C1 = A1 * a[0] + B1 * a[1];
      var A2 = q[1] - p[1], B2 = p[0] - q[0], C2 = A2 * p[0] + B2 * p[1];
      var det = A1 * B2 - A2 * B1;
      if (Math.abs(det) < 1e-12) return q.slice();
      return [(B2 * C1 - B1 * C2) / det, (A1 * C2 - A2 * C1) / det];
    }
    var out = subject.slice();
    for (var i = 0; i < clip.length && out.length; i++) {
      var A = clip[i], B = clip[(i + 1) % clip.length], inp = out;
      out = [];
      for (var j = 0; j < inp.length; j++) {
        var P = inp[j], Q = inp[(j + 1) % inp.length];
        var inP = side(A, B, P) >= -1e-12, inQ = side(A, B, Q) >= -1e-12;
        if (inP) { out.push(P); if (!inQ) out.push(isect(A, B, P, Q)); }
        else if (inQ) { out.push(isect(A, B, P, Q)); }
      }
    }
    return out;
  }

  function buildZones(cities) {
    var hull = convexHull(cities);
    var boundary = bufferAndSmooth(hull, 0.05);
    // Voronoi over a bbox padded around the boundary.
    var xs = boundary.map(function (p) { return p[0]; });
    var ys = boundary.map(function (p) { return p[1]; });
    var bbox = [Math.min.apply(null, xs) - 0.1, Math.min.apply(null, ys) - 0.1,
                Math.max.apply(null, xs) + 0.1, Math.max.apply(null, ys) + 0.1];
    var delaunay = d3.Delaunay.from(cities, function (c) { return c.lng; }, function (c) { return c.lat; });
    var vor = delaunay.voronoi(bbox);
    return cities.map(function (c, i) {
      var cell = vor.cellPolygon(i);
      if (!cell) return null;
      if (cell.length > 1 && cell[0][0] === cell[cell.length - 1][0] && cell[0][1] === cell[cell.length - 1][1]) cell = cell.slice(0, -1);
      var clipped = clipToConvex(cell, boundary);
      if (clipped.length < 3) return null;
      // -> Leaflet latlngs [lat, lng]
      c.ring = clipped.map(function (p) { return [p[1], p[0]]; });
      return c;
    }).filter(Boolean);
  }

  function labelIcon(L, c, isHome) {
    var html =
      '<span class="jb-dot' + (isHome ? ' jb-dot--home' : '') + '"></span>' +
      '<span class="jb-city' + (isHome ? ' jb-city--home' : '') + '">' + c.name +
      (isHome ? '<em>Home base</em>' : '') + '</span>';
    return L.divIcon({ className: 'jb-label', html: html, iconSize: [0, 0], iconAnchor: [0, 0] });
  }

  function build(el) {
    var L = window.L;
    if (!L || !window.d3 || !d3.Delaunay) return;
    var cities = readCities();
    if (cities.length < 3) return;

    var zones = buildZones(cities);

    var map = L.map(el, {
      zoomControl: false, attributionControl: true,
      dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
      boxZoom: false, keyboard: false, touchZoom: false, tap: false
    });

    // Premium, label-free basemap — our own city labels are the only type on the map.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    var bounds = L.latLngBounds([]);

    zones.forEach(function (c) {
      var isHome = c.name.toLowerCase() === 'dawsonville';
      var base = {
        className: 'jb-zone' + (isHome ? ' jb-zone--home' : ''),
        color: BRAND.border, weight: 1.5, opacity: 0.95,
        fillColor: isHome ? BRAND.home : BRAND.zone,
        fillOpacity: isHome ? 0.34 : 0.22
      };
      var poly = L.polygon(c.ring, base).addTo(map);
      bounds.extend(poly.getBounds());

      poly.on('mouseover', function () {
        poly.setStyle({ fillOpacity: isHome ? 0.55 : 0.42, weight: 2.5 });
        poly.bringToFront();
        if (c.link) c.link.classList.add('area-link--hot');
      });
      poly.on('mouseout', function () {
        poly.setStyle({ fillOpacity: isHome ? 0.34 : 0.22, weight: 1.5 });
        if (c.link) c.link.classList.remove('area-link--hot');
      });
      poly.on('click', function () { if (c.url) window.location.href = c.url; });
      poly.bindTooltip(c.name + ' GA' + (isHome ? ' · Home base' : '') + ' — tap to open',
        { sticky: true, className: 'jb-tip', direction: 'top', opacity: 1 });

      // City dot + name label, pinned at the real city point (non-interactive).
      var lm = L.marker([c.lat, c.lng], { icon: labelIcon(L, c, isHome), interactive: false, keyboard: false }).addTo(map);
      c._labelMarker = lm; c._isHome = isHome;

      c._poly = poly;

      // Hovering the slim text link lights up its zone.
      if (c.link) {
        c.link.addEventListener('mouseenter', function () { poly.fire('mouseover'); });
        c.link.addEventListener('mouseleave', function () { poly.fire('mouseout'); });
      }
    });

    // Nudge overlapping name labels apart (greedy, home + northern cities win).
    function declutter() {
      var items = zones.slice().sort(function (a, b) {
        return (b._isHome - a._isHome) || (b.lat - a.lat);
      });
      var placed = [];
      items.forEach(function (c) {
        var span = c._labelMarker && c._labelMarker.getElement() && c._labelMarker.getElement().querySelector('.jb-city');
        if (!span) return;
        span.style.marginTop = '';
        var shift = 0, tries = 0;
        function rect() { return span.getBoundingClientRect(); }
        function hits() {
          var r = rect();
          return placed.some(function (p) {
            return Math.min(r.right, p.right) - Math.max(r.left, p.left) > 2 &&
                   Math.min(r.bottom, p.bottom) - Math.max(r.top, p.top) > 2;
          });
        }
        while (hits() && tries < 8) { shift += 15; span.style.marginTop = shift + 'px'; tries++; }
        placed.push(rect());
      });
    }

    function frame() { map.invalidateSize(); map.fitBounds(bounds, { padding: [18, 18] }); requestAnimationFrame(declutter); }
    frame();
    setTimeout(frame, 250);
    window.addEventListener('resize', function () { clearTimeout(map.__rt); map.__rt = setTimeout(frame, 200); });
  }

  function init() {
    var el = document.getElementById('service-map');
    if (!el || el.dataset.jbInit) return;
    el.dataset.jbInit = '1';
    var start = function () { build(el); };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e, obs) {
        if (e[0].isIntersecting) { obs.disconnect(); start(); }
      }, { rootMargin: '300px' });
      io.observe(el);
    } else { start(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
