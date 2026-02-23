/**
 * SPUNK.CODES — Affiliate / Referral Widget
 * ==========================================
 * Drop-in script. Adds:
 *   1. Floating "Earn 50% commission" badge (bottom-left corner)
 *   2. Referral source tracking via ?ref=xxx URL params
 *   3. 30-day referral cookie in localStorage
 *
 * Usage:
 *   <script src="/affiliate-widget.js"></script>
 */

(function () {
  'use strict';

  var LS_PREFIX = 'sc_aff_';
  var RESELLER_URL = '/reseller.html';
  var AFFILIATES_URL = '/affiliates.html';
  var COOKIE_DAYS = 30;

  function lsGet(k) { try { return localStorage.getItem(LS_PREFIX + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(LS_PREFIX + k, v); } catch (e) {} }

  function track(action, label) {
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: 'affiliate_widget',
        event_label: label || ''
      });
    }
  }

  // ── 1. Track referral source ────────────────────────────
  (function trackReferral() {
    var params = new URLSearchParams(window.location.search);
    var ref = params.get('ref') || params.get('r') || params.get('via');

    if (ref && /^[a-zA-Z0-9_-]{2,64}$/.test(ref)) {
      var existing = lsGet('ref_code');
      // Only set if no existing referral or if expired
      if (!existing || isExpired()) {
        lsSet('ref_code', ref);
        lsSet('ref_ts', String(Date.now()));
        lsSet('ref_landing', window.location.pathname);
        track('referral_visit', ref);
      }
      // Clean URL (remove ref param without reload)
      if (window.history && window.history.replaceState) {
        params.delete('ref');
        params.delete('r');
        params.delete('via');
        var cleanUrl = window.location.pathname;
        var remaining = params.toString();
        if (remaining) cleanUrl += '?' + remaining;
        cleanUrl += window.location.hash;
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  })();

  function isExpired() {
    var ts = lsGet('ref_ts');
    if (!ts) return true;
    var elapsed = Date.now() - parseInt(ts, 10);
    return elapsed > COOKIE_DAYS * 24 * 60 * 60 * 1000;
  }

  // Expose referral code for checkout/forms
  window.scGetReferral = function () {
    if (isExpired()) {
      lsSet('ref_code', '');
      lsSet('ref_ts', '');
      return null;
    }
    return lsGet('ref_code') || null;
  };

  // ── 2. Floating affiliate badge ─────────────────────────
  if (lsGet('badge_dismissed')) return;

  // Don't show on affiliate/reseller pages themselves
  var path = window.location.pathname;
  if (path.indexOf('reseller') !== -1 || path.indexOf('affiliat') !== -1) return;

  var css = document.createElement('style');
  css.textContent = [
    '@keyframes scAffSlideIn{from{transform:translateX(-120%);opacity:0}to{transform:translateX(0);opacity:1}}',
    '@keyframes scAffGlow{0%,100%{box-shadow:0 4px 20px rgba(57,211,83,0.15)}50%{box-shadow:0 4px 30px rgba(57,211,83,0.35)}}',

    '.sc-aff-badge{position:fixed;bottom:80px;left:16px;z-index:9999;animation:scAffSlideIn 0.5s ease 2s both;font-family:system-ui,-apple-system,sans-serif}',
    '.sc-aff-badge-inner{display:flex;align-items:center;gap:10px;padding:10px 16px;background:rgba(13,17,23,0.95);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(57,211,83,0.3);border-radius:14px;cursor:pointer;transition:all 0.3s;animation:scAffGlow 3s infinite 3s;text-decoration:none;color:#e6edf3}',
    '.sc-aff-badge-inner:hover{transform:translateY(-2px);border-color:rgba(57,211,83,0.6);box-shadow:0 8px 30px rgba(57,211,83,0.25)}',
    '.sc-aff-badge-icon{font-size:20px;flex-shrink:0}',
    '.sc-aff-badge-text{font-size:12px;font-weight:700;line-height:1.3;white-space:nowrap}',
    '.sc-aff-badge-text span{display:block;font-size:11px;font-weight:500;color:#39d353}',
    '.sc-aff-badge-close{position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:#21262d;border:1px solid #30363d;border-radius:50%;color:#8b949e;font-size:12px;line-height:18px;text-align:center;cursor:pointer;transition:all 0.2s;display:none}',
    '.sc-aff-badge:hover .sc-aff-badge-close{display:block}',
    '.sc-aff-badge-close:hover{background:#484f58;color:#fff}',

    /* Collapse on small screens to icon-only */
    '@media(max-width:480px){',
    '  .sc-aff-badge{bottom:70px;left:10px}',
    '  .sc-aff-badge-text{display:none}',
    '  .sc-aff-badge-inner{padding:10px 12px}',
    '}'
  ].join('\n');
  document.head.appendChild(css);

  var badge = document.createElement('div');
  badge.className = 'sc-aff-badge';
  badge.innerHTML =
    '<a href="' + AFFILIATES_URL + '" class="sc-aff-badge-inner" onclick="return !1">' +
      '<span class="sc-aff-badge-icon">&#128176;</span>' +
      '<span class="sc-aff-badge-text">Earn 50% Commission<span>Become an affiliate &rarr;</span></span>' +
    '</a>' +
    '<button class="sc-aff-badge-close" aria-label="Dismiss">&times;</button>';
  document.body.appendChild(badge);

  badge.querySelector('.sc-aff-badge-inner').addEventListener('click', function (e) {
    e.preventDefault();
    track('affiliate_badge_click', 'earn_commission');
    window.location.href = AFFILIATES_URL;
  });

  badge.querySelector('.sc-aff-badge-close').addEventListener('click', function (e) {
    e.stopPropagation();
    badge.style.transform = 'translateX(-120%)';
    badge.style.opacity = '0';
    badge.style.transition = 'all 0.4s ease';
    lsSet('badge_dismissed', '1');
    track('affiliate_badge_dismiss', 'closed');
    setTimeout(function () { badge.remove(); }, 500);
  });

  track('affiliate_badge_view', 'shown');

})();
