/* Junk Brawlers — site data.

   reviewCount is deliberately the STRING '60+', not an exact number. The live GBP
   count moved five times in four weeks (66 -> 67 -> 72 -> 69 -> 61) under Google's
   2026 review purge, and every move used to mean a ~400-replacement sweep across 59
   pages. '60+' is true at any count above 60 and needs no maintenance.

   Exact figures live in exactly one place: JSON-LD "reviewCount" in the page head,
   which must stay a parseable integer and must match the real GBP figure. Currently
   61 (verified logged-out 2026-08-13). Re-check Google Maps before changing it.

   initSiteData() in main.js writes this into every [data-jb-count], [data-jb-rating]
   and [data-jb-badge] at runtime, so the values in the HTML are no-JS fallbacks only.
   Bump the ?v= cache-bust on this file site-wide when you edit it (currently jb37). */
var JBSiteData = {
  reviewCount: '60+',
  rating: '5.0'
};
