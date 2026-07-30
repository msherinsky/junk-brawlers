/* ============================================================
   Junk Brawlers LLC — Main JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Analytics loader (GA4) ──
     Pulls in js/analytics.js once, on every page that loads main.js. */
  if (!document.getElementById('jb-analytics-js')) {
    var aScript = document.createElement('script');
    aScript.id = 'jb-analytics-js';
    aScript.src = 'js/analytics.js';
    document.head.appendChild(aScript);
  }

  /* ── Lead Source Attribution ──
     Classifies where each visitor came from — AI assistants (ChatGPT, Claude,
     Perplexity…), Google (organic vs Ads), Bing, Facebook, Yelp, Nextdoor,
     other referrers, or Direct — so the source rides along into the lead and
     shows up tagged in GHL. First-touch per session: captured on the landing
     page, persisted across internal navigation via sessionStorage, then
     attached to the quote form on submit. Paid clicks (gclid/utm) win over the
     referrer. Also pushes a dataLayer event for AI sources so it auto-works if
     GA4/GTM is ever added. */
  function initLeadSource() {
    var AI_SOURCES = {
      'chatgpt.com': 'ChatGPT',
      'chat.openai.com': 'ChatGPT',
      'perplexity.ai': 'Perplexity',
      'gemini.google.com': 'Gemini',
      'claude.ai': 'Claude',
      'copilot.microsoft.com': 'Copilot',
      'you.com': 'You.com',
      'poe.com': 'Poe',
      'phind.com': 'Phind',
      'grok.com': 'Grok',
      'meta.ai': 'Meta AI'
    };
    var AI_LABELS = ['ChatGPT','Perplexity','Gemini','Claude','Copilot','You.com','Poe','Phind','Grok','Meta AI'];
    var KEY = 'jb_lead_source';

    function read() {
      try { return sessionStorage.getItem(KEY) || ''; } catch (e) { return ''; }
    }
    function write(v) {
      try { sessionStorage.setItem(KEY, v); } catch (e) {}
    }

    // Expose a helper the lead forms use to attach the source.
    window.JB_getLeadSource = read;

    // First-touch only: don't overwrite a source already captured this session.
    if (read()) return;

    var src = classify();
    if (!src) return; // internal navigation — ignore
    write(src);

    if (AI_LABELS.indexOf(src) !== -1) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'ai_referral',
        ai_source: src,
        ai_referrer: document.referrer,
        ai_landing_page: window.location.pathname
      });
    }

    function classify() {
      // 1) Paid / tagged clicks are the most reliable signal.
      var qs;
      try { qs = new URLSearchParams(window.location.search); } catch (e) { qs = null; }
      if (qs) {
        if (qs.get('gclid') || qs.get('gbraid') || qs.get('wbraid')) return 'Google Ads';
        if (qs.get('msclkid')) return 'Bing Ads';
        var utm = qs.get('utm_source');
        if (utm) return utm.charAt(0).toUpperCase() + utm.slice(1);
        // fbclid rides on ALL Facebook/Instagram clicks (organic + paid), so it
        // only proves "Facebook" — useful when the referrer is stripped (in-app
        // browser). Paid-vs-organic split comes from a utm_source on the ad.
        if (qs.get('fbclid')) return 'Facebook';
      }
      // 2) Otherwise fall back to the referring host.
      var ref = document.referrer || '';
      if (!ref) return 'Direct';
      var host;
      try { host = new URL(ref).hostname.toLowerCase(); } catch (e) { host = ref.toLowerCase(); }
      if (host.indexOf(window.location.hostname) !== -1) return ''; // internal nav
      for (var h in AI_SOURCES) { if (host.indexOf(h) !== -1) return AI_SOURCES[h]; }
      if (host.indexOf('google.') !== -1) return 'Google';
      if (host.indexOf('bing.') !== -1) return 'Bing';
      if (host.indexOf('duckduckgo.') !== -1) return 'DuckDuckGo';
      if (host.indexOf('yahoo.') !== -1) return 'Yahoo';
      if (host.indexOf('facebook.') !== -1 || host.indexOf('fb.') !== -1 || host.indexOf('instagram.') !== -1) return 'Facebook';
      if (host.indexOf('yelp.') !== -1) return 'Yelp';
      if (host.indexOf('nextdoor.') !== -1) return 'Nextdoor';
      return 'Referral';
    }
  }
  initLeadSource();

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

  /* ── Phone Input Formatter ── */
  function initPhoneInput(el) {
    if (!el) return;
    el.setAttribute('maxlength', '14');
    el.addEventListener('input', function () {
      var digits = this.value.replace(/\D/g, '').slice(0, 10);
      if (!digits) { this.value = ''; return; }
      if (digits.length <= 3) {
        this.value = '(' + digits;
      } else if (digits.length <= 6) {
        this.value = '(' + digits.slice(0,3) + ') ' + digits.slice(3);
      } else {
        this.value = '(' + digits.slice(0,3) + ') ' + digits.slice(3,6) + '-' + digits.slice(6);
      }
      this.classList.remove('jb-input-error');
    });
    el.addEventListener('blur', function () {
      var digits = this.value.replace(/\D/g, '');
      if (this.value && digits.length < 10) {
        this.classList.add('jb-input-error');
      }
    });
    el.addEventListener('focus', function () {
      this.classList.remove('jb-input-error');
    });
  }

  /* ── Service Area Zip Check ── */
  var JB_SERVICE_ZIPS = ['30004','30005','30009','30022','30024','30028','30039','30040','30041','30043','30044','30045','30046','30071','30075','30076','30078','30092','30093','30096','30097','30107','30114','30115','30142','30143','30151','30175','30183','30188','30189','30327','30328','30342','30350','30501','30504','30506','30507','30513','30518','30519','30522','30527','30528','30533','30534','30539','30540','30542','30545','30555','30560','30566'];

  function initZipCheck(zipInput) {
    if (!zipInput) return;
    var hint = document.createElement('span');
    hint.className = 'zip-check-hint';
    zipInput.parentNode.appendChild(hint);
    zipInput.addEventListener('input', function () {
      var val = this.value.replace(/\D/g, '').slice(0, 5);
      this.value = val;
      if (val.length === 5) {
        if (JB_SERVICE_ZIPS.indexOf(val) !== -1) {
          hint.textContent = '✓ We serve your area.';
          hint.className = 'zip-check-hint zip-check-hint--ok';
        } else {
          hint.textContent = 'We may not serve this zip — Tony will confirm on the call.';
          hint.className = 'zip-check-hint zip-check-hint--warn';
        }
      } else {
        hint.textContent = '';
        hint.className = 'zip-check-hint';
      }
    });
  }

  /* ── Quote Modal ──
     A2P 10DLC: this form is the site's registered SMS opt-in of record. The two
     consent checkboxes are independent, both start unchecked, and neither gates
     submission. The consent copy here must stay in sync with privacy-policy.html
     §3 and terms-of-service.html §5, because carrier reviewers cross-check them
     against the live page. */
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
        '<h2 class="jb-modal-heading">Get a Quote.</h2>' +
        '<p class="jb-modal-sub">5-star rated North Georgia junk removal.</p>' +
        '<form class="jb-modal-form" novalidate>' +
          '<div class="jb-form-row">' +
            '<div class="jb-form-group">' +
              '<label for="jb-fullName">Full Name *</label>' +
              '<input type="text" id="jb-fullName" name="fullName" placeholder="Your full name" autocomplete="name">' +
            '</div>' +
            '<div class="jb-form-group">' +
              '<label for="jb-phone">Phone *</label>' +
              '<input type="tel" id="jb-phone" name="phone" placeholder="(000) 000-0000" autocomplete="tel">' +
            '</div>' +
          '</div>' +
          '<div class="jb-form-group">' +
            '<label for="jb-message">What needs to go? <span class="jb-optional">(optional)</span></label>' +
            '<input type="text" id="jb-message" name="message" placeholder="e.g., a couch + fridge, or a garage cleanout" autocomplete="off">' +
          '</div>' +
          '<div class="jb-consent">' +
            '<label class="jb-consent-item">' +
              '<input type="checkbox" name="consentTransactional">' +
              '<span>By checking this box, I consent to receive non-marketing text messages from <strong>Junk Brawlers LLC</strong> about my quote request, appointment scheduling, and post-service follow-up including feedback requests. Message frequency varies, message &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.</span>' +
            '</label>' +
            '<label class="jb-consent-item">' +
              '<input type="checkbox" name="consentMarketing">' +
              '<span>By checking this box, I consent to receive marketing and promotional messages including special offers, discounts, and service updates, from <strong>Junk Brawlers LLC</strong> at the phone number provided. Frequency may vary. Message &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.</span>' +
            '</label>' +
            '<p class="jb-consent-note">Consent is not a condition of purchase. See our <a href="privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a> and <a href="terms-of-service.html" target="_blank" rel="noopener">Terms of Service</a>.</p>' +
          '</div>' +
          '<button type="submit" class="jb-form-submit">Send My Request &rarr;</button>' +
          '<p class="jb-form-status" aria-live="polite"></p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(overlay);
    initPhoneInput(overlay.querySelector('[name="phone"]'));

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
      form.reset();
      statusEl.textContent = '';
      statusEl.className = 'jb-form-status';
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
      var fullNameEl = form.querySelector('[name="fullName"]');
      var phoneEl    = form.querySelector('[name="phone"]');
      // Modal is the slim path: one "Full Name" field split into first/last for GHL,
      // plus phone (+ optional detail). Other fields live on the full contact-page form.
      var nameParts = fullNameEl.value.trim().split(/\s+/).filter(Boolean);
      var data = {
        firstName: nameParts.shift() || '',
        lastName:  nameParts.join(' '),
        email:     '',
        phone:     phoneEl.value.trim(),
        zipCode:   '',
        message:   form.querySelector('[name="message"]') ? form.querySelector('[name="message"]').value.trim() : '',
        contactPreference: '',
        consentTransactional: !!(form.querySelector('[name="consentTransactional"]') || {}).checked,
        consentMarketing: !!(form.querySelector('[name="consentMarketing"]') || {}).checked,
      };
      var leadSource = window.JB_getLeadSource && window.JB_getLeadSource();
      if (leadSource) data.leadSource = leadSource;
      var phoneDigits = data.phone.replace(/\D/g, '');
      var valid = true;
      fullNameEl.classList.remove('jb-input-error');
      phoneEl.classList.remove('jb-input-error');
      if (!data.firstName) { fullNameEl.classList.add('jb-input-error'); valid = false; }
      if (phoneDigits.length < 10) { phoneEl.classList.add('jb-input-error'); valid = false; }
      if (!valid) {
        statusEl.textContent = 'Please fill in the highlighted fields.';
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
        if (window.JB_trackLead) window.JB_trackLead(data.leadSource);
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
  /* ── Stat count-up (the Brawler Standard's record band) ──
     Runs AFTER initSiteData(), never before: that writes JBSiteData.reviewCount into
     [data-jb-count], so the target has to be read off the rendered element or the two
     fight and the count-up animates to a stale number.

     The "0 No-Shows" stat is deliberately NOT animated, and that is the point rather
     than an oversight. All three read 0 at rest; two of them climb; the no-show count
     never has to. A number counting from 0 to 0 is not an animation, and leaving it
     out lets it hold the frame while the others move.

     Reduced motion: snap straight to the final value. Unlike the ticker (which slows
     rather than freezes, because a frozen half-clipped strip reads as broken), a
     count-up with no motion is simply the number, which is all it was ever conveying.
     Fires once, on first intersection. */
  function initStatCountUp() {
    var els = document.querySelectorAll('[data-count-up]');
    if (!els.length) return;

    // The target is whatever is RENDERED right now, captured after initSiteData has
    // written JBSiteData in. Hardcoding it in the markup would go stale the moment
    // the review count changes, and site-data.js is the documented source of truth.
    Array.prototype.forEach.call(els, function (el) {
      el.setAttribute('data-count-to', el.textContent.trim());
    });

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var settle = function (el) { el.textContent = el.getAttribute('data-count-to'); };

    if (reduced || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, settle);
      return;
    }

    // easeOutQuint — the same curve .pillar-rule uses: quick out, long settle.
    var ease = function (t) { return 1 - Math.pow(1 - t, 5); };
    var DURATION = 1100;

    function run(el) {
      var raw = el.getAttribute('data-count-to');
      var target = parseFloat(raw);
      if (isNaN(target)) { settle(el); return; }
      var decimals = (raw.split('.')[1] || '').length;
      var t0 = null;
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / DURATION, 1);
        el.textContent = (target * ease(p)).toFixed(decimals);
        if (p < 1) requestAnimationFrame(frame);
        else settle(el);   // land on the exact string, never a float artifact
      }
      el.textContent = (0).toFixed(decimals);
      requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        run(e.target);
      });
    }, { threshold: 0.6 });

    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSiteData();
    initHamburger();
    initDropdowns();
    initFAQ();
    initHeaderScroll();
    initQuoteModal();
    initZipCheck(document.getElementById('zipCode'));
    initStatCountUp();   // must follow initSiteData
  });
})();

/* ── Trust Ticker: seamless marquee (all viewports) ──
   The shipped markup carries a base loop unit (a set of items + an aria-hidden
   duplicate). We clone that unit until the strip always overfills the visible
   window, then let the CSS animation scroll by exactly ONE unit width so
   identical content realigns at the wrap — an invisible seam at any screen
   width. JS only sizes the strip and sets the loop distance/duration via CSS
   custom properties; the compositor does the animating. Reduced motion is
   handled in CSS. */
(function(){
  var track=document.querySelector('.trust-ticker-track');
  if(!track) return;
  var wrap=track.parentElement;                  // .trust-ticker-wrap (clipped window)
  var base=track.innerHTML;                       // base loop unit, as shipped
  var SPEED_DESKTOP=47, SPEED_MOBILE=30, SPEED_REDUCED=13;   // px/sec — tune here
  var lastUnitW=0, lastWrapW=0;
  // Measure one base loop-unit width on an off-screen probe, so we never wipe and
  // re-lay the LIVE (animating) track just to take a measurement — doing that mid-
  // scroll is what makes the strip visibly jump.
  function measureUnit(){
    var probe=track.cloneNode(false);
    probe.style.cssText='position:absolute;left:-9999px;top:0;visibility:hidden;width:max-content;animation:none';
    probe.innerHTML=base;
    wrap.appendChild(probe);
    var w=probe.scrollWidth;
    wrap.removeChild(probe);
    return w;
  }
  function build(){
    var unitW=measureUnit();
    if(!unitW) return;
    var wrapW=wrap.clientWidth;
    // Skip redundant rebuilds — restarting the animation snaps the strip back to
    // its start (a visible skip). Only rebuild when the unit width (fonts loaded)
    // or the window WIDTH actually changed. This ignores the constant resize events
    // a mobile browser fires as its address bar shows/hides on scroll — those change
    // height only, so width is unchanged and the ticker keeps gliding uninterrupted.
    if(unitW===lastUnitW && wrapW===lastWrapW) return;
    lastUnitW=unitW; lastWrapW=wrapW;
    // Clone until the strip is at least two windows + one unit wide, so the
    // visible window is always full and no empty stretch can trail a unit.
    var need=wrapW*2+unitW, html=base, w=unitW;
    while(w<unitW*20 && w<need){ html+=base; w+=unitW; }   // 20-unit safety cap
    track.innerHTML=html;
    var mm=window.matchMedia;
    // Reduce Motion (common on iPhones): keep scrolling but drop to a slow, gentle
    // crawl instead of freezing — a frozen half-clipped strip just reads as broken.
    var reduced=mm && mm('(prefers-reduced-motion: reduce)').matches;
    var mobile=mm && mm('(max-width:768px)').matches;
    var speed=reduced?SPEED_REDUCED:(mobile?SPEED_MOBILE:SPEED_DESKTOP);
    // Restart the animation cleanly with the new loop distance + duration.
    track.style.animation='none';
    track.style.setProperty('--ticker-shift', unitW+'px');
    track.style.setProperty('--ticker-dur', (unitW/speed)+'s');
    void track.offsetWidth;                       // reflow so the restart takes
    track.style.animation='';
  }
  build();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt=setTimeout(build,200); });
})();

/* Cinematic hero: crossfade + pan controller. The photo-to-photo crossfade runs
   on every device — desktop, mobile, and even under reduced-motion (a gentle
   opacity fade). The Ken Burns pan is the only motion-sensitive part, and CSS
   suppresses just that under prefers-reduced-motion. No-op on pages without
   .hero-slideshow. */
(function(){
  var box = document.querySelector('.hero-slideshow');
  if(!box) return;
  var slides = [].slice.call(box.querySelectorAll('.hero-slide'));
  if(slides.length < 2) return;
  var SLIDE_MS = 6000, i = 0, timer = null;
  function inject(){ slides.forEach(function(s){ var img=s.querySelector('img[data-lazy]'); if(img && !img.getAttribute('src')){ img.src=img.getAttribute('data-src'); img.removeAttribute('data-lazy'); } }); }
  function advance(){ var next=(i+1)%slides.length; slides[i].classList.remove('is-active'); slides[next].classList.add('is-active'); i=next; }
  function start(){ inject(); timer=setInterval(advance, SLIDE_MS); document.addEventListener('visibilitychange', function(){ if(document.hidden){ if(timer){clearInterval(timer);timer=null;} } else if(!timer){ timer=setInterval(advance, SLIDE_MS); } }); }
  function boot(){ ('requestIdleCallback' in window) ? requestIdleCallback(start,{timeout:1500}) : setTimeout(start,300); }
  if(document.readyState==='complete') boot(); else window.addEventListener('load', boot);
})();

/* Homepage reviews carousel: pagination dots + gentle auto-advance.
   Native CSS scroll-snap does the swiping; this only builds the dots, keeps the
   active dot in sync, and auto-advances (pausing on interaction, freezing under
   reduced-motion). No-op on every page except the homepage. */
(function(){
  var grid = document.querySelector('.trust-quotes-grid');
  if(!grid || !document.body.classList.contains('page-home')) return;
  var cards = [].slice.call(grid.querySelectorAll('.tq-card'));
  if(cards.length < 2) return;

  var GAP = 24;

  /* ── Dots ── */
  var dotsWrap = document.createElement('div');
  dotsWrap.className = 'tq-dots';
  /* role="group" (NOT "tablist"): these are pagination buttons, not a tabs widget
     — the review cards aren't tabpanels. A "tablist" requires role="tab" children,
     and without them the accessibility tree is flagged as malformed (fails both the
     Accessibility "required children" audit and the Agentic Browsing tree check).
     "group" has no required children and correctly labels the pager. */
  dotsWrap.setAttribute('role', 'group');
  dotsWrap.setAttribute('aria-label', 'Reviews navigation');
  var dots = cards.map(function(card, i){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tq-dot';
    b.setAttribute('aria-label', 'Go to review ' + (i + 1));
    b.addEventListener('click', function(){
      bump();
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    dotsWrap.appendChild(b);
    return b;
  });
  grid.parentNode.insertBefore(dotsWrap, grid.nextSibling);

  /* ── Active-dot sync (rAF-throttled) ── */
  var ticking = false;
  function updateActive(){
    ticking = false;
    // Map scroll progress (0…1) across the dots so the first dot lights at the
    // start and the last at the end — works for both the 3-up desktop view and
    // the 1-up mobile view.
    var max = grid.scrollWidth - grid.clientWidth;
    var idx = max > 0 ? Math.round(grid.scrollLeft / max * (cards.length - 1)) : 0;
    if(idx < 0) idx = 0;
    if(idx > cards.length - 1) idx = cards.length - 1;
    dots.forEach(function(d, i){ d.classList.toggle('is-active', i === idx); });
  }
  grid.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; requestAnimationFrame(updateActive); }
  }, { passive: true });
  updateActive();

  /* ── Gentle auto-advance ── */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timer = null, resumeT = null, hovering = false;
  function advance(){
    if(grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 4){
      grid.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      grid.scrollBy({ left: cards[0].getBoundingClientRect().width + GAP, behavior: 'smooth' });
    }
  }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }
  function play(){ if(reduce || timer || hovering || document.hidden) return; timer = setInterval(advance, 5000); }
  function bump(){ stop(); clearTimeout(resumeT); resumeT = setTimeout(play, 6000); }
  grid.addEventListener('mouseenter', function(){ hovering = true; stop(); });
  grid.addEventListener('mouseleave', function(){ hovering = false; play(); });
  ['pointerdown','touchstart','wheel','focusin'].forEach(function(ev){
    grid.addEventListener(ev, bump, { passive: true });
  });
  document.addEventListener('visibilitychange', function(){ if(document.hidden) stop(); else play(); });
  play();
})();

/* (Removed) Hero fold sizing IIFE — the hero now fills the fold via CSS
   min-height:calc(100vh - 70px) and the trust ticker sits just below the fold,
   revealed on scroll. No JS height override needed (it shrank the fold below the
   hero's height and made the next section overlap). */

