/**
 * SPUNK.CODES — Email Capture Widget
 * ====================================
 * Slide-up email capture form after 30 seconds.
 * Integrates with Beehiiv embed form.
 * Shows once per session (localStorage).
 *
 * Usage:
 *   <script src="/email-capture.js"></script>
 */

(function () {
  'use strict';

  var LS_PREFIX = 'sc_email_';
  var BEEHIIV_FORM_ID = '6831d05b-f121-4e0d-951b-16f88ddd9ec3';
  var BEEHIIV_EMBED_URL = 'https://embeds.beehiiv.com/' + BEEHIIV_FORM_ID;
  var SHOW_DELAY = 30000; // 30 seconds

  function lsGet(k) { try { return localStorage.getItem(LS_PREFIX + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(LS_PREFIX + k, v); } catch (e) {} }

  function track(action, label) {
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: 'email_capture',
        event_label: label || ''
      });
    }
  }

  // Don't show if already captured this session or if user subscribed
  if (lsGet('session_shown') || lsGet('subscribed')) return;

  // Don't show on pricing/store pages (user is already converting)
  var path = window.location.pathname;
  if (path.indexOf('pricing') !== -1 || path.indexOf('store') !== -1 || path.indexOf('join') !== -1) return;

  // Inject styles
  var css = document.createElement('style');
  css.textContent = [
    '@keyframes scEmailSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}',

    '.sc-email-widget{position:fixed;bottom:16px;right:16px;z-index:9998;width:380px;max-width:calc(100vw - 32px);animation:scEmailSlideUp 0.5s ease;font-family:system-ui,-apple-system,sans-serif}',
    '.sc-email-widget.sc-hidden{transform:translateY(110%);opacity:0;pointer-events:none;transition:all 0.4s ease}',

    '.sc-email-card{background:linear-gradient(145deg,#161b22,#0d1117);border:1px solid rgba(88,166,255,0.2);border-radius:18px;padding:24px 22px 20px;box-shadow:0 16px 50px rgba(0,0,0,0.5),0 0 30px rgba(88,166,255,0.05);position:relative}',

    '.sc-email-close{position:absolute;top:10px;right:12px;background:none;border:none;color:#484f58;font-size:18px;cursor:pointer;padding:4px 8px;line-height:1;transition:color 0.2s;z-index:1}',
    '.sc-email-close:hover{color:#e6edf3}',

    '.sc-email-icon{font-size:28px;margin-bottom:10px}',
    '.sc-email-card h3{color:#e6edf3;font-size:16px;font-weight:800;margin-bottom:4px;line-height:1.3}',
    '.sc-email-card h3 span{background:linear-gradient(135deg,#58a6ff,#39d353);-webkit-background-clip:text;-webkit-text-fill-color:transparent}',
    '.sc-email-card p{color:#8b949e;font-size:12px;margin-bottom:16px;line-height:1.5}',

    '.sc-email-form{display:flex;gap:8px}',
    '.sc-email-input{flex:1;padding:10px 14px;background:rgba(22,27,34,0.8);border:1px solid #30363d;border-radius:10px;color:#e6edf3;font-size:14px;outline:none;transition:border-color 0.2s;font-family:inherit}',
    '.sc-email-input:focus{border-color:#58a6ff}',
    '.sc-email-input::placeholder{color:#484f58}',
    '.sc-email-btn{padding:10px 20px;background:linear-gradient(135deg,#58a6ff,#388bfd);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.25s;white-space:nowrap}',
    '.sc-email-btn:hover{transform:scale(1.03);box-shadow:0 4px 16px rgba(88,166,255,0.35)}',
    '.sc-email-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none}',

    '.sc-email-success{text-align:center;padding:12px 0}',
    '.sc-email-success .sc-check{font-size:32px;margin-bottom:8px}',
    '.sc-email-success p{color:#39d353;font-weight:700;font-size:14px}',
    '.sc-email-success small{color:#8b949e;font-size:11px}',

    '.sc-email-perks{display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap}',
    '.sc-email-perk{font-size:11px;color:#8b949e;display:flex;align-items:center;gap:4px}',
    '.sc-email-perk::before{content:"\\2713";color:#39d353;font-weight:800;font-size:10px}',

    '@media(max-width:480px){',
    '  .sc-email-widget{bottom:10px;right:10px;width:calc(100vw - 20px)}',
    '  .sc-email-form{flex-direction:column}',
    '  .sc-email-btn{width:100%}',
    '  .sc-email-perks{gap:8px}',
    '}'
  ].join('\n');
  document.head.appendChild(css);

  // Build the widget
  var widget = document.createElement('div');
  widget.className = 'sc-email-widget';
  widget.style.display = 'none'; // Hidden until timer fires
  widget.innerHTML =
    '<div class="sc-email-card">' +
      '<button class="sc-email-close" aria-label="Close">&times;</button>' +
      '<div class="sc-email-icon">&#128231;</div>' +
      '<h3>Get <span>free ebooks</span> + tool updates</h3>' +
      '<p>Join our newsletter. New tools, guides, and ebooks delivered to your inbox. No spam, ever.</p>' +
      '<div class="sc-email-perks">' +
        '<span class="sc-email-perk">Free ebooks</span>' +
        '<span class="sc-email-perk">New tool alerts</span>' +
        '<span class="sc-email-perk">Exclusive tips</span>' +
      '</div>' +
      '<form class="sc-email-form" autocomplete="on">' +
        '<input type="email" class="sc-email-input" placeholder="your@email.com" required autocomplete="email" aria-label="Email address">' +
        '<button type="submit" class="sc-email-btn">Subscribe</button>' +
      '</form>' +
    '</div>';

  document.body.appendChild(widget);

  function closeWidget() {
    widget.classList.add('sc-hidden');
    lsSet('session_shown', '1');
    track('email_capture_dismiss', 'closed');
    setTimeout(function () { widget.remove(); }, 500);
  }

  widget.querySelector('.sc-email-close').addEventListener('click', closeWidget);

  // Form submission
  widget.querySelector('.sc-email-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = widget.querySelector('.sc-email-input');
    var btn = widget.querySelector('.sc-email-btn');
    var email = input.value.trim();

    if (!email || !email.includes('@')) return;

    btn.disabled = true;
    btn.textContent = 'Subscribing...';

    track('email_capture_submit', email.split('@')[1]); // Track domain only for privacy

    // Open Beehiiv subscription in background (new tab approach for simplicity)
    var beehiivUrl = BEEHIIV_EMBED_URL + '?email=' + encodeURIComponent(email);

    // Use a hidden iframe to submit without leaving the page
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute';
    iframe.src = beehiivUrl;
    document.body.appendChild(iframe);

    // Show success state
    setTimeout(function () {
      widget.querySelector('.sc-email-card').innerHTML =
        '<div class="sc-email-success">' +
          '<div class="sc-check">&#9989;</div>' +
          '<p>You\'re in! Check your inbox.</p>' +
          '<small>Free ebooks and tool updates on the way.</small>' +
        '</div>';
      lsSet('subscribed', '1');
      lsSet('session_shown', '1');
      track('email_capture_success', 'subscribed');

      // Auto-dismiss after 4s
      setTimeout(closeWidget, 4000);
    }, 1500);
  });

  // Show widget after delay
  setTimeout(function () {
    if (lsGet('session_shown')) return;
    widget.style.display = 'block';
    track('email_capture_view', 'shown');
  }, SHOW_DELAY);

})();
