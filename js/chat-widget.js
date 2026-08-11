/* ──────────────────────────────────────────────────────────────────────────
   Junk Brawlers — website chat widget

   Talks to the n8n FAQ agent (workflow YFuhQb75QqRQXybY) through the Vercel
   proxy at /api/chat, which holds the webhook URL server-side so it is never
   exposed in page source.

   ─── A2P 10DLC: THIS WIDGET MUST NEVER COLLECT A PHONE NUMBER ───
   clients/junk-brawlers/CLAUDE.md makes the quote form the site's single
   registered SMS opt-in of record. Chat stays out of A2P scope only for as
   long as it never asks for or stores a phone number. There is exactly one
   input in here and it is the free-text message box. Do not add name, phone,
   or email fields, and do not add a "get a callback" flow. Anyone who wants
   to book goes to the GHL booking page, which collects those details itself
   under GHL's own consent handling.

   Everything is injected from this one file (markup + styles), so adding the
   widget to a page is a single script tag with nothing else to keep in sync.

   Copy rule: no em dashes in anything the customer can read.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  if (window.JB_CHAT_LOADED) { return; }
  window.JB_CHAT_LOADED = true;

  var script = document.currentScript || (function () {
    var all = document.getElementsByTagName('script');
    return all[all.length - 1];
  })();

  var CFG = {
    endpoint: (script && script.getAttribute('data-endpoint')) || '/api/chat',
    clientId: (script && script.getAttribute('data-client-id')) || 'junk-brawlers',
    phone: '(404) 632-9165',
    phoneHref: 'tel:+14046329165',
    booking: 'https://api.leadconnectorhq.com/widget/bookings/junk-brawlers-pickup',
    greeting: 'Ask me anything about pricing, what we take, or how fast we can get out to you.',
    // Shown when the request fails. Mirrors the workflow's own Respond Fallback node
    // word for word, so the customer sees one voice whichever side broke. Change one,
    // change the other.
    //
    // The most likely cause is a transient model quota blip that clears in seconds,
    // so this asks for a retry rather than sounding terminal. It still prints the
    // phone number, because some failures do not clear.
    failure: 'That one did not go through. Give it another shot in a few seconds, or call us at (404) 632-9165 and we will get you taken care of.'
  };

  var STARTERS = [
    'How much does it cost?',
    'What do you take?',
    'How fast can you get here?',
    'Can I book a pickup?'
  ];

  /* ── styles ───────────────────────────────────────────────────────────── */

  var CSS = [
    '.jb-chat-launch{position:fixed;right:20px;bottom:20px;z-index:940;display:flex;align-items:center;gap:10px;',
    'padding:13px 20px 13px 16px;border:none;cursor:pointer;border-radius:40px;',
    'font-family:var(--font,"Barlow",sans-serif);font-size:15px;font-weight:700;color:#fff;letter-spacing:.2px;',
    'background:linear-gradient(135deg,#7B35D4 0%,#5E22AA 100%);',
    'box-shadow:0 4px 20px rgba(123,53,212,.45),0 2px 6px rgba(0,0,0,.3);',
    'transition:transform .2s ease,box-shadow .2s ease,opacity .2s ease}',
    '.jb-chat-launch:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(123,53,212,.55),0 4px 10px rgba(0,0,0,.35)}',
    '.jb-chat-launch:focus-visible{outline:3px solid #FF7A00;outline-offset:3px}',
    '.jb-chat-launch svg{width:21px;height:21px;flex:0 0 auto}',
    '.jb-chat-launch.is-hidden{opacity:0;pointer-events:none;transform:scale(.85)}',
    /* the launcher has to clear the mobile sticky call bar (z-index 950, ~62px tall) */
    '@media(max-width:768px){.jb-chat-launch{right:14px;bottom:76px;padding:12px 17px 12px 14px;font-size:14px}}',

    /* Above .site-header (1000) and .mobile-nav (999), because on mobile the panel
       goes full screen and the sticky site header would otherwise cover its own
       header bar and the close button. Deliberately below .jb-modal-overlay (2000)
       so the quote modal still wins. */
    '.jb-chat-panel{position:fixed;right:20px;bottom:20px;z-index:1001;width:378px;max-width:calc(100vw - 32px);',
    'height:560px;max-height:calc(100vh - 40px);display:flex;flex-direction:column;overflow:hidden;',
    'background:#fff;border-radius:12px;box-shadow:0 18px 50px rgba(7,0,26,.4),0 4px 14px rgba(0,0,0,.2);',
    'font-family:var(--font,"Barlow",sans-serif);opacity:0;transform:translateY(12px) scale(.98);',
    'pointer-events:none;transition:opacity .22s ease,transform .22s ease}',
    '.jb-chat-panel.is-open{opacity:1;transform:none;pointer-events:auto}',
    /* Dimmed page behind the sheet. Tapping it closes, which is the gesture people
       already expect from every other sheet on a phone. Mobile only. */
    '.jb-chat-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(7,0,26,.5);opacity:0;',
    'pointer-events:none;transition:opacity .25s ease;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}',
    '.jb-chat-backdrop.is-open{opacity:1;pointer-events:auto}',
    '@media(min-width:769px){.jb-chat-backdrop{display:none}}',

    /* Grabber. Signals "drag me down" before anyone has to guess.
       NOTE: this base rule must stay ABOVE the mobile media query below. A media
       query adds no specificity, so if display:none came afterwards it would win
       and the handle would never appear on a phone. */
    '.jb-grab{display:none;width:100%;padding:9px 0 3px;cursor:grab;touch-action:none;background:#12002B}',
    '.jb-grab i{display:block;width:40px;height:4px;margin:0 auto;border-radius:2px;background:rgba(255,255,255,.42)}',

    /* Mobile is a bottom sheet, not a full screen takeover. The page stays visible
       behind it, so it reads as something you can flick away rather than a screen
       you got sent to. It slides up from the bottom, which is also the direction
       you swipe to dismiss it.

       Height is deliberately auto rather than a fixed share of the screen. A fixed
       height opens as a mostly empty grey box, which is a poor first impression and
       makes the thing feel heavier than it is. Instead the sheet hugs the greeting
       and the starter chips, then grows with the conversation until it hits the cap
       below, at which point the message log starts scrolling and the sheet stops
       moving. */
    '@media(max-width:768px){',
    '.jb-chat-panel{right:0;left:0;bottom:0;width:100%;max-width:100%;height:auto;min-height:0;',
    'max-height:78dvh;border-radius:16px 16px 0 0;transform:translateY(100%);',
    'transition:transform .3s cubic-bezier(.32,.72,0,1),opacity .2s ease}',
    '.jb-chat-panel.is-open{transform:translateY(0)}',
    '.jb-chat-panel.is-dragging{transition:none}',
    /* flex:0 1 auto so the log sizes to its content instead of stretching to fill a
       height the sheet no longer has. min-height:0 is the part people miss: without
       it a flex child refuses to shrink below its content and will not scroll. */
    '.jb-chat-log{flex:0 1 auto;min-height:0;padding-bottom:10px}',
    '.jb-grab{display:block}',
    '.jb-chat-head{padding-top:4px}',
    '}',

    '.jb-chat-head{flex:0 0 auto;display:flex;align-items:center;gap:11px;padding:14px 14px 14px 16px;',
    'background:linear-gradient(135deg,#12002B 0%,#080014 100%);border-bottom:2px solid #FF7A00}',
    '.jb-chat-head img{width:34px;height:34px;object-fit:contain;flex:0 0 auto}',
    '.jb-chat-head-txt{flex:1;min-width:0}',
    '.jb-chat-head-name{font-family:var(--font-heading,"Barlow Condensed",sans-serif);font-weight:800;',
    'font-size:19px;color:#fff;line-height:1.1;text-transform:uppercase;letter-spacing:.4px}',
    '.jb-chat-head-sub{font-size:12px;color:rgba(255,255,255,.72);line-height:1.3;margin-top:1px}',
    '.jb-chat-head-sub b{color:#4ADE80;font-weight:700}',
    /* 44px is the Apple HIG minimum tap target. The old 34px was a thumb-miss
       waiting to happen, and a close button you miss is the worst one to miss. */
    '.jb-chat-x{flex:0 0 auto;width:44px;height:44px;display:flex;align-items:center;justify-content:center;',
    'background:rgba(255,255,255,.08);border:none;cursor:pointer;color:rgba(255,255,255,.85);',
    'border-radius:50%;font-size:0;-webkit-tap-highlight-color:transparent}',
    '.jb-chat-x:hover{color:#fff;background:rgba(255,255,255,.18)}',
    '.jb-chat-x:active{background:rgba(255,255,255,.26)}',
    '.jb-chat-x:focus-visible{outline:2px solid #FF7A00;outline-offset:1px}',
    '.jb-chat-x svg{width:19px;height:19px}',

    '.jb-chat-log{flex:1 1 auto;overflow-y:auto;overscroll-behavior:contain;padding:16px 14px 6px;',
    'background:#F5F3F8;display:flex;flex-direction:column;gap:10px}',
    '.jb-msg{max-width:85%;padding:10px 13px;border-radius:12px;font-size:14.5px;line-height:1.5;',
    'white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere}',
    '.jb-msg-bot{align-self:flex-start;background:#fff;color:#1C1C2E;border-bottom-left-radius:3px;',
    'box-shadow:0 1px 3px rgba(7,0,26,.1)}',
    '.jb-msg-me{align-self:flex-end;background:linear-gradient(135deg,#7B35D4 0%,#5E22AA 100%);color:#fff;',
    'border-bottom-right-radius:3px}',
    '.jb-msg-err{align-self:flex-start;background:#FFF4E8;color:#7A3B00;border:1px solid #FFD5A8;',
    'border-bottom-left-radius:3px}',
    '.jb-msg a{color:#5E22AA;font-weight:600;text-decoration:underline}',
    '.jb-msg-me a{color:#fff}',

    /* Booking link is pulled out of the sentence and rendered as a real button.
       A URL sitting in a chat bubble is a worse call to action than a button is. */
    '.jb-book{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;margin-top:-2px;',
    'padding:12px 20px;border-radius:6px;text-decoration:none;color:#fff;font-size:14.5px;font-weight:700;',
    'background:linear-gradient(135deg,#FF7A00 0%,#C05000 100%);box-shadow:0 3px 14px rgba(255,122,0,.4);',
    'transition:transform .18s ease,box-shadow .18s ease}',
    '.jb-book:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(255,122,0,.5)}',
    '.jb-book:focus-visible{outline:3px solid #7B35D4;outline-offset:2px}',
    '.jb-book svg{width:16px;height:16px}',

    '.jb-chips{display:flex;flex-wrap:wrap;gap:7px;padding:4px 0 2px}',
    '.jb-chip{padding:8px 13px;border-radius:20px;border:1px solid #D6CCE8;background:#fff;color:#5E22AA;',
    'font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s ease,border-color .15s ease}',
    '.jb-chip:hover{background:#F0EAFA;border-color:#7B35D4}',
    '.jb-chip:focus-visible{outline:2px solid #7B35D4;outline-offset:1px}',

    '.jb-dots{align-self:flex-start;display:flex;gap:4px;padding:13px 15px;background:#fff;border-radius:12px;',
    'border-bottom-left-radius:3px;box-shadow:0 1px 3px rgba(7,0,26,.1)}',
    '.jb-dots i{width:7px;height:7px;border-radius:50%;background:#B584F5;animation:jb-bounce 1.3s infinite ease-in-out}',
    '.jb-dots i:nth-child(2){animation-delay:.18s}.jb-dots i:nth-child(3){animation-delay:.36s}',
    '@keyframes jb-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}',

    '.jb-chat-foot{flex:0 0 auto;padding:10px 12px;background:#fff;border-top:1px solid #E6E1EE;',
    'padding-bottom:calc(10px + env(safe-area-inset-bottom))}',
    '.jb-chat-form{display:flex;gap:8px;align-items:flex-end}',
    /* font-size MUST stay at or above 16px. Below that, iOS Safari zooms the whole
       page the moment the field is focused, and the visitor is left pinching their
       way back out. This is the single most common mobile chat widget bug. */
    '.jb-chat-input{flex:1;resize:none;max-height:96px;padding:11px 14px;border:1px solid #D6CCE8;border-radius:22px;',
    'font-family:inherit;font-size:16px;line-height:1.4;color:#1C1C2E;background:#fff}',
    '.jb-chat-input:focus{outline:none;border-color:#7B35D4;box-shadow:0 0 0 3px rgba(123,53,212,.15)}',
    '.jb-send{flex:0 0 auto;width:44px;height:44px;display:flex;align-items:center;justify-content:center;',
    'border:none;border-radius:50%;cursor:pointer;color:#fff;-webkit-tap-highlight-color:transparent;',
    'background:linear-gradient(135deg,#7B35D4 0%,#5E22AA 100%)}',
    '.jb-send:disabled{opacity:.4;cursor:default}',
    '.jb-send:focus-visible{outline:2px solid #FF7A00;outline-offset:2px}',
    '.jb-send svg{width:17px;height:17px}',
    '.jb-chat-note{margin:7px 2px 0;font-size:11px;line-height:1.4;color:#6B6880;text-align:center}',
    '.jb-chat-note a{color:#5E22AA;font-weight:700;text-decoration:none}',
    '.jb-chat-note a:hover{text-decoration:underline}',

    '@media(prefers-reduced-motion:reduce){.jb-chat-launch,.jb-chat-panel,.jb-book{transition:none}',
    '.jb-chat-launch:hover,.jb-book:hover{transform:none}.jb-dots i{animation:none}}'
  ].join('');

  /* ── helpers ──────────────────────────────────────────────────────────── */

  var ICON = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-4.2-.9L3 21l1.9-4.3A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Punctuation-aware linkify. A full stop after a URL is sentence punctuation, not
     part of the link, so the trailing-character class deliberately excludes it. The
     workflow's Sanitize Reply node already strips these, but a linkifier that gets
     this wrong is exactly how the booking link broke before, so we do not rely on
     one side alone. */
  var URL_RE = /https?:\/\/[^\s<]*[^\s<.,:;!?'")\]}]/g;

  function linkify(s) {
    return esc(s).replace(URL_RE, function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + '</a>';
    });
  }

  function track(name, params) {
    try { if (typeof window.gtag === 'function') { window.gtag('event', name, params || {}); } } catch (e) {}
  }

  function store(key, val) {
    try {
      if (val === undefined) { return window.sessionStorage.getItem(key); }
      window.sessionStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  function sessionId() {
    var id = store('jb_chat_sid');
    if (!id) {
      id = 'web-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      store('jb_chat_sid', id);
    }
    return id;
  }

  /* ── build ────────────────────────────────────────────────────────────── */

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  var launch = document.createElement('button');
  launch.className = 'jb-chat-launch';
  launch.type = 'button';
  launch.setAttribute('aria-label', 'Open chat. Ask us about junk removal.');
  launch.innerHTML = ICON.chat + '<span>Ask a Brawler</span>';

  var panel = document.createElement('div');
  panel.className = 'jb-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-label', 'Chat with Junk Brawlers');
  panel.innerHTML =
    '<div class="jb-grab" aria-hidden="true"><i></i></div>' +
    '<div class="jb-chat-head">' +
      '<img src="images/logo.png" alt="" width="34" height="34">' +
      '<div class="jb-chat-head-txt">' +
        '<div class="jb-chat-head-name">Ask a Brawler</div>' +
        '<div class="jb-chat-head-sub"><b>Online</b> 7 days a week</div>' +
      '</div>' +
      '<button class="jb-chat-x" type="button" aria-label="Close chat">' + ICON.x + '</button>' +
    '</div>' +
    '<div class="jb-chat-log" role="log" aria-live="polite" aria-atomic="false"></div>' +
    '<div class="jb-chat-foot">' +
      '<form class="jb-chat-form">' +
        '<textarea class="jb-chat-input" rows="1" placeholder="Type your question" ' +
          'aria-label="Type your question" autocomplete="off"></textarea>' +
        '<button class="jb-send" type="submit" aria-label="Send message">' + ICON.send + '</button>' +
      '</form>' +
      '<p class="jb-chat-note">Answers are automated. For anything urgent call ' +
        '<a href="' + CFG.phoneHref + '">' + CFG.phone + '</a></p>' +
    '</div>';

  var backdrop = document.createElement('div');
  backdrop.className = 'jb-chat-backdrop';

  document.body.appendChild(launch);
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  var grab = panel.querySelector('.jb-grab');
  var log = panel.querySelector('.jb-chat-log');
  var form = panel.querySelector('.jb-chat-form');
  var input = panel.querySelector('.jb-chat-input');
  var send = panel.querySelector('.jb-send');
  var closeBtn = panel.querySelector('.jb-chat-x');

  /* ── rendering ────────────────────────────────────────────────────────── */

  function scroll() { log.scrollTop = log.scrollHeight; }

  function addMsg(role, text) {
    var cls = role === 'me' ? 'jb-msg jb-msg-me' : (role === 'err' ? 'jb-msg jb-msg-err' : 'jb-msg jb-msg-bot');
    var body = String(text || '');
    var booking = null;

    // Pull the booking URL out of the sentence and render it as a button instead.
    if (role === 'bot' && body.indexOf(CFG.booking) !== -1) {
      booking = CFG.booking;
      // Lifting the URL out leaves the words that pointed at it dangling, so a reply
      // like "get booked right here <url>" would otherwise read "get booked right here".
      // The prompt asks the model to end the sentence at the link, but it does not
      // always, so handle a link sitting anywhere: clean the tail of the part before
      // it, close that sentence, then reattach whatever followed.
      var at = body.indexOf(CFG.booking);
      var left = body.slice(0, at);
      var right = body.slice(at + CFG.booking.length);

      left = left
        .replace(/[\s,;:]*(\b(right|over|down|below|here|at|via|on|through)\b[\s,;:]*)+$/i, '')
        .replace(/[\s,;:]+$/, '');

      right = right.replace(/^[\s.,;:]+/, '');

      // Only close the sentence when what follows actually starts a new one. If the
      // reply continued in lower case ("...schedule it over here <url> and we will
      // see you then"), a full stop would leave "Schedule it. and we will see you".
      var startsNewSentence = !right || /^[A-Z"']/.test(right);
      if (left && startsNewSentence && !/[.!?]$/.test(left)) { left += '.'; }

      body = (left + ' ' + right).replace(/[ \t]{2,}/g, ' ').trim();
    }

    if (body) {
      var el = document.createElement('div');
      el.className = cls;
      el.innerHTML = linkify(body);
      log.appendChild(el);
    }

    if (booking) {
      var a = document.createElement('a');
      a.className = 'jb-book';
      a.href = booking;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = ICON.cal + '<span>Grab a time</span>';
      a.addEventListener('click', function () {
        // Distinct from generate_lead on purpose so it does not contaminate the
        // existing form conversion. Mark it as a Key event in GA4 if you want it
        // counted as a conversion.
        track('chat_booking_click', { link_url: booking });
      });
      log.appendChild(a);
    }

    scroll();
  }

  function addChips() {
    var wrap = document.createElement('div');
    wrap.className = 'jb-chips';
    STARTERS.forEach(function (q) {
      var b = document.createElement('button');
      b.className = 'jb-chip';
      b.type = 'button';
      b.textContent = q;
      b.addEventListener('click', function () {
        wrap.remove();
        ask(q);
      });
      wrap.appendChild(b);
    });
    log.appendChild(wrap);
    scroll();
  }

  var dots = null;
  function showDots() {
    dots = document.createElement('div');
    dots.className = 'jb-dots';
    dots.setAttribute('aria-label', 'Typing');
    dots.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(dots);
    scroll();
  }
  function hideDots() { if (dots) { dots.remove(); dots = null; } }

  /* ── transcript persistence (this tab only, so it survives page navigation) ── */

  function saveLog(role, text) {
    try {
      var t = JSON.parse(store('jb_chat_log') || '[]');
      t.push([role, text]);
      store('jb_chat_log', JSON.stringify(t.slice(-40)));
    } catch (e) {}
  }

  function restore() {
    var t;
    try { t = JSON.parse(store('jb_chat_log') || '[]'); } catch (e) { t = []; }

    if (!t.length) {
      addMsg('bot', CFG.greeting);
      saveLog('bot', CFG.greeting);
    } else {
      t.forEach(function (row) { addMsg(row[0], row[1]); });
    }

    // Keep the starter questions up until they have actually asked something. They
    // used to vanish on any page change, which left a first-time visitor staring at
    // an empty box with no idea what this thing answers.
    var asked = t.some(function (row) { return row[0] === 'me'; });
    if (!asked) { addChips(); }
  }

  /* ── send ─────────────────────────────────────────────────────────────── */

  var busy = false;

  function ask(text) {
    var msg = String(text || '').trim();
    if (!msg || busy) { return; }

    busy = true;
    send.disabled = true;
    addMsg('me', msg);
    saveLog('me', msg);
    input.value = '';
    input.style.height = 'auto';
    showDots();
    track('chat_message_sent', {});

    fetch(CFG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput: msg, sessionId: sessionId(), clientId: CFG.clientId })
    })
      .then(function (r) {
        if (!r.ok) { throw new Error('HTTP ' + r.status); }
        return r.json();
      })
      .then(function (d) {
        hideDots();
        var reply = (d && (d.reply || d.output)) || '';
        if (!reply) { throw new Error('empty reply'); }
        addMsg('bot', reply);
        saveLog('bot', reply);
      })
      .catch(function () {
        hideDots();
        addMsg('err', CFG.failure);
        saveLog('err', CFG.failure);
        track('chat_error', {});
      })
      .then(function () {
        busy = false;
        send.disabled = false;
        input.focus();
      });
  }

  /* ── open / close ─────────────────────────────────────────────────────── */

  var started = false;

  function isMobile() { return window.matchMedia('(max-width:768px)').matches; }

  function open() {
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    launch.classList.add('is-hidden');
    launch.setAttribute('aria-expanded', 'true');
    if (!started) { started = true; restore(); }
    // Hold the page still behind the sheet so a scroll gesture inside the log does
    // not bleed through and drag the page around underneath.
    if (isMobile()) { document.body.style.overflow = 'hidden'; }
    track('chat_open', {});
    // Do NOT autofocus the input on mobile. Focusing it summons the keyboard on
    // top of the sheet before the visitor has read a word, which feels like being
    // grabbed. On desktop there is no keyboard, so focusing is just convenient.
    setTimeout(function () {
      if (!isMobile()) { input.focus(); }
      scroll();
    }, 240);
  }

  function close() {
    panel.style.transform = '';
    panel.classList.remove('is-dragging', 'is-open');
    backdrop.classList.remove('is-open');
    launch.classList.remove('is-hidden');
    launch.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (!isMobile()) { launch.focus(); }
  }

  launch.setAttribute('aria-expanded', 'false');
  launch.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) { close(); }
  });

  /* The scroll lock belongs to the mobile sheet, not to the desktop corner card.
     Rotating a tablet from portrait to landscape crosses the 768px breakpoint with
     the panel still open, and without this the page stays frozen behind a widget
     that is no longer covering it. Reads as a broken site. */
  window.addEventListener('resize', function () {
    if (!panel.classList.contains('is-open')) { return; }
    document.body.style.overflow = isMobile() ? 'hidden' : '';
    panel.style.transform = '';
  });

  /* ── swipe the sheet down to dismiss ──────────────────────────────────────
     Drag from the grabber or the header bar. The sheet follows your finger, and
     letting go past a third of its height (or on a quick flick) closes it. Below
     that it springs back, so a half-hearted drag never loses your conversation.
     Deliberately not wired to the message log: dragging there scrolls, as it
     should. */

  var dragY = 0, dragAt = 0, dragging = false;

  function dragStart(e) {
    if (!isMobile()) { return; }
    // The close button lives inside the header. Do not start a drag on it, or a
    // clean tap gets interpreted as a one-pixel drag.
    if (e.target.closest && e.target.closest('.jb-chat-x')) { return; }
    dragY = e.touches[0].clientY;
    dragAt = Date.now();
    dragging = true;
    panel.classList.add('is-dragging');
  }

  function dragMove(e) {
    if (!dragging) { return; }
    var dy = e.touches[0].clientY - dragY;
    if (dy < 0) { dy = dy / 4; }            // slight resistance dragging upward
    panel.style.transform = 'translateY(' + dy + 'px)';
  }

  function dragEnd(e) {
    if (!dragging) { return; }
    dragging = false;
    panel.classList.remove('is-dragging');
    var dy = (e.changedTouches[0].clientY - dragY);
    var fast = (Date.now() - dragAt) < 300 && dy > 60;
    if (dy > panel.offsetHeight / 3 || fast) {
      close();
    } else {
      panel.style.transform = '';       // spring back
    }
  }

  [grab, panel.querySelector('.jb-chat-head')].forEach(function (el) {
    el.addEventListener('touchstart', dragStart, { passive: true });
    el.addEventListener('touchmove', dragMove, { passive: true });
    el.addEventListener('touchend', dragEnd);
    el.addEventListener('touchcancel', dragEnd);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value);
  });

  // Enter sends, Shift+Enter makes a new line. Standard chat behaviour.
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask(input.value);
    }
  });

  // Grow the box with the message, up to the CSS max-height.
  input.addEventListener('input', function () {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  });

  // Let anything on the page open the widget: window.JB_openChat()
  window.JB_openChat = open;
})();
