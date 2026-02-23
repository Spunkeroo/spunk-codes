/**
 * spunk.codes Cross-Promotion Script
 * Drop into any site: <script src="https://spunk.codes/cross-promo.js"></script>
 *
 * Features:
 *   1. Top banner (slim 40px) - slides down after 2s, dismissible for 24h
 *   2. Bottom-right floating card - appears after 15s, dismissible for 3 days
 *   3. Exit-intent popup - fires once per session when mouse leaves viewport top
 *   4. GA4 event tracking when gtag() is available
 *
 * All elements self-contained - zero dependencies, zero layout shift.
 */
(function () {
  'use strict';

  // Don't run on spunk.codes itself
  if (location.hostname === 'spunk.codes' || location.hostname === 'www.spunk.codes') return;

  // ── Helpers ────────────────────────────────────────────────────────────
  var LINK = 'https://spunk.codes/?ref=' + encodeURIComponent(location.hostname);

  function track(action, label) {
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: 'cross_promo',
        event_label: label
      });
    }
  }

  function dismissed(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return false;
      return Date.now() < parseInt(raw, 10);
    } catch (e) { return false; }
  }

  function dismiss(key, hours) {
    try {
      localStorage.setItem(key, String(Date.now() + hours * 3600000));
    } catch (e) { /* quota */ }
  }

  // Inject shared keyframe styles once
  var style = document.createElement('style');
  style.textContent = [
    '@keyframes scPromoSlideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}',
    '@keyframes scPromoFadeUp{from{transform:translateY(20px) scale(0.96);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}',
    '@keyframes scPromoFadeIn{from{opacity:0}to{opacity:1}}',
    '@keyframes scPromoPopIn{from{transform:translate(-50%,-48%) scale(0.92);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}',
    '.sc-promo-btn{display:inline-block;background:#58a6ff;color:#fff !important;border:none;padding:6px 16px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;text-decoration:none !important;transition:background 0.2s,transform 0.15s;font-family:system-ui,-apple-system,sans-serif;line-height:1.4}',
    '.sc-promo-btn:hover{background:#79b8ff;transform:scale(1.04)}',
    '.sc-promo-close{background:none;border:none;color:#8b949e;font-size:20px;cursor:pointer;padding:4px 8px;line-height:1;transition:color 0.2s}',
    '.sc-promo-close:hover{color:#fff}'
  ].join('\n');
  document.head.appendChild(style);

  // ── 1. TOP BANNER ─────────────────────────────────────────────────────
  function createTopBanner() {
    if (dismissed('sc_promo_banner')) return;

    var banner = document.createElement('div');
    banner.id = 'sc-promo-banner';
    banner.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'right:0',
      'z-index:99999',
      'height:40px',
      'background:#0d1117',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'gap:12px',
      'font-family:system-ui,-apple-system,sans-serif',
      'font-size:13px',
      'color:#e6edf3',
      'box-shadow:0 2px 12px rgba(0,0,0,0.4)',
      'animation:scPromoSlideDown 0.5s ease both',
      'animation-delay:2s',
      'border-bottom:1px solid rgba(88,166,255,0.2)',
      'padding:0 12px',
      'box-sizing:border-box'
    ].join(';');

    banner.innerHTML =
      '<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
        '<span style="margin-right:6px">&#9889;</span>' +
        '<span>300+ Free Dev Tools & Ebooks at <strong>spunk.codes</strong></span>' +
      '</span>' +
      '<a href="' + LINK + '&el=banner" target="_blank" rel="noopener" class="sc-promo-btn" ' +
        'style="padding:3px 12px;font-size:12px;white-space:nowrap">' +
        'Check it out &#8594;' +
      '</a>' +
      '<button class="sc-promo-close" aria-label="Dismiss" style="position:absolute;right:8px;top:50%;transform:translateY(-50%)">&times;</button>';

    document.body.appendChild(banner);

    // track view
    track('xpromo_view', 'top_banner');

    // CTA click
    banner.querySelector('.sc-promo-btn').addEventListener('click', function () {
      track('xpromo_click', 'top_banner');
    });

    // dismiss
    banner.querySelector('.sc-promo-close').addEventListener('click', function () {
      banner.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      banner.style.transform = 'translateY(-100%)';
      banner.style.opacity = '0';
      dismiss('sc_promo_banner', 24);
      track('xpromo_dismiss', 'top_banner');
      setTimeout(function () { banner.remove(); }, 350);
    });
  }

  setTimeout(createTopBanner, 100);

  // ── 2. BOTTOM-RIGHT FLOATING CARD ─────────────────────────────────────
  function createFloatingCard() {
    if (dismissed('sc_promo_card')) return;

    var card = document.createElement('div');
    card.id = 'sc-promo-card';
    card.style.cssText = [
      'position:fixed',
      'bottom:20px',
      'right:20px',
      'z-index:99998',
      'width:280px',
      'background:rgba(13,17,23,0.85)',
      'backdrop-filter:blur(16px) saturate(180%)',
      '-webkit-backdrop-filter:blur(16px) saturate(180%)',
      'border:1px solid rgba(88,166,255,0.15)',
      'border-radius:14px',
      'padding:20px',
      'font-family:system-ui,-apple-system,sans-serif',
      'color:#e6edf3',
      'box-shadow:0 8px 32px rgba(0,0,0,0.4)',
      'animation:scPromoFadeUp 0.5s ease both'
    ].join(';');

    card.innerHTML =
      '<button class="sc-promo-close" aria-label="Close" ' +
        'style="position:absolute;top:8px;right:8px;font-size:18px">&times;</button>' +
      '<div style="font-size:16px;font-weight:700;margin-bottom:6px;line-height:1.3">' +
        '&#128640; Free tools for developers' +
      '</div>' +
      '<div style="font-size:13px;color:#8b949e;margin-bottom:14px;line-height:1.4">' +
        '300+ tools, 22 ebooks, all free. No signup required.' +
      '</div>' +
      '<a href="' + LINK + '&el=card" target="_blank" rel="noopener" class="sc-promo-btn" ' +
        'style="display:block;text-align:center;width:100%;box-sizing:border-box">' +
        'Visit spunk.codes &#8594;' +
      '</a>';

    document.body.appendChild(card);

    // track view
    track('xpromo_view', 'floating_card');

    // CTA click
    card.querySelector('.sc-promo-btn').addEventListener('click', function () {
      track('xpromo_click', 'floating_card');
    });

    // dismiss
    card.querySelector('.sc-promo-close').addEventListener('click', function () {
      card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      card.style.transform = 'translateY(20px) scale(0.96)';
      card.style.opacity = '0';
      dismiss('sc_promo_card', 72); // 3 days
      track('xpromo_dismiss', 'floating_card');
      setTimeout(function () { card.remove(); }, 350);
    });
  }

  setTimeout(createFloatingCard, 15000);

  // ── 3. EXIT-INTENT POPUP ──────────────────────────────────────────────
  function createExitIntent() {
    // Only once per session
    if (sessionStorage.getItem('sc_promo_exit')) return;

    var fired = false;

    function onLeave(e) {
      if (fired) return;
      // only trigger when mouse exits through top of viewport
      if (e.clientY > 5) return;
      fired = true;
      sessionStorage.setItem('sc_promo_exit', '1');
      document.removeEventListener('mouseout', onLeave);
      showPopup();
    }

    document.addEventListener('mouseout', onLeave);

    function showPopup() {
      var overlay = document.createElement('div');
      overlay.id = 'sc-promo-exit';
      overlay.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'right:0',
        'bottom:0',
        'z-index:100000',
        'background:rgba(0,0,0,0.65)',
        'backdrop-filter:blur(4px)',
        '-webkit-backdrop-filter:blur(4px)',
        'animation:scPromoFadeIn 0.3s ease both',
        'display:flex',
        'align-items:center',
        'justify-content:center'
      ].join(';');

      var modal = document.createElement('div');
      modal.style.cssText = [
        'position:relative',
        'width:380px',
        'max-width:90vw',
        'background:rgba(13,17,23,0.92)',
        'backdrop-filter:blur(20px) saturate(180%)',
        '-webkit-backdrop-filter:blur(20px) saturate(180%)',
        'border:1px solid rgba(88,166,255,0.2)',
        'border-radius:16px',
        'padding:32px 28px',
        'text-align:center',
        'font-family:system-ui,-apple-system,sans-serif',
        'color:#e6edf3',
        'box-shadow:0 16px 48px rgba(0,0,0,0.5)',
        'animation:scPromoPopIn 0.35s ease both'
      ].join(';');

      modal.innerHTML =
        '<button class="sc-promo-close" aria-label="Close" ' +
          'style="position:absolute;top:12px;right:12px;font-size:22px">&times;</button>' +
        '<div style="font-size:28px;margin-bottom:8px">&#128075;</div>' +
        '<div style="font-size:20px;font-weight:800;margin-bottom:8px;line-height:1.3">' +
          'Before you go...' +
        '</div>' +
        '<div style="font-size:14px;color:#8b949e;margin-bottom:20px;line-height:1.5">' +
          'Check out <strong style="color:#e6edf3">300+ free dev tools</strong> and ' +
          '<strong style="color:#e6edf3">22 ebooks</strong> at spunk.codes &mdash; ' +
          'no signup, no fees, just tools.' +
        '</div>' +
        '<a href="' + LINK + '&el=exit" target="_blank" rel="noopener" class="sc-promo-btn" ' +
          'style="font-size:15px;padding:10px 28px">' +
          'Visit spunk.codes &#8594;' +
        '</a>' +
        '<div style="margin-top:12px">' +
          '<button id="sc-exit-skip" style="background:none;border:none;color:#484f58;' +
            'font-size:12px;cursor:pointer;font-family:inherit;padding:4px 8px">' +
            'No thanks' +
          '</button>' +
        '</div>';

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // track view
      track('xpromo_view', 'exit_intent');

      // CTA click
      modal.querySelector('.sc-promo-btn').addEventListener('click', function () {
        track('xpromo_click', 'exit_intent');
        closePopup();
      });

      // Close handlers
      function closePopup() {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        track('xpromo_dismiss', 'exit_intent');
        setTimeout(function () { overlay.remove(); }, 350);
      }

      modal.querySelector('.sc-promo-close').addEventListener('click', closePopup);
      modal.querySelector('#sc-exit-skip').addEventListener('click', closePopup);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closePopup();
      });

      // Escape key
      function onEsc(e) {
        if (e.key === 'Escape') {
          closePopup();
          document.removeEventListener('keydown', onEsc);
        }
      }
      document.addEventListener('keydown', onEsc);
    }
  }

  // Small delay so it doesn't interfere with page load
  setTimeout(createExitIntent, 3000);

})();
