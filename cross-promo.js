/**
 * spunk.codes Cross-Promotion Script v2.0
 * Drop into any site: <script src="https://spunk.codes/cross-promo.js"></script>
 *
 * Features:
 *   1. Top banner (44px) — slides down after 2s, dismissible for 24h
 *   2. Bottom-right floating card — appears after 20s, dismissible for 3 days
 *   3. Exit-intent popup — fires once per session when mouse leaves viewport top
 *   4. SPUNK coupon code integration — special offer banner when code is activated
 *   5. GA4 event tracking when gtag() is available
 *
 * Self-contained — zero external dependencies, zero layout conflicts.
 * All classes prefixed with sc-promo- to avoid collisions.
 */
(function () {
  'use strict';

  // Don't run on spunk.codes itself
  if (location.hostname === 'spunk.codes' || location.hostname === 'www.spunk.codes') return;

  // ── CONFIG ───────────────────────────────────────────────────────────
  var BASE_URL = 'https://spunk.codes';
  var REF = '?ref=cross-promo';
  var LINK = BASE_URL + REF;
  var COUPON_LINK = BASE_URL + '/checkout?coupon=SPUNK';

  // ── HELPERS ──────────────────────────────────────────────────────────
  function track(action, label) {
    try {
      if (typeof gtag === 'function') {
        gtag('event', action, {
          event_category: 'cross_promo',
          event_label: label,
          transport_type: 'beacon'
        });
      }
    } catch (e) { /* silent */ }
  }

  function isDismissed(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return false;
      return Date.now() < parseInt(raw, 10);
    } catch (e) { return false; }
  }

  function setDismissed(key, hours) {
    try {
      localStorage.setItem(key, String(Date.now() + hours * 3600000));
    } catch (e) { /* quota */ }
  }

  function isSpunkCodeActive() {
    try {
      return localStorage.getItem('spunk_code_used') === 'true';
    } catch (e) { return false; }
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'style' && typeof attrs[k] === 'object') {
          Object.keys(attrs[k]).forEach(function (s) { node.style[s] = attrs[k][s]; });
        } else if (k === 'className') {
          node.className = attrs[k];
        } else if (k.indexOf('on') === 0) {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    if (children) {
      if (typeof children === 'string') {
        node.innerHTML = children;
      } else if (Array.isArray(children)) {
        children.forEach(function (c) { if (c) node.appendChild(c); });
      }
    }
    return node;
  }

  // ── INJECT STYLES ────────────────────────────────────────────────────
  var styleSheet = document.createElement('style');
  styleSheet.id = 'sc-promo-styles';
  styleSheet.textContent = [
    // Animations
    '@keyframes sc-slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}',
    '@keyframes sc-fadeUp{from{transform:translateY(24px) scale(0.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}',
    '@keyframes sc-fadeIn{from{opacity:0}to{opacity:1}}',
    '@keyframes sc-popIn{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}',
    '@keyframes sc-glow{0%,100%{box-shadow:0 0 8px rgba(88,166,255,0.3)}50%{box-shadow:0 0 20px rgba(88,166,255,0.5)}}',
    '@keyframes sc-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}',

    // Shared button
    '.sc-promo-btn{' +
      'display:inline-block;' +
      'background:linear-gradient(135deg,#58a6ff,#388bfd);' +
      'color:#fff !important;' +
      'border:none;' +
      'padding:8px 20px;' +
      'border-radius:8px;' +
      'font-weight:700;' +
      'font-size:13px;' +
      'cursor:pointer;' +
      'text-decoration:none !important;' +
      'transition:all 0.25s ease;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
      'line-height:1.4;' +
      'letter-spacing:0.01em;' +
      'box-shadow:0 2px 8px rgba(56,139,253,0.3)' +
    '}',
    '.sc-promo-btn:hover{' +
      'background:linear-gradient(135deg,#79b8ff,#58a6ff);' +
      'transform:translateY(-1px);' +
      'box-shadow:0 4px 16px rgba(56,139,253,0.4)' +
    '}',
    '.sc-promo-btn:active{transform:translateY(0);box-shadow:0 1px 4px rgba(56,139,253,0.3)}',

    // Secondary button
    '.sc-promo-btn-secondary{' +
      'display:inline-block;' +
      'background:transparent;' +
      'color:#8b949e !important;' +
      'border:1px solid #30363d;' +
      'padding:8px 20px;' +
      'border-radius:8px;' +
      'font-weight:600;' +
      'font-size:13px;' +
      'cursor:pointer;' +
      'text-decoration:none !important;' +
      'transition:all 0.25s ease;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
      'line-height:1.4' +
    '}',
    '.sc-promo-btn-secondary:hover{color:#c9d1d9 !important;border-color:#484f58;background:rgba(110,118,129,0.1)}',

    // Close button
    '.sc-promo-close{' +
      'background:none;' +
      'border:none;' +
      'color:#484f58;' +
      'font-size:20px;' +
      'cursor:pointer;' +
      'padding:4px 8px;' +
      'line-height:1;' +
      'transition:color 0.2s;' +
      'font-family:-apple-system,sans-serif' +
    '}',
    '.sc-promo-close:hover{color:#c9d1d9}',

    // Mobile responsive
    '@media(max-width:640px){' +
      '#sc-promo-banner{font-size:11px !important;height:auto !important;min-height:44px;padding:8px 40px 8px 12px !important;flex-wrap:wrap}' +
      '#sc-promo-banner .sc-promo-btn{font-size:11px !important;padding:4px 10px !important}' +
      '#sc-promo-card{width:260px !important;right:10px !important;bottom:10px !important;padding:16px !important}' +
      '#sc-promo-exit-modal{width:92vw !important;padding:24px 20px !important}' +
    '}'
  ].join('\n');
  document.head.appendChild(styleSheet);

  // ── 1. TOP BANNER ────────────────────────────────────────────────────
  function createTopBanner() {
    if (isDismissed('sc_banner_dismissed')) return;

    var banner = el('div', {
      id: 'sc-promo-banner',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '99999',
        height: '44px',
        background: '#0d1117',
        borderBottom: '2px solid transparent',
        borderImage: 'linear-gradient(90deg, #58a6ff, #3fb950, #58a6ff) 1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
        fontSize: '13px',
        color: '#e6edf3',
        boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
        animation: 'sc-slideDown 0.5s ease both',
        padding: '0 48px 0 16px',
        boxSizing: 'border-box'
      }
    });

    // Text
    var text = el('span', {
      style: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, '\uD83D\uDE80 300+ Free Developer Tools & 22 Ebooks \u2192 <strong style="color:#58a6ff">spunk.codes</strong>');

    // CTA button
    var cta = el('a', {
      href: LINK,
      target: '_blank',
      rel: 'noopener',
      className: 'sc-promo-btn',
      style: {
        padding: '4px 14px',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        flexShrink: '0'
      },
      onClick: function () { track('xpromo_click', 'top_banner'); }
    }, 'Get Free Tools \u2192');

    // Close button
    var close = el('button', {
      className: 'sc-promo-close',
      'aria-label': 'Dismiss',
      style: {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '22px'
      },
      onClick: function () {
        banner.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
        banner.style.transform = 'translateY(-100%)';
        banner.style.opacity = '0';
        setDismissed('sc_banner_dismissed', 24);
        track('xpromo_dismiss', 'top_banner');
        // Remove push-down
        if (spacer && spacer.parentNode) spacer.parentNode.removeChild(spacer);
        setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 400);
      }
    }, '\u00D7');

    banner.appendChild(text);
    banner.appendChild(cta);
    banner.appendChild(close);

    // Spacer to push page content down
    var spacer = el('div', {
      id: 'sc-promo-spacer',
      style: {
        height: '44px',
        transition: 'height 0.35s ease'
      }
    });

    // Insert at top of body
    if (document.body.firstChild) {
      document.body.insertBefore(spacer, document.body.firstChild);
    } else {
      document.body.appendChild(spacer);
    }
    document.body.appendChild(banner);

    track('xpromo_view', 'top_banner');
  }

  // ── 2. FLOATING CARD ─────────────────────────────────────────────────
  function createFloatingCard() {
    if (isDismissed('sc_card_dismissed')) return;

    var card = el('div', {
      id: 'sc-promo-card',
      style: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '99998',
        width: '280px',
        background: 'rgba(13,17,23,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(88,166,255,0.15)',
        borderRadius: '16px',
        padding: '20px',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
        color: '#e6edf3',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 1px rgba(88,166,255,0.2)',
        animation: 'sc-fadeUp 0.5s ease both'
      }
    });

    // Close
    var closeBtn = el('button', {
      className: 'sc-promo-close',
      'aria-label': 'Close',
      style: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        fontSize: '18px'
      },
      onClick: function () {
        card.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
        card.style.transform = 'translateY(20px) scale(0.95)';
        card.style.opacity = '0';
        setDismissed('sc_card_dismissed', 72); // 3 days
        track('xpromo_dismiss', 'floating_card');
        setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 400);
      }
    }, '\u00D7');

    // Icon area
    var iconArea = el('div', {
      style: {
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(88,166,255,0.15), rgba(63,185,80,0.15))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        marginBottom: '12px'
      }
    }, '\uD83D\uDEE0\uFE0F');

    // Headline
    var headline = el('div', {
      style: {
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '6px',
        lineHeight: '1.3',
        color: '#e6edf3'
      }
    }, 'Free Tools for Builders');

    // Subline
    var subline = el('div', {
      style: {
        fontSize: '13px',
        color: '#8b949e',
        marginBottom: '16px',
        lineHeight: '1.45'
      }
    }, '300+ tools, 22 ebooks, 75 premium tools. No signup required.');

    // CTA
    var cardCta = el('a', {
      href: LINK,
      target: '_blank',
      rel: 'noopener',
      className: 'sc-promo-btn',
      style: {
        display: 'block',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
        animation: 'sc-glow 3s ease-in-out infinite'
      },
      onClick: function () { track('xpromo_click', 'floating_card'); }
    }, 'Visit spunk.codes \u2192');

    card.appendChild(closeBtn);
    card.appendChild(iconArea);
    card.appendChild(headline);
    card.appendChild(subline);
    card.appendChild(cardCta);
    document.body.appendChild(card);

    track('xpromo_view', 'floating_card');
  }

  // ── 3. EXIT INTENT POPUP ─────────────────────────────────────────────
  function createExitIntent() {
    try {
      if (sessionStorage.getItem('sc_exit_shown')) return;
    } catch (e) { return; }

    var fired = false;

    function onLeave(e) {
      if (fired) return;
      if (e.clientY > 5) return;
      fired = true;
      try { sessionStorage.setItem('sc_exit_shown', '1'); } catch (ex) { /* ok */ }
      document.removeEventListener('mouseout', onLeave);
      showPopup();
    }

    document.addEventListener('mouseout', onLeave);

    function showPopup() {
      // Overlay
      var overlay = el('div', {
        id: 'sc-promo-exit-overlay',
        style: {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          zIndex: '100000',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'sc-fadeIn 0.3s ease both',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        onClick: function (e) {
          if (e.target === overlay) closePopup();
        }
      });

      // Modal
      var modal = el('div', {
        id: 'sc-promo-exit-modal',
        style: {
          position: 'relative',
          width: '420px',
          maxWidth: '92vw',
          background: 'rgba(13,17,23,0.95)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(88,166,255,0.2)',
          borderRadius: '20px',
          padding: '36px 32px',
          textAlign: 'center',
          fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
          color: '#e6edf3',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 1px rgba(88,166,255,0.3)',
          animation: 'sc-popIn 0.35s ease both'
        }
      });

      // Close X
      var closeX = el('button', {
        className: 'sc-promo-close',
        'aria-label': 'Close',
        style: {
          position: 'absolute',
          top: '14px',
          right: '14px',
          fontSize: '24px'
        },
        onClick: function () { closePopup(); }
      }, '\u00D7');

      // Wave emoji
      var emoji = el('div', {
        style: { fontSize: '36px', marginBottom: '12px' }
      }, '\uD83D\uDC4B');

      // Headline
      var headlineEl = el('div', {
        style: {
          fontSize: '22px',
          fontWeight: '800',
          marginBottom: '10px',
          lineHeight: '1.3',
          letterSpacing: '-0.01em'
        }
      }, 'Before You Go...');

      // Description
      var desc = el('div', {
        style: {
          fontSize: '14px',
          color: '#8b949e',
          marginBottom: '18px',
          lineHeight: '1.6',
          maxWidth: '340px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }
      }, 'Get <strong style="color:#e6edf3">300+ free tools</strong> for developers, creators & founders at <strong style="color:#58a6ff">spunk.codes</strong>');

      // No signup badge
      var badge = el('div', {
        style: {
          display: 'inline-block',
          background: 'rgba(63,185,80,0.12)',
          border: '1px solid rgba(63,185,80,0.3)',
          borderRadius: '100px',
          padding: '4px 14px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#3fb950',
          marginBottom: '24px',
          letterSpacing: '0.02em'
        }
      }, '\u2713 No sign-up required');

      // Primary CTA
      var primaryBtn = el('a', {
        href: LINK,
        target: '_blank',
        rel: 'noopener',
        className: 'sc-promo-btn',
        style: {
          fontSize: '15px',
          padding: '12px 32px',
          display: 'inline-block'
        },
        onClick: function () {
          track('xpromo_click', 'exit_intent');
          closePopup();
        }
      }, 'Browse Free Tools \u2192');

      // Secondary CTA
      var secondaryBtn = el('button', {
        className: 'sc-promo-btn-secondary',
        style: {
          display: 'block',
          margin: '12px auto 0',
          fontSize: '12px',
          padding: '6px 16px',
          border: 'none',
          color: '#484f58',
          background: 'none',
          cursor: 'pointer'
        },
        onClick: function () { closePopup(); }
      }, 'Maybe Later');

      modal.appendChild(closeX);
      modal.appendChild(emoji);
      modal.appendChild(headlineEl);
      modal.appendChild(desc);
      modal.appendChild(badge);
      modal.appendChild(primaryBtn);
      modal.appendChild(secondaryBtn);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      track('xpromo_view', 'exit_intent');

      // Escape key
      function onEsc(e) {
        if (e.key === 'Escape') {
          closePopup();
          document.removeEventListener('keydown', onEsc);
        }
      }
      document.addEventListener('keydown', onEsc);

      function closePopup() {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        track('xpromo_dismiss', 'exit_intent');
        setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 350);
        document.removeEventListener('keydown', onEsc);
      }
    }
  }

  // ── 4. SPUNK CODE SPECIAL OFFER ──────────────────────────────────────
  function createSpunkCodeBanner() {
    if (!isSpunkCodeActive()) return;
    if (isDismissed('sc_spunk_offer_dismissed')) return;

    // Don't show if top banner is also visible — stagger it
    var existingBanner = document.getElementById('sc-promo-banner');
    var topOffset = existingBanner ? '54px' : '0';

    var offerBar = el('div', {
      id: 'sc-promo-spunk-offer',
      style: {
        position: 'fixed',
        top: topOffset,
        left: '0',
        right: '0',
        zIndex: '99998',
        height: '40px',
        background: 'linear-gradient(135deg, #0d1117, #0d2818)',
        borderBottom: '2px solid transparent',
        borderImage: 'linear-gradient(90deg, #3fb950, #58a6ff, #3fb950) 1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
        fontSize: '13px',
        color: '#e6edf3',
        animation: 'sc-slideDown 0.5s ease both',
        padding: '0 48px 0 16px',
        boxSizing: 'border-box'
      }
    });

    var offerText = el('span', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, '\u2728 <strong style="color:#3fb950">SPUNK code activated!</strong> Get 15% off all premium tools');

    var offerCta = el('a', {
      href: COUPON_LINK,
      target: '_blank',
      rel: 'noopener',
      className: 'sc-promo-btn',
      style: {
        padding: '4px 14px',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        flexShrink: '0',
        background: 'linear-gradient(135deg, #3fb950, #2ea043)'
      },
      onClick: function () { track('xpromo_click', 'spunk_offer'); }
    }, 'Claim Discount \u2192');

    var offerClose = el('button', {
      className: 'sc-promo-close',
      'aria-label': 'Dismiss',
      style: {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '20px'
      },
      onClick: function () {
        offerBar.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
        offerBar.style.transform = 'translateY(-100%)';
        offerBar.style.opacity = '0';
        setDismissed('sc_spunk_offer_dismissed', 168); // 7 days
        track('xpromo_dismiss', 'spunk_offer');
        setTimeout(function () { if (offerBar.parentNode) offerBar.parentNode.removeChild(offerBar); }, 400);
      }
    }, '\u00D7');

    offerBar.appendChild(offerText);
    offerBar.appendChild(offerCta);
    offerBar.appendChild(offerClose);
    document.body.appendChild(offerBar);

    track('xpromo_view', 'spunk_offer');
  }

  // ── SPUNK CODE LISTENER ──────────────────────────────────────────────
  // Listen for the SPUNK code being entered anywhere on the page
  // Activates if user types "SPUNK" in any input or via a global key sequence
  function initSpunkCodeListener() {
    var buffer = '';
    var KEYWORD = 'SPUNK';

    document.addEventListener('keydown', function (e) {
      // Only track letter keys
      if (e.key.length !== 1) {
        if (e.key === 'Backspace') buffer = '';
        return;
      }
      buffer += e.key.toUpperCase();
      // Keep only last 5 characters
      if (buffer.length > KEYWORD.length) {
        buffer = buffer.slice(-KEYWORD.length);
      }
      if (buffer === KEYWORD) {
        buffer = '';
        try {
          localStorage.setItem('spunk_code_used', 'true');
        } catch (ex) { /* ok */ }
        track('spunk_code', 'activated');
        // Show the offer banner if not already visible
        if (!document.getElementById('sc-promo-spunk-offer')) {
          createSpunkCodeBanner();
        }
      }
    });

    // Also check input/textarea fields for the code
    document.addEventListener('input', function (e) {
      var target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        var val = (target.value || '').toUpperCase();
        if (val.indexOf(KEYWORD) !== -1) {
          try {
            localStorage.setItem('spunk_code_used', 'true');
          } catch (ex) { /* ok */ }
          track('spunk_code', 'activated_input');
          if (!document.getElementById('sc-promo-spunk-offer')) {
            createSpunkCodeBanner();
          }
        }
      }
    });
  }

  // ── INITIALIZATION ───────────────────────────────────────────────────
  function init() {
    // Top banner after 2s
    setTimeout(function () {
      createTopBanner();
      // SPUNK offer banner (below top banner if active)
      setTimeout(createSpunkCodeBanner, 500);
    }, 2000);

    // Floating card after 20s
    setTimeout(createFloatingCard, 20000);

    // Exit intent after 3s (to avoid interfering with page load)
    setTimeout(createExitIntent, 3000);

    // SPUNK code listener — immediate
    initSpunkCodeListener();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
