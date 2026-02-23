/**
 * SPUNK.CODES — Sales & Conversion Optimization Banner
 * =====================================================
 * Drop-in script for any page. Adds:
 *   1. Top announcement banner (lifetime deal)
 *   2. Bottom sticky CTA bar (upgrade to pro + email capture)
 *   3. Exit-intent popup (50% off + free ebooks email option)
 *
 * All dismissals persist in localStorage.
 * GA4 events fired on every interaction.
 * Zero external dependencies.
 *
 * Usage:
 *   <script src="/sales-banner.js"></script>
 *   — or —
 *   <script src="https://spunk.codes/sales-banner.js"></script>
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────
  var LS_PREFIX = 'sc_sales_';
  var PRICING_URL = '/pricing.html';
  var STORE_URL = '/store.html';
  var LEAD_MAGNET_URL = '/lead-magnet.html';
  var NEWSLETTER_URL = '/newsletter.html';
  var BEEHIIV_ACTION = 'https://embeds.beehiiv.com/subscribe';
  var GA4_ID = 'G-GVNL11PEGP';
  var isSubscribed = false;
  try { isSubscribed = localStorage.getItem('sc_ecw_subscribed') === '1'; } catch(e) {}

  // localStorage helpers
  function lsGet(k) { try { return localStorage.getItem(LS_PREFIX + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(LS_PREFIX + k, v); } catch (e) {} }

  // GA4 event helper (fires if gtag is present)
  function track(action, label) {
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: 'sales_banner',
        event_label: label || ''
      });
    }
  }

  // Inject global styles once
  var style = document.createElement('style');
  style.textContent = [
    '/* ── Sales Banner Globals ── */',

    /* Keyframes */
    '@keyframes scSlideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}',
    '@keyframes scSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}',
    '@keyframes scFadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}',
    '@keyframes scPulse{0%,100%{box-shadow:0 0 0 0 rgba(88,166,255,0.4)}50%{box-shadow:0 0 0 8px rgba(88,166,255,0)}}',

    /* Top banner */
    '.sc-top-banner{position:fixed;top:0;left:0;right:0;z-index:10000;background:linear-gradient(90deg,#1a1e2e 0%,#0d1117 50%,#1a1e2e 100%);border-bottom:1px solid rgba(88,166,255,0.2);padding:10px 20px;display:flex;align-items:center;justify-content:center;gap:12px;font-family:system-ui,-apple-system,sans-serif;animation:scSlideDown 0.5s ease;box-shadow:0 4px 20px rgba(0,0,0,0.5)}',
    '.sc-top-banner.sc-hidden{transform:translateY(-100%);opacity:0;pointer-events:none;transition:all 0.4s ease}',
    '.sc-top-banner-text{color:#e6edf3;font-size:14px;font-weight:600;letter-spacing:0.2px}',
    '.sc-top-banner-text span{background:linear-gradient(135deg,#58a6ff,#39d353);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800}',
    '.sc-top-banner-cta{display:inline-flex;align-items:center;gap:6px;padding:6px 18px;background:linear-gradient(135deg,#58a6ff,#388bfd);color:#fff;border:none;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.25s;text-decoration:none;white-space:nowrap}',
    '.sc-top-banner-cta:hover{transform:scale(1.05);box-shadow:0 4px 20px rgba(88,166,255,0.4)}',
    '.sc-top-banner-close{background:none;border:none;color:#8b949e;font-size:20px;cursor:pointer;padding:4px 8px;line-height:1;transition:color 0.2s;flex-shrink:0}',
    '.sc-top-banner-close:hover{color:#fff}',

    /* Bottom sticky CTA */
    '.sc-bottom-bar{position:fixed;bottom:0;left:0;right:0;z-index:10000;background:rgba(13,17,23,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(88,166,255,0.15);padding:12px 24px;display:flex;align-items:center;justify-content:center;gap:16px;font-family:system-ui,-apple-system,sans-serif;animation:scSlideUp 0.5s ease 1s both;box-shadow:0 -4px 30px rgba(0,0,0,0.4)}',
    '.sc-bottom-bar.sc-hidden{transform:translateY(100%);opacity:0;pointer-events:none;transition:all 0.4s ease}',
    '.sc-bottom-bar-text{color:#8b949e;font-size:13px}',
    '.sc-bottom-bar-text strong{color:#e6edf3}',
    '.sc-bottom-bar-cta{display:inline-flex;align-items:center;gap:6px;padding:8px 24px;background:linear-gradient(135deg,#39d353,#2ea043);color:#fff;border:none;border-radius:20px;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.25s;text-decoration:none;animation:scPulse 2s infinite 3s}',
    '.sc-bottom-bar-cta:hover{transform:scale(1.05);box-shadow:0 4px 20px rgba(57,211,83,0.4)}',
    '.sc-bottom-bar-close{background:none;border:none;color:#484f58;font-size:18px;cursor:pointer;padding:4px 8px;line-height:1;transition:color 0.2s}',
    '.sc-bottom-bar-close:hover{color:#fff}',

    /* Exit-intent popup */
    '.sc-exit-overlay{position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s ease}',
    '.sc-exit-overlay.sc-visible{opacity:1;pointer-events:auto}',
    '.sc-exit-popup{background:linear-gradient(145deg,#161b22,#0d1117);border:1px solid rgba(88,166,255,0.25);border-radius:20px;padding:40px 36px;max-width:440px;width:90%;text-align:center;animation:scFadeIn 0.4s ease;box-shadow:0 20px 60px rgba(0,0,0,0.6),0 0 40px rgba(88,166,255,0.08)}',
    '.sc-exit-popup h2{color:#e6edf3;font-size:24px;font-weight:800;margin-bottom:8px;line-height:1.2}',
    '.sc-exit-popup h2 span{background:linear-gradient(135deg,#58a6ff,#39d353);-webkit-background-clip:text;-webkit-text-fill-color:transparent}',
    '.sc-exit-popup p{color:#8b949e;font-size:14px;margin-bottom:24px;line-height:1.6}',
    '.sc-exit-popup-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 32px;background:linear-gradient(135deg,#58a6ff,#388bfd);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.25s;text-decoration:none}',
    '.sc-exit-popup-cta:hover{transform:scale(1.05);box-shadow:0 8px 30px rgba(88,166,255,0.35)}',
    '.sc-exit-popup-skip{display:block;margin-top:16px;color:#484f58;font-size:12px;cursor:pointer;background:none;border:none;transition:color 0.2s}',
    '.sc-exit-popup-skip:hover{color:#8b949e}',
    '.sc-exit-badge{display:inline-block;padding:4px 14px;background:rgba(57,211,83,0.1);border:1px solid rgba(57,211,83,0.25);border-radius:20px;font-size:12px;font-weight:700;color:#39d353;margin-bottom:16px;letter-spacing:0.5px}',

    /* Bottom bar email CTA */
    '.sc-bottom-bar-email{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;background:rgba(88,166,255,0.12);border:1px solid rgba(88,166,255,0.25);color:#58a6ff;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.25s;text-decoration:none;white-space:nowrap}',
    '.sc-bottom-bar-email:hover{background:rgba(88,166,255,0.2);border-color:#58a6ff;transform:scale(1.03)}',
    '.sc-bottom-bar-divider{color:#30363d;font-size:12px;user-select:none}',

    /* Exit popup email section */
    '.sc-exit-divider{display:flex;align-items:center;gap:12px;margin:20px 0 16px;color:#484f58;font-size:12px}',
    '.sc-exit-divider::before,.sc-exit-divider::after{content:"";flex:1;height:1px;background:#30363d}',
    '.sc-exit-email-section{text-align:center}',
    '.sc-exit-email-label{color:#8b949e;font-size:13px;margin-bottom:10px;display:block}',
    '.sc-exit-email-form{display:flex;gap:8px;max-width:360px;margin:0 auto}',
    '.sc-exit-email-input{flex:1;padding:10px 14px;background:rgba(13,17,23,0.8);border:1px solid #30363d;border-radius:10px;color:#e6edf3;font-size:14px;outline:none;font-family:system-ui,-apple-system,sans-serif;transition:border-color 0.2s}',
    '.sc-exit-email-input:focus{border-color:#58a6ff}',
    '.sc-exit-email-input::placeholder{color:#484f58}',
    '.sc-exit-email-btn{padding:10px 18px;background:linear-gradient(135deg,#39d353,#2ea043);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.25s;white-space:nowrap;font-family:system-ui,-apple-system,sans-serif}',
    '.sc-exit-email-btn:hover{transform:scale(1.03);box-shadow:0 4px 16px rgba(57,211,83,0.3)}',
    '.sc-exit-email-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none}',
    '.sc-exit-email-success{color:#39d353;font-size:14px;font-weight:700;padding:8px 0}',
    '.sc-exit-email-trust{font-size:11px;color:#484f58;margin-top:8px}',

    /* Mobile */
    '@media(max-width:640px){',
    '  .sc-top-banner{flex-wrap:wrap;gap:8px;padding:8px 14px;text-align:center}',
    '  .sc-top-banner-text{font-size:12px}',
    '  .sc-bottom-bar{flex-wrap:wrap;gap:8px;padding:10px 14px}',
    '  .sc-bottom-bar-text{font-size:11px;text-align:center;width:100%}',
    '  .sc-bottom-bar-email{font-size:11px;padding:6px 14px}',
    '  .sc-exit-popup{padding:28px 20px}',
    '  .sc-exit-popup h2{font-size:20px}',
    '  .sc-exit-email-form{flex-direction:column}',
    '  .sc-exit-email-btn{width:100%}',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // ── 1. Top Announcement Banner ──────────────────────────
  if (!lsGet('top_dismissed')) {
    var banner = document.createElement('div');
    banner.className = 'sc-top-banner';
    banner.innerHTML =
      '<span class="sc-top-banner-text">Get all <span>200+ tools + 20 ebooks</span> for <span>$99 lifetime</span></span>' +
      '<a href="' + PRICING_URL + '" class="sc-top-banner-cta" onclick="return !1">Claim Deal &rarr;</a>' +
      '<button class="sc-top-banner-close" aria-label="Dismiss">&times;</button>';
    document.body.prepend(banner);

    var topCta = banner.querySelector('.sc-top-banner-cta');
    topCta.addEventListener('click', function (e) {
      e.preventDefault();
      track('sales_banner_click', 'top_lifetime_deal');
      window.location.href = PRICING_URL;
    });

    banner.querySelector('.sc-top-banner-close').addEventListener('click', function () {
      banner.classList.add('sc-hidden');
      lsSet('top_dismissed', '1');
      track('sales_banner_dismiss', 'top_banner');
      // Remove from DOM after animation
      setTimeout(function () { banner.remove(); }, 500);
    });

    track('sales_banner_view', 'top_banner');
  }

  // ── 2. Bottom Sticky CTA Bar ────────────────────────────
  if (!lsGet('bottom_dismissed')) {
    var bar = document.createElement('div');
    bar.className = 'sc-bottom-bar';
    bar.innerHTML =
      '<span class="sc-bottom-bar-text"><strong>Free tools.</strong> Want premium ebooks, priority support & lifetime access?</span>' +
      '<a href="' + PRICING_URL + '" class="sc-bottom-bar-cta" onclick="return !1">Upgrade to Pro</a>' +
      (isSubscribed ? '' :
        '<span class="sc-bottom-bar-divider">or</span>' +
        '<a href="' + LEAD_MAGNET_URL + '" class="sc-bottom-bar-email" onclick="return !1">Get 5 Free Ebooks</a>'
      ) +
      '<button class="sc-bottom-bar-close" aria-label="Dismiss">&times;</button>';
    document.body.appendChild(bar);

    var bottomCta = bar.querySelector('.sc-bottom-bar-cta');
    bottomCta.addEventListener('click', function (e) {
      e.preventDefault();
      track('sales_banner_click', 'bottom_upgrade_pro');
      window.location.href = PRICING_URL;
    });

    var bottomEmailCta = bar.querySelector('.sc-bottom-bar-email');
    if (bottomEmailCta) {
      bottomEmailCta.addEventListener('click', function (e) {
        e.preventDefault();
        track('sales_banner_click', 'bottom_free_ebooks');
        window.location.href = LEAD_MAGNET_URL;
      });
    }

    bar.querySelector('.sc-bottom-bar-close').addEventListener('click', function () {
      bar.classList.add('sc-hidden');
      lsSet('bottom_dismissed', '1');
      track('sales_banner_dismiss', 'bottom_bar');
      setTimeout(function () { bar.remove(); }, 500);
    });

    track('sales_banner_view', 'bottom_bar');
  }

  // ── 3. Exit Intent Popup ────────────────────────────────
  if (!lsGet('exit_dismissed')) {
    var overlay = document.createElement('div');
    overlay.className = 'sc-exit-overlay';
    overlay.innerHTML =
      '<div class="sc-exit-popup">' +
        '<div class="sc-exit-badge">LIMITED TIME</div>' +
        '<h2>Wait! Get <span>50% off</span> your first purchase</h2>' +
        '<p>All 200+ tools stay free forever. Unlock 20 premium ebooks, priority support, and lifetime updates — half price, just this once.</p>' +
        '<a href="' + PRICING_URL + '?discount=HALFOFF" class="sc-exit-popup-cta" onclick="return !1">Claim 50% Off &rarr;</a>' +
        (isSubscribed ? '' :
          '<div class="sc-exit-divider">or get free stuff</div>' +
          '<div class="sc-exit-email-section">' +
            '<span class="sc-exit-email-label">Get 5 free ebooks + weekly tool drops</span>' +
            '<form class="sc-exit-email-form" id="scExitEmailForm" autocomplete="on">' +
              '<input type="email" class="sc-exit-email-input" placeholder="your@email.com" required autocomplete="email" aria-label="Email address">' +
              '<button type="submit" class="sc-exit-email-btn">Get Free Ebooks</button>' +
            '</form>' +
            '<div class="sc-exit-email-trust">Free. No spam. Unsubscribe anytime.</div>' +
          '</div>'
        ) +
        '<button class="sc-exit-popup-skip">No thanks, I\'ll stick with free</button>' +
      '</div>';
    document.body.appendChild(overlay);

    var exitShown = false;

    function showExitPopup() {
      if (exitShown) return;
      exitShown = true;
      overlay.classList.add('sc-visible');
      track('sales_banner_view', 'exit_intent_popup');
    }

    function hideExitPopup() {
      overlay.classList.remove('sc-visible');
      lsSet('exit_dismissed', '1');
      track('sales_banner_dismiss', 'exit_intent_popup');
    }

    // Desktop: mouse leaves viewport from top
    document.addEventListener('mouseout', function (e) {
      if (e.clientY <= 0 && !exitShown) {
        showExitPopup();
      }
    });

    // Mobile fallback: show after 60 seconds of being on the page
    setTimeout(function () {
      if (!exitShown && !lsGet('exit_dismissed')) {
        showExitPopup();
      }
    }, 60000);

    // CTA click
    overlay.querySelector('.sc-exit-popup-cta').addEventListener('click', function (e) {
      e.preventDefault();
      track('sales_banner_click', 'exit_intent_cta');
      hideExitPopup();
      window.location.href = PRICING_URL + '?discount=HALFOFF';
    });

    // Email form in exit popup
    var exitEmailForm = document.getElementById('scExitEmailForm');
    if (exitEmailForm) {
      exitEmailForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = this.querySelector('.sc-exit-email-input');
        var btn = this.querySelector('.sc-exit-email-btn');
        var email = input.value.trim();
        if (!email || email.indexOf('@') === -1) return;

        btn.disabled = true;
        btn.textContent = 'Subscribing...';

        track('sales_banner_email_submit', 'exit_intent_email');

        // Submit to Beehiiv via hidden iframe
        var iframe = document.createElement('iframe');
        iframe.name = 'sc_exit_beehiiv';
        iframe.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute';
        document.body.appendChild(iframe);

        var bForm = document.createElement('form');
        bForm.method = 'POST';
        bForm.action = BEEHIIV_ACTION;
        bForm.target = 'sc_exit_beehiiv';
        bForm.style.display = 'none';

        var emailField = document.createElement('input');
        emailField.type = 'hidden';
        emailField.name = 'email';
        emailField.value = email;
        bForm.appendChild(emailField);

        document.body.appendChild(bForm);
        bForm.submit();

        setTimeout(function () {
          bForm.remove();
          var section = overlay.querySelector('.sc-exit-email-section');
          if (section) {
            section.innerHTML = '<div class="sc-exit-email-success">&#10003; You\'re in! Check your inbox for 5 free ebooks.</div>';
          }
          try {
            localStorage.setItem('sc_ecw_subscribed', '1');
            localStorage.setItem('sc_ecw_subscriber_email', email);
          } catch(ex) {}
          track('sales_banner_email_success', 'exit_intent_email');

          // Hide the bottom bar email CTA if visible
          var bottomEmail = document.querySelector('.sc-bottom-bar-email');
          var bottomDivider = document.querySelector('.sc-bottom-bar-divider');
          if (bottomEmail) bottomEmail.style.display = 'none';
          if (bottomDivider) bottomDivider.style.display = 'none';

          // Auto-close after 3s
          setTimeout(hideExitPopup, 3000);
        }, 1500);
      });
    }

    // Skip / close
    overlay.querySelector('.sc-exit-popup-skip').addEventListener('click', hideExitPopup);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hideExitPopup();
    });
  }

})();
