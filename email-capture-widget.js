/**
 * SPUNK.CODES — Email Capture Widget (Enhanced)
 * ===============================================
 * Reusable slide-up email capture popup with:
 *   - 30-second delay trigger
 *   - Exit-intent trigger (desktop)
 *   - 3-day localStorage cooldown
 *   - Beehiiv form integration
 *   - Mobile bottom-sheet layout
 *   - Success animation on submit
 *   - Dismissible with X button
 *
 * Usage:
 *   <script src="/email-capture-widget.js"></script>
 *   — or —
 *   <script src="https://spunk.codes/email-capture-widget.js"></script>
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────
  var LS_PREFIX = 'sc_ecw_';
  var BEEHIIV_ACTION = 'https://embeds.beehiiv.com/subscribe';
  var SHOW_DELAY = 30000; // 30 seconds
  var COOLDOWN_DAYS = 3;
  var GA4_ID = 'G-GVNL11PEGP';

  // ── Helpers ─────────────────────────────────────────────
  function lsGet(k) { try { return localStorage.getItem(LS_PREFIX + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(LS_PREFIX + k, v); } catch (e) {} }

  function track(action, label) {
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: 'email_capture_widget',
        event_label: label || ''
      });
    }
  }

  function isMobile() {
    return window.innerWidth <= 640;
  }

  // ── Cooldown check ──────────────────────────────────────
  // Don't show if subscribed
  if (lsGet('subscribed')) return;

  // Don't show if dismissed within cooldown period
  var lastDismissed = lsGet('dismissed_at');
  if (lastDismissed) {
    var elapsed = Date.now() - parseInt(lastDismissed, 10);
    var cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    if (elapsed < cooldownMs) return;
  }

  // Don't show on newsletter/lead-magnet/pricing pages
  var path = window.location.pathname;
  if (path.indexOf('newsletter') !== -1 ||
      path.indexOf('lead-magnet') !== -1 ||
      path.indexOf('pricing') !== -1 ||
      path.indexOf('store') !== -1 ||
      path.indexOf('join') !== -1 ||
      path.indexOf('email-sequence') !== -1) return;

  // ── Inject styles ───────────────────────────────────────
  var css = document.createElement('style');
  css.textContent = [
    '/* ── Email Capture Widget ── */',

    /* Keyframes */
    '@keyframes ecwSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}',
    '@keyframes ecwFadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}',
    '@keyframes ecwCheckPop{0%{transform:scale(0);opacity:0}50%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}',
    '@keyframes ecwShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
    '@keyframes ecwPulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(88,166,255,0.3)}50%{box-shadow:0 0 0 6px rgba(88,166,255,0)}}',

    /* Overlay (for mobile bottom sheet) */
    '.ecw-overlay{position:fixed;inset:0;z-index:10002;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity 0.3s ease}',
    '.ecw-overlay.ecw-active{opacity:1;pointer-events:auto}',

    /* Widget container - desktop */
    '.ecw-widget{position:fixed;bottom:24px;right:24px;z-index:10003;width:400px;max-width:calc(100vw - 48px);animation:ecwSlideUp 0.5s cubic-bezier(0.22,1,0.36,1);font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;display:none}',
    '.ecw-widget.ecw-visible{display:block}',
    '.ecw-widget.ecw-hiding{transform:translateY(110%);opacity:0;transition:all 0.4s cubic-bezier(0.55,0,1,0.45)}',

    /* Card */
    '.ecw-card{background:linear-gradient(145deg,#161b22 0%,#0d1117 100%);border:1px solid rgba(88,166,255,0.2);border-radius:20px;padding:28px 24px 24px;box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(88,166,255,0.06);position:relative;overflow:hidden}',

    /* Gradient border shimmer */
    '.ecw-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#58a6ff,#39d353,transparent);background-size:200% 100%;animation:ecwShimmer 3s linear infinite}',

    /* Close button */
    '.ecw-close{position:absolute;top:12px;right:14px;background:rgba(48,54,61,0.5);border:1px solid rgba(48,54,61,0.8);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#8b949e;font-size:16px;cursor:pointer;transition:all 0.2s;z-index:2;line-height:1}',
    '.ecw-close:hover{background:rgba(88,166,255,0.15);border-color:rgba(88,166,255,0.3);color:#e6edf3}',

    /* Header area */
    '.ecw-header{margin-bottom:16px}',
    '.ecw-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(57,211,83,0.08);border:1px solid rgba(57,211,83,0.2);border-radius:100px;font-size:11px;font-weight:700;color:#39d353;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:12px}',
    '.ecw-badge-dot{width:5px;height:5px;background:#39d353;border-radius:50%;animation:ecwPulseGlow 2s infinite}',
    '.ecw-card h3{color:#e6edf3;font-size:18px;font-weight:800;line-height:1.3;margin:0 0 6px}',
    '.ecw-card h3 span{background:linear-gradient(135deg,#58a6ff,#39d353);-webkit-background-clip:text;-webkit-text-fill-color:transparent}',
    '.ecw-subtitle{color:#8b949e;font-size:13px;line-height:1.5;margin:0 0 16px}',

    /* Perks */
    '.ecw-perks{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px}',
    '.ecw-perk{display:flex;align-items:center;gap:5px;font-size:12px;color:#8b949e}',
    '.ecw-perk-check{color:#39d353;font-weight:800;font-size:11px}',

    /* Form */
    '.ecw-form{display:flex;gap:8px}',
    '.ecw-input{flex:1;padding:12px 16px;background:rgba(13,17,23,0.8);border:1px solid #30363d;border-radius:12px;color:#e6edf3;font-size:14px;font-family:inherit;outline:none;transition:all 0.2s}',
    '.ecw-input:focus{border-color:#58a6ff;box-shadow:0 0 0 3px rgba(88,166,255,0.1)}',
    '.ecw-input::placeholder{color:#484f58}',
    '.ecw-btn{padding:12px 22px;background:linear-gradient(135deg,#58a6ff,#388bfd);color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.25s;white-space:nowrap;font-family:inherit;letter-spacing:0.2px}',
    '.ecw-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(88,166,255,0.35)}',
    '.ecw-btn:active{transform:translateY(0)}',
    '.ecw-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none}',

    /* Trust line */
    '.ecw-trust{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:14px;font-size:11px;color:#484f58}',
    '.ecw-trust span{display:flex;align-items:center;gap:4px}',

    /* Success state */
    '.ecw-success{text-align:center;padding:20px 10px}',
    '.ecw-success-check{font-size:48px;margin-bottom:12px;display:block;animation:ecwCheckPop 0.5s cubic-bezier(0.34,1.56,0.64,1)}',
    '.ecw-success h4{color:#39d353;font-size:18px;font-weight:800;margin-bottom:6px}',
    '.ecw-success p{color:#8b949e;font-size:13px;line-height:1.5}',
    '.ecw-success a{color:#58a6ff;font-weight:600;text-decoration:none;font-size:13px;display:inline-block;margin-top:10px;transition:color 0.2s}',
    '.ecw-success a:hover{color:#79c0ff}',

    /* Mobile: bottom sheet */
    '@media(max-width:640px){',
    '  .ecw-widget{bottom:0;right:0;left:0;width:100%;max-width:100%;border-radius:0;animation:ecwSlideUp 0.4s cubic-bezier(0.22,1,0.36,1)}',
    '  .ecw-card{border-radius:20px 20px 0 0;padding:24px 20px 28px;border-bottom:none}',
    '  .ecw-card::after{content:"";display:block;width:40px;height:4px;background:rgba(48,54,61,0.6);border-radius:2px;margin:0 auto;position:absolute;top:10px;left:50%;transform:translateX(-50%)}',
    '  .ecw-form{flex-direction:column}',
    '  .ecw-btn{width:100%;padding:14px}',
    '  .ecw-close{top:14px;right:16px}',
    '}'
  ].join('\n');
  document.head.appendChild(css);

  // ── Build overlay (for mobile) ──────────────────────────
  var overlay = document.createElement('div');
  overlay.className = 'ecw-overlay';
  document.body.appendChild(overlay);

  // ── Build widget ────────────────────────────────────────
  var widget = document.createElement('div');
  widget.className = 'ecw-widget';
  widget.innerHTML =
    '<div class="ecw-card">' +
      '<button class="ecw-close" aria-label="Close">&times;</button>' +

      '<div class="ecw-header">' +
        '<div class="ecw-badge"><span class="ecw-badge-dot"></span> FREE RESOURCES</div>' +
        '<h3>Get <span>5 free ebooks</span> + weekly tool drops</h3>' +
        '<p class="ecw-subtitle">Join 10,000+ solo founders getting free ebooks, new tools, and growth strategies every week.</p>' +
      '</div>' +

      '<div class="ecw-perks">' +
        '<span class="ecw-perk"><span class="ecw-perk-check">&#10003;</span> 5 free ebooks</span>' +
        '<span class="ecw-perk"><span class="ecw-perk-check">&#10003;</span> Weekly tool drops</span>' +
        '<span class="ecw-perk"><span class="ecw-perk-check">&#10003;</span> Growth strategies</span>' +
        '<span class="ecw-perk"><span class="ecw-perk-check">&#10003;</span> Exclusive perks</span>' +
      '</div>' +

      '<form class="ecw-form" autocomplete="on">' +
        '<input type="email" class="ecw-input" placeholder="your@email.com" required autocomplete="email" aria-label="Email address">' +
        '<button type="submit" class="ecw-btn">Join 10,000+ Builders</button>' +
      '</form>' +

      '<div class="ecw-trust">' +
        '<span>&#128274; No spam</span>' +
        '<span>&#9989; Free forever</span>' +
        '<span>&#128075; Unsubscribe anytime</span>' +
      '</div>' +
    '</div>';

  document.body.appendChild(widget);

  // ── State ───────────────────────────────────────────────
  var widgetShown = false;

  function showWidget() {
    if (widgetShown) return;
    if (lsGet('subscribed') || isWithinCooldown()) return;
    widgetShown = true;
    widget.classList.add('ecw-visible');
    if (isMobile()) {
      overlay.classList.add('ecw-active');
    }
    track('ecw_view', 'popup_shown');
  }

  function hideWidget() {
    widget.classList.add('ecw-hiding');
    overlay.classList.remove('ecw-active');
    lsSet('dismissed_at', String(Date.now()));
    track('ecw_dismiss', 'popup_closed');
    setTimeout(function () {
      widget.remove();
      overlay.remove();
    }, 500);
  }

  function isWithinCooldown() {
    var ts = lsGet('dismissed_at');
    if (!ts) return false;
    return (Date.now() - parseInt(ts, 10)) < (COOLDOWN_DAYS * 86400000);
  }

  // ── Close button ────────────────────────────────────────
  widget.querySelector('.ecw-close').addEventListener('click', hideWidget);
  overlay.addEventListener('click', hideWidget);

  // ── Form submission ─────────────────────────────────────
  widget.querySelector('.ecw-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = widget.querySelector('.ecw-input');
    var btn = widget.querySelector('.ecw-btn');
    var email = input.value.trim();

    if (!email || email.indexOf('@') === -1) return;

    btn.disabled = true;
    btn.textContent = 'Subscribing...';

    track('ecw_submit', email.split('@')[1]); // Domain only for privacy

    // Submit to Beehiiv via hidden iframe with form post
    var iframe = document.createElement('iframe');
    iframe.name = 'ecw_beehiiv_frame';
    iframe.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute';
    document.body.appendChild(iframe);

    var form = document.createElement('form');
    form.method = 'POST';
    form.action = BEEHIIV_ACTION;
    form.target = 'ecw_beehiiv_frame';
    form.style.display = 'none';

    var emailField = document.createElement('input');
    emailField.type = 'hidden';
    emailField.name = 'email';
    emailField.value = email;
    form.appendChild(emailField);

    document.body.appendChild(form);
    form.submit();

    // Show success state after brief delay
    setTimeout(function () {
      form.remove();

      var card = widget.querySelector('.ecw-card');
      // Keep the shimmer bar
      card.innerHTML =
        '<div class="ecw-success">' +
          '<span class="ecw-success-check">&#127881;</span>' +
          '<h4>You\'re in! Welcome aboard.</h4>' +
          '<p>Check your inbox for your 5 free ebooks and a welcome surprise.</p>' +
          '<a href="/lead-magnet.html">Download your ebooks now &rarr;</a>' +
        '</div>';

      lsSet('subscribed', '1');
      lsSet('subscriber_email', email);
      track('ecw_success', 'subscribed');

      // Auto-dismiss after 6s
      setTimeout(function () {
        overlay.classList.remove('ecw-active');
        widget.classList.add('ecw-hiding');
        setTimeout(function () {
          widget.remove();
          overlay.remove();
        }, 500);
      }, 6000);
    }, 1500);
  });

  // ── Trigger 1: Delay (30 seconds) ──────────────────────
  setTimeout(function () {
    showWidget();
  }, SHOW_DELAY);

  // ── Trigger 2: Exit intent (desktop only) ──────────────
  if (!isMobile()) {
    var exitFired = false;
    document.addEventListener('mouseout', function (e) {
      if (exitFired) return;
      if (e.clientY <= 0) {
        exitFired = true;
        showWidget();
      }
    });
  }

})();
