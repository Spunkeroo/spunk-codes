/**
 * SPUNK.CODES Email Capture System
 * ==================================
 * - Slide-up bar after 30 seconds: "Join 2,400+ developers. Get free tools weekly."
 * - Exit-intent popup on desktop (mouse leaves viewport)
 * - Stores emails in localStorage with timestamp
 * - Remembers dismissal for 7 days
 * - Integrates with Beehiiv for actual subscription
 * - Tracks via GA4 events
 *
 * Usage: <script src="/email-capture.js"></script>
 */
(function() {
  'use strict';

  // Config
  var BEEHIIV_FORM_ID = '6831d05b-f121-4e0d-951b-16f88ddd9ec3';
  var BEEHIIV_EMBED_URL = 'https://embeds.beehiiv.com/' + BEEHIIV_FORM_ID;
  var SHOW_DELAY = 30000; // 30 seconds
  var DISMISS_DAYS = 7;

  // Storage keys
  var DISMISS_KEY = 'sc_email_dismissed';
  var EMAILS_KEY = 'sc_emails';
  var SUBMITTED_KEY = 'sc_email_subscribed';

  // Don't show on certain pages
  var path = window.location.pathname;
  if (path.indexOf('/social-cards/') !== -1) return;
  if (path.indexOf('pricing') !== -1 || path.indexOf('store') !== -1 || path.indexOf('join') !== -1) return;

  // Helpers
  function lsGet(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch(e) {} }

  function isDismissed() {
    var ts = lsGet(DISMISS_KEY);
    if (!ts) return false;
    var diff = Date.now() - parseInt(ts, 10);
    return diff < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  }

  function isSubscribed() {
    return lsGet(SUBMITTED_KEY) === '1';
  }

  function dismiss() {
    lsSet(DISMISS_KEY, Date.now().toString());
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function track(action, label) {
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: 'email_capture',
        event_label: label || '',
        location: label || ''
      });
    }
  }

  function storeEmail(email, source) {
    var emails = [];
    try { emails = JSON.parse(lsGet(EMAILS_KEY) || '[]'); } catch(e) {}
    emails.push({
      email: email,
      source: source,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    });
    lsSet(EMAILS_KEY, JSON.stringify(emails));
    lsSet(SUBMITTED_KEY, '1');
  }

  function subscribeViaBeehiiv(email) {
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute';
    iframe.src = BEEHIIV_EMBED_URL + '?email=' + encodeURIComponent(email);
    document.body.appendChild(iframe);
  }

  // Exit early if dismissed or already subscribed
  if (isDismissed() || isSubscribed()) return;

  // Inject styles
  var style = document.createElement('style');
  style.textContent = [
    /* Slide-up bar */
    '#sc-email-bar{',
      'position:fixed;bottom:0;left:0;right:0;z-index:9980;',
      'background:rgba(22,27,34,0.97);',
      'border-top:1px solid rgba(48,54,61,0.6);',
      'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);',
      'padding:16px 24px;',
      'display:flex;align-items:center;justify-content:center;gap:16px;',
      'flex-wrap:wrap;',
      'transform:translateY(100%);',
      'transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);',
      'font-family:system-ui,-apple-system,sans-serif;',
    '}',
    '#sc-email-bar.visible{transform:translateY(0);}',
    '.sc-bar-text{',
      'color:#e6edf3;font-size:14px;font-weight:600;line-height:1.4;',
      'flex-shrink:0;',
    '}',
    '.sc-bar-text span{',
      'background:linear-gradient(135deg,#58a6ff,#39d353);',
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;',
      'background-clip:text;font-weight:800;',
    '}',
    '.sc-bar-form{display:flex;gap:8px;flex-shrink:0;}',
    '.sc-bar-input{',
      'padding:8px 14px;width:240px;',
      'background:rgba(13,17,23,0.8);border:1px solid rgba(48,54,61,0.6);',
      'border-radius:8px;color:#e6edf3;font-size:13px;',
      'font-family:system-ui,-apple-system,sans-serif;',
      'outline:none;transition:border-color 0.2s;',
    '}',
    '.sc-bar-input:focus{border-color:#58a6ff;}',
    '.sc-bar-input::placeholder{color:#484f58;}',
    '.sc-bar-submit{',
      'padding:8px 20px;border:none;border-radius:8px;',
      'background:linear-gradient(135deg,#58a6ff,#39d353);',
      'color:#0d1117;font-size:13px;font-weight:700;',
      'font-family:system-ui,-apple-system,sans-serif;',
      'cursor:pointer;transition:all 0.2s;white-space:nowrap;',
    '}',
    '.sc-bar-submit:hover{',
      'transform:translateY(-1px);',
      'box-shadow:0 4px 15px rgba(88,166,255,0.3);',
    '}',
    '.sc-bar-submit:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none;}',
    '.sc-bar-dismiss{',
      'background:none;border:none;color:#484f58;font-size:18px;',
      'cursor:pointer;padding:4px 8px;line-height:1;',
      'transition:color 0.2s;flex-shrink:0;',
    '}',
    '.sc-bar-dismiss:hover{color:#8b949e;}',
    '.sc-bar-success{',
      'color:#39d353;font-size:13px;font-weight:600;',
      'display:flex;align-items:center;gap:6px;',
    '}',

    /* Exit-intent popup overlay */
    '#sc-exit-overlay{',
      'position:fixed;inset:0;z-index:9999;',
      'background:rgba(0,0,0,0.7);',
      'display:flex;align-items:center;justify-content:center;',
      'opacity:0;visibility:hidden;',
      'transition:all 0.3s;',
      'font-family:system-ui,-apple-system,sans-serif;',
    '}',
    '#sc-exit-overlay.visible{opacity:1;visibility:visible;}',
    '.sc-exit-modal{',
      'background:#161b22;border:1px solid rgba(48,54,61,0.6);',
      'border-radius:16px;padding:40px;max-width:440px;width:90%;',
      'text-align:center;position:relative;',
      'transform:scale(0.9);transition:transform 0.3s;',
    '}',
    '#sc-exit-overlay.visible .sc-exit-modal{transform:scale(1);}',
    '.sc-exit-close{',
      'position:absolute;top:12px;right:16px;',
      'background:none;border:none;color:#484f58;font-size:22px;',
      'cursor:pointer;transition:color 0.2s;padding:4px;',
    '}',
    '.sc-exit-close:hover{color:#e6edf3;}',
    '.sc-exit-icon{font-size:40px;margin-bottom:16px;display:block;}',
    '.sc-exit-title{',
      'font-size:22px;font-weight:800;color:#e6edf3;margin-bottom:8px;',
      'line-height:1.2;',
    '}',
    '.sc-exit-title span{',
      'background:linear-gradient(135deg,#58a6ff,#39d353);',
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;',
      'background-clip:text;',
    '}',
    '.sc-exit-desc{',
      'font-size:14px;color:#8b949e;margin-bottom:20px;line-height:1.5;',
    '}',
    '.sc-exit-form{display:flex;gap:8px;justify-content:center;}',
    '.sc-exit-input{',
      'padding:10px 14px;width:220px;',
      'background:rgba(13,17,23,0.8);border:1px solid rgba(48,54,61,0.6);',
      'border-radius:10px;color:#e6edf3;font-size:14px;',
      'font-family:system-ui,-apple-system,sans-serif;',
      'outline:none;transition:border-color 0.2s;',
    '}',
    '.sc-exit-input:focus{border-color:#58a6ff;}',
    '.sc-exit-input::placeholder{color:#484f58;}',
    '.sc-exit-submit{',
      'padding:10px 24px;border:none;border-radius:10px;',
      'background:linear-gradient(135deg,#58a6ff,#39d353);',
      'color:#0d1117;font-size:14px;font-weight:700;',
      'font-family:system-ui,-apple-system,sans-serif;',
      'cursor:pointer;transition:all 0.2s;white-space:nowrap;',
    '}',
    '.sc-exit-submit:hover{',
      'transform:translateY(-1px);',
      'box-shadow:0 4px 15px rgba(88,166,255,0.3);',
    '}',
    '.sc-exit-skip{',
      'display:inline-block;margin-top:12px;',
      'font-size:12px;color:#484f58;',
      'background:none;border:none;cursor:pointer;',
      'font-family:system-ui,-apple-system,sans-serif;',
      'transition:color 0.2s;',
    '}',
    '.sc-exit-skip:hover{color:#8b949e;}',
    '.sc-exit-success{',
      'font-size:16px;color:#39d353;font-weight:600;padding:20px 0;',
    '}',
    '.sc-exit-perks{',
      'display:flex;gap:16px;justify-content:center;margin-bottom:16px;flex-wrap:wrap;',
    '}',
    '.sc-exit-perk{',
      'font-size:11px;color:#8b949e;display:flex;align-items:center;gap:4px;',
    '}',
    '.sc-exit-perk::before{content:"\\2713";color:#39d353;font-weight:800;font-size:10px;}',

    /* Mobile adjustments */
    '@media(max-width:640px){',
      '#sc-email-bar{padding:12px 16px;gap:10px;flex-direction:column;}',
      '.sc-bar-text{font-size:13px;text-align:center;}',
      '.sc-bar-form{width:100%;}',
      '.sc-bar-input{flex:1;width:auto;}',
      '.sc-exit-form{flex-direction:column;}',
      '.sc-exit-input{width:100%;}',
      '.sc-exit-modal{padding:28px 20px;}',
      '.sc-exit-perks{gap:8px;}',
    '}'
  ].join('');
  document.head.appendChild(style);

  // ==========================================
  // SLIDE-UP BAR
  // ==========================================
  var bar = document.createElement('div');
  bar.id = 'sc-email-bar';
  bar.innerHTML = [
    '<div class="sc-bar-text">Join <span>2,400+</span> developers. Get free tools weekly.</div>',
    '<div class="sc-bar-form" id="sc-bar-form">',
      '<input type="email" class="sc-bar-input" id="sc-bar-email" placeholder="your@email.com" autocomplete="email">',
      '<button class="sc-bar-submit" id="sc-bar-submit">Subscribe</button>',
    '</div>',
    '<button class="sc-bar-dismiss" id="sc-bar-dismiss" aria-label="Dismiss" title="Dismiss">&times;</button>'
  ].join('');
  document.body.appendChild(bar);

  // Show bar after delay
  var barTimer = setTimeout(function() {
    if (!isSubscribed() && !isDismissed()) {
      bar.classList.add('visible');
      track('email_bar_shown', 'slide_up');
    }
  }, SHOW_DELAY);

  // Bar dismiss
  document.getElementById('sc-bar-dismiss').addEventListener('click', function() {
    bar.classList.remove('visible');
    dismiss();
    clearTimeout(barTimer);
    track('email_capture_dismiss', 'slide_up');
  });

  // Bar submit
  document.getElementById('sc-bar-submit').addEventListener('click', function() {
    var emailInput = document.getElementById('sc-bar-email');
    var email = emailInput.value.trim();
    if (!isValidEmail(email)) {
      emailInput.style.borderColor = '#ff7b72';
      emailInput.setAttribute('placeholder', 'Enter a valid email');
      setTimeout(function() {
        emailInput.style.borderColor = '';
        emailInput.setAttribute('placeholder', 'your@email.com');
      }, 2000);
      return;
    }

    this.disabled = true;
    this.textContent = 'Subscribing...';

    // Store locally + subscribe via Beehiiv
    storeEmail(email, 'slide_up_bar');
    subscribeViaBeehiiv(email);
    track('email_capture', 'slide_up');

    var self = this;
    setTimeout(function() {
      var form = document.getElementById('sc-bar-form');
      form.innerHTML = '<div class="sc-bar-success"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> You\'re in! Check your inbox.</div>';
      setTimeout(function() { bar.classList.remove('visible'); }, 3000);
    }, 1200);
  });

  // Bar email enter key
  document.getElementById('sc-bar-email').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('sc-bar-submit').click();
    }
  });

  // ==========================================
  // EXIT-INTENT POPUP (Desktop only)
  // ==========================================
  var exitShown = false;
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouch) {
    var overlay = document.createElement('div');
    overlay.id = 'sc-exit-overlay';
    overlay.innerHTML = [
      '<div class="sc-exit-modal">',
        '<button class="sc-exit-close" id="sc-exit-close" aria-label="Close">&times;</button>',
        '<div class="sc-exit-icon">\u26A1</div>',
        '<div class="sc-exit-title">Wait! Grab your <span>free tools</span></div>',
        '<div class="sc-exit-desc">Join 2,400+ developers who get free tools, ebooks, and guides delivered every week. No spam, ever.</div>',
        '<div class="sc-exit-perks">',
          '<span class="sc-exit-perk">Free ebooks</span>',
          '<span class="sc-exit-perk">New tool alerts</span>',
          '<span class="sc-exit-perk">Exclusive tips</span>',
        '</div>',
        '<div class="sc-exit-form" id="sc-exit-form">',
          '<input type="email" class="sc-exit-input" id="sc-exit-email" placeholder="your@email.com" autocomplete="email">',
          '<button class="sc-exit-submit" id="sc-exit-submit">Get Free Tools</button>',
        '</div>',
        '<button class="sc-exit-skip" id="sc-exit-skip">No thanks, I\'ll pass</button>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    // Exit intent detection: mouse leaves through top of viewport
    document.addEventListener('mouseout', function(e) {
      if (exitShown || isSubscribed() || isDismissed()) return;
      if (e.clientY <= 0 && e.relatedTarget === null) {
        exitShown = true;
        overlay.classList.add('visible');
        track('exit_intent_shown', 'exit_intent');
      }
    });

    function closeExit() {
      overlay.classList.remove('visible');
      dismiss();
    }

    document.getElementById('sc-exit-close').addEventListener('click', closeExit);
    document.getElementById('sc-exit-skip').addEventListener('click', function() {
      closeExit();
      track('email_capture_dismiss', 'exit_intent');
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeExit();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('visible')) closeExit();
    });

    // Exit submit
    document.getElementById('sc-exit-submit').addEventListener('click', function() {
      var emailInput = document.getElementById('sc-exit-email');
      var email = emailInput.value.trim();
      if (!isValidEmail(email)) {
        emailInput.style.borderColor = '#ff7b72';
        emailInput.setAttribute('placeholder', 'Enter a valid email');
        setTimeout(function() {
          emailInput.style.borderColor = '';
          emailInput.setAttribute('placeholder', 'your@email.com');
        }, 2000);
        return;
      }

      // Store + subscribe + track
      storeEmail(email, 'exit_intent');
      subscribeViaBeehiiv(email);
      track('email_capture', 'exit_intent');

      var form = document.getElementById('sc-exit-form');
      form.innerHTML = '<div class="sc-exit-success">\u2705 You\'re subscribed! Check your inbox.</div>';

      // Also hide the slide-up bar
      bar.classList.remove('visible');
      clearTimeout(barTimer);

      setTimeout(closeExit, 2500);
    });

    // Exit email enter key
    document.getElementById('sc-exit-email').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('sc-exit-submit').click();
      }
    });
  }
})();
