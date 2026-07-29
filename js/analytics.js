/* ============================================================
   Junk Brawlers LLC — Analytics (GA4 + Microsoft Clarity)
   ------------------------------------------------------------
   Uses the SAME GA4 property as the old junkbrawlers.com site so
   the rebuild's "after" data flows into one place — letting you
   compare before vs. after with a date range in GA4.

   Tracks the two things the old site never could:
     • call_click   — someone taps a phone (tel:) button
     • generate_lead — fired by JB_trackLead()

   NOTE: nothing calls JB_trackLead() any more. The site's forms were
   removed for A2P 10DLC verification, so the only lead path is the
   LeadConnector chat widget, which reports inside GHL rather than here.
   call_click is the live on-site conversion; generate_lead stays wired
   up so the GA4 Key event survives if a lead surface returns.

   After data starts flowing, mark call_click + generate_lead as
   "Key events" in GA4 (Admin → Events) so they count as conversions.

   Also loads Microsoft Clarity (behavioral analytics — heatmaps +
   session recordings) so we can SEE how visitors actually use each
   page. Both GA4 and Clarity share the localhost skip below, so
   local/dev visits never pollute either dataset.
   ============================================================ */
(function () {
  'use strict';

  /* ── Re-entry guard ──
     This file is pulled in two ways: a tag on every page, and the loader in
     js/main.js. If both paths ever run (or a page picks up a stray second
     copy), the call_click listener below binds twice and every phone tap
     reports two events. Bail on any run after the first. */
  if (window.JB_ANALYTICS_LOADED) { return; }
  window.JB_ANALYTICS_LOADED = true;

  function optOut() {
    window.JB_trackLead = function () {}; /* no-op so any caller doesn't error */
  }

  /* ── Skip local/dev traffic ──
     When the site is opened locally (localhost / 127.0.0.1) we don't
     want those hits polluting GA4 — bail out before anything loads so
     no page_view or call_click is ever sent. */
  var host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '' || host === '::1') {
    optOut();
    return;
  }

  /* ── Owner/tester opt-out (Matt + Tony) ──
     Visiting ?notrack=1 once stores a flag in this browser; from then on the
     device is invisible to BOTH GA4 and Clarity, because we bail before either
     one loads. ?notrack=0 clears it. This exists because IP filtering can't
     cover testing from phones and changing networks, and at ~40 sessions/week
     a handful of owner visits badly skews the data (the 14 "leads" in July were
     form tests, not customers). Per browser/device; clearing site data resets
     it. Real visitors never see or trigger any of this. */
  try {
    var q = location.search;
    if (q.indexOf('notrack=1') !== -1) { localStorage.setItem('jb_notrack', '1'); }
    if (q.indexOf('notrack=0') !== -1) { localStorage.removeItem('jb_notrack'); }
    if (localStorage.getItem('jb_notrack') === '1') {
      optOut();
      return;
    }
  } catch (e) { /* private mode / storage blocked: fall through and track normally */ }

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

  /* ── Microsoft Clarity (heatmaps + session recordings) ──
     Async tag; loads off the critical path on its own. Project ID
     from clarity.microsoft.com → Junk Brawlers project. */
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', 'xjsgp37ie3');

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
     Formerly called by the quote modal + contact form on a successful
     /api/submit response. Both are gone (no forms sitewide, A2P 10DLC),
     so this currently has no callers. Left in place so the GA4 Key event
     keeps its definition and any future lead surface can call it. */
  window.JB_trackLead = function (leadSource) {
    gtag('event', 'generate_lead', {
      page_path: location.pathname,
      lead_source: leadSource || 'Direct'
    });
  };
})();
