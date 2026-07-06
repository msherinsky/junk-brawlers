/* ============================================================
   Junk Brawlers LLC — Analytics (GA4)
   ------------------------------------------------------------
   Uses the SAME GA4 property as the old junkbrawlers.com site so
   the rebuild's "after" data flows into one place — letting you
   compare before vs. after with a date range in GA4.

   Tracks the two things the old site never could:
     • call_click   — someone taps a phone (tel:) button
     • generate_lead — someone successfully submits the quote form

   After data starts flowing, mark call_click + generate_lead as
   "Key events" in GA4 (Admin → Events) so they count as conversions.
   ============================================================ */
(function () {
  'use strict';

  /* ── Skip local/dev traffic ──
     When the site is opened locally (localhost / 127.0.0.1) we don't
     want those hits polluting GA4 — bail out before anything loads so
     no page_view, call_click, or generate_lead is ever sent. */
  var host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '' || host === '::1') {
    window.JB_trackLead = function () {}; /* no-op so form code doesn't error */
    return;
  }

  var GA4_ID = 'G-KXD6ZXNJTS';

  /* ── GA4 base (gtag) ──
     The gtag() stub + dataLayer exist immediately so any early call_click /
     generate_lead events (and the initial config/page_view) queue up and are
     never lost. But we DEFER loading the ~90KB gtag.js itself until after the
     page has painted and is interactive — parsing it on the main thread during
     load was delaying the hero paint (the LCP "element render delay"). GA is not
     needed in the critical render path; the queued page_view fires as soon as
     gtag.js boots a beat later. */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', GA4_ID);

  var gaBooted = false;
  function bootGA() {
    if (gaBooted) return; gaBooted = true;
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(g);
  }
  /* First real interaction boots it right away (engaged users get instant event
     delivery); everyone else gets it shortly after load. Whichever comes first. */
  ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, bootGA, { once: true, passive: true });
  });
  if (document.readyState === 'complete') { setTimeout(bootGA, 2500); }
  else { window.addEventListener('load', function () { setTimeout(bootGA, 2500); }); }

  /* ── Call-click tracking ──
     One delegated listener catches every tel: link on the page —
     header button, hero CTAs, footer, and the sticky call bar. */
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (!link) return;
    var leadSource = window.JB_getLeadSource && window.JB_getLeadSource();
    gtag('event', 'call_click', {
      phone_number: link.getAttribute('href').replace('tel:', ''),
      link_location: link.className || 'unknown',
      page_path: location.pathname,
      lead_source: leadSource || 'Direct'
    });
  });

  /* ── Lead tracking ──
     Called by the quote forms (modal + contact page) on a
     successful /api/submit response. */
  window.JB_trackLead = function (leadSource) {
    gtag('event', 'generate_lead', {
      page_path: location.pathname,
      lead_source: leadSource || 'Direct'
    });
  };
})();
