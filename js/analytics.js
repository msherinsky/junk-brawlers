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

  var GA4_ID = 'G-KXD6ZXNJTS';

  /* ── GA4 base (gtag) ── */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', GA4_ID);

  var g = document.createElement('script');
  g.async = true;
  g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
  document.head.appendChild(g);

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
