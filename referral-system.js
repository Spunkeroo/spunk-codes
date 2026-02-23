/**
 * SPUNK.CODES — Universal Referral Code System
 * ==============================================
 * Drop-in script for any page across all SPUNK sites.
 *
 * Features:
 *   1. Detects ?ref=SPUNK or ?code=SPUNK URL parameters
 *   2. Stores referral code in localStorage with 90-day expiry
 *   3. Shows welcome banner for SPUNK code users
 *   4. Unlocks "EXCLUSIVE" badge on tool pages
 *   5. Tracks referrals in GA4 custom events
 *   6. Generates shareable referral links per user
 *   7. Shows referral stats and leaderboard (localStorage demo)
 *
 * Usage:
 *   <script src="/referral-system.js"></script>
 *   — or —
 *   <script src="https://spunk.codes/referral-system.js"></script>
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────
  var LS_PREFIX = 'spunk_ref_';
  var MASTER_CODE = 'SPUNK';
  var EXPIRY_DAYS = 90;
  var SITE_URL = 'https://spunk.codes';
  var EXCLUSIVE_URL = '/exclusive-tools.html';
  var CAMPAIGN_URL = '/viral-campaign.html';

  // ── Helpers ─────────────────────────────────────────────
  function lsGet(k) { try { return localStorage.getItem(LS_PREFIX + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(LS_PREFIX + k, v); } catch (e) {} }
  function lsGetJSON(k) { try { return JSON.parse(localStorage.getItem(LS_PREFIX + k)); } catch (e) { return null; } }
  function lsSetJSON(k, v) { try { localStorage.setItem(LS_PREFIX + k, JSON.stringify(v)); } catch (e) {} }

  function track(action, params) {
    if (typeof gtag === 'function') {
      gtag('event', action, Object.assign({ event_category: 'referral_system' }, params || {}));
    }
  }

  function isExpired(tsKey) {
    var ts = lsGet(tsKey || 'code_ts');
    if (!ts) return true;
    return (Date.now() - parseInt(ts, 10)) > EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  }

  function sanitizeCode(s) {
    return (s || '').replace(/^@/, '').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64);
  }

  // ── 1. Detect & store referral code ─────────────────────
  (function detectReferral() {
    var params = new URLSearchParams(window.location.search);
    var code = params.get('ref') || params.get('code') || params.get('r') || params.get('via');

    if (code && /^[a-zA-Z0-9_-]{1,64}$/i.test(code)) {
      var normalized = code.toUpperCase() === MASTER_CODE ? MASTER_CODE : code;
      var existing = lsGet('code');

      // Store if new or expired
      if (!existing || isExpired('code_ts')) {
        lsSet('code', normalized);
        lsSet('code_ts', String(Date.now()));
        lsSet('code_landing', window.location.pathname);
        track('referral_code_captured', { ref_code: normalized, is_master: normalized === MASTER_CODE });
      }

      // Increment referrer stats in leaderboard
      incrementReferrerStats(normalized);

      // Clean URL
      if (window.history && window.history.replaceState) {
        params.delete('ref');
        params.delete('code');
        params.delete('r');
        params.delete('via');
        var clean = window.location.pathname;
        var remaining = params.toString();
        if (remaining) clean += '?' + remaining;
        clean += window.location.hash;
        window.history.replaceState({}, '', clean);
      }
    }
  })();

  // ── 2. Check if user has SPUNK code ─────────────────────
  function hasSpunkCode() {
    var code = lsGet('code');
    return code && code.toUpperCase() === MASTER_CODE && !isExpired('code_ts');
  }

  function hasAnyCode() {
    var code = lsGet('code');
    return code && !isExpired('code_ts');
  }

  function getCode() {
    if (isExpired('code_ts')) return null;
    return lsGet('code');
  }

  // Expose globally
  window.spunkRefSystem = {
    hasSpunkCode: hasSpunkCode,
    hasAnyCode: hasAnyCode,
    getCode: getCode,
    getMasterCode: function () { return MASTER_CODE; },
    getMyReferralLink: getMyReferralLink,
    getMyStats: getMyStats,
    getLeaderboard: getLeaderboard,
    generateReferralLink: generateReferralLink
  };

  // ── 3. Welcome banner for SPUNK code users ──────────────
  function showWelcomeBanner() {
    if (!hasSpunkCode()) return;
    if (lsGet('welcome_dismissed')) return;

    // Don't show on campaign/exclusive pages
    var path = window.location.pathname;
    if (path.indexOf('exclusive') !== -1 || path.indexOf('viral-campaign') !== -1) return;

    var css = document.createElement('style');
    css.textContent = [
      '@keyframes spunkBannerSlide{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}',
      '@keyframes spunkBannerGlow{0%,100%{box-shadow:0 4px 20px rgba(57,211,83,0.15)}50%{box-shadow:0 4px 30px rgba(57,211,83,0.4)}}',
      '@keyframes spunkBadgePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}',

      '.spunk-welcome-banner{position:fixed;top:0;left:0;right:0;z-index:10001;background:linear-gradient(135deg,rgba(13,17,23,0.98),rgba(22,27,34,0.98));backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(57,211,83,0.3);padding:12px 20px;display:flex;align-items:center;justify-content:center;gap:12px;font-family:system-ui,-apple-system,sans-serif;animation:spunkBannerSlide 0.5s ease,spunkBannerGlow 3s infinite 1s;flex-wrap:wrap}',
      '.spunk-welcome-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:linear-gradient(135deg,#39d353,#2ea043);border-radius:20px;font-size:11px;font-weight:800;color:#fff;letter-spacing:1px;text-transform:uppercase;animation:spunkBadgePulse 2s infinite;white-space:nowrap}',
      '.spunk-welcome-text{color:#e6edf3;font-size:13px;font-weight:600;text-align:center}',
      '.spunk-welcome-text a{color:#58a6ff;text-decoration:underline;text-underline-offset:2px;transition:color 0.2s}',
      '.spunk-welcome-text a:hover{color:#39d353}',
      '.spunk-welcome-close{background:none;border:none;color:#8b949e;font-size:20px;cursor:pointer;padding:4px 8px;line-height:1;transition:color 0.2s;flex-shrink:0}',
      '.spunk-welcome-close:hover{color:#fff}',
      '@media(max-width:640px){.spunk-welcome-banner{padding:10px 14px;gap:8px}.spunk-welcome-text{font-size:12px}}'
    ].join('\n');
    document.head.appendChild(css);

    var banner = document.createElement('div');
    banner.className = 'spunk-welcome-banner';
    banner.innerHTML =
      '<span class="spunk-welcome-badge">EXCLUSIVE</span>' +
      '<span class="spunk-welcome-text">Welcome! You\'re using the <strong>SPUNK</strong> referral code &mdash; you get exclusive access to <a href="' + EXCLUSIVE_URL + '">premium tools</a>!</span>' +
      '<button class="spunk-welcome-close" aria-label="Dismiss">&times;</button>';
    document.body.prepend(banner);

    banner.querySelector('.spunk-welcome-close').addEventListener('click', function () {
      banner.style.transform = 'translateY(-100%)';
      banner.style.opacity = '0';
      banner.style.transition = 'all 0.4s ease';
      lsSet('welcome_dismissed', '1');
      track('welcome_banner_dismiss');
      setTimeout(function () { banner.remove(); }, 500);
    });

    track('welcome_banner_view', { ref_code: MASTER_CODE });
  }

  // ── 4. Inject EXCLUSIVE badges on tool pages ────────────
  function injectExclusiveBadges() {
    if (!hasSpunkCode()) return;

    var css = document.createElement('style');
    css.textContent = [
      '.spunk-exclusive-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:linear-gradient(135deg,rgba(57,211,83,0.15),rgba(88,166,255,0.15));border:1px solid rgba(57,211,83,0.3);border-radius:20px;font-size:10px;font-weight:800;color:#39d353;letter-spacing:1.2px;text-transform:uppercase;margin-left:8px;vertical-align:middle;animation:spunkBadgePulse 3s infinite}',
      '.spunk-exclusive-badge::before{content:"";display:inline-block;width:6px;height:6px;background:#39d353;border-radius:50%;box-shadow:0 0 6px rgba(57,211,83,0.6)}',
      '@keyframes spunkBadgePulse{0%,100%{opacity:1}50%{opacity:0.8}}'
    ].join('\n');
    document.head.appendChild(css);

    // Badge tool page titles
    var h1 = document.querySelector('h1');
    if (h1 && !h1.querySelector('.spunk-exclusive-badge')) {
      var badge = document.createElement('span');
      badge.className = 'spunk-exclusive-badge';
      badge.textContent = 'EXCLUSIVE';
      h1.appendChild(badge);
    }

    // Badge cards on store/index
    var cards = document.querySelectorAll('.tool-card h3, .card-title, .tool-name');
    for (var i = 0; i < Math.min(cards.length, 20); i++) {
      if (Math.random() > 0.6 && !cards[i].querySelector('.spunk-exclusive-badge')) {
        var b = document.createElement('span');
        b.className = 'spunk-exclusive-badge';
        b.textContent = 'EXCLUSIVE';
        cards[i].appendChild(b);
      }
    }
  }

  // ── 5. Referral link generation ─────────────────────────
  function generateReferralLink(username) {
    var code = sanitizeCode(username);
    if (!code) return null;

    lsSet('my_code', code);
    lsSet('my_name', username);
    lsSet('my_code_created', String(Date.now()));

    // Initialize stats if new
    if (!lsGetJSON('stats_' + code)) {
      lsSetJSON('stats_' + code, { clicks: 0, referrals: 0, earned: 0 });
    }

    // Add to leaderboard
    addToLeaderboard(code, username);

    track('referral_link_generated', { ref_code: code });

    return SITE_URL + '?ref=' + encodeURIComponent(code);
  }

  function getMyReferralLink() {
    var code = lsGet('my_code');
    if (!code) return null;
    return SITE_URL + '?ref=' + encodeURIComponent(code);
  }

  // ── 6. Referral stats ───────────────────────────────────
  function getMyStats() {
    var code = lsGet('my_code');
    if (!code) return { clicks: 0, referrals: 0, earned: 0 };
    return lsGetJSON('stats_' + code) || { clicks: 0, referrals: 0, earned: 0 };
  }

  function incrementReferrerStats(refCode) {
    var key = 'stats_' + sanitizeCode(refCode);
    var stats = lsGetJSON(key.replace(LS_PREFIX, ''));
    // We track from the referred user's perspective
    // Store the referring code so stats pages can show it
    var visitLog = lsGetJSON('visit_log') || [];
    visitLog.push({
      code: refCode,
      time: Date.now(),
      page: window.location.pathname
    });
    // Keep only last 100
    if (visitLog.length > 100) visitLog = visitLog.slice(-100);
    lsSetJSON('visit_log', visitLog);

    // Increment global counter
    var globalCount = parseInt(lsGet('global_referral_count') || '247', 10);
    lsSet('global_referral_count', String(globalCount + 1));
  }

  // ── 7. Leaderboard (localStorage demo) ──────────────────
  function getLeaderboard() {
    var lb = lsGetJSON('leaderboard');
    if (!lb || !lb.length) {
      // Seed demo data
      lb = [
        { name: '@BuilderDan', code: 'builderdan', refs: 47 },
        { name: '@CodeWithSara', code: 'codewithsara', refs: 38 },
        { name: '@IndieMike', code: 'indiemike', refs: 31 },
        { name: '@SoloFounderAI', code: 'solofounderai', refs: 24 },
        { name: '@VibeCoderPro', code: 'vibecoderpro', refs: 19 },
        { name: '@ShipFastDev', code: 'shipfastdev', refs: 15 },
        { name: '@CryptoBuilder', code: 'cryptobuilder', refs: 12 },
        { name: '@DesignSprint', code: 'designsprint', refs: 9 },
        { name: '@AIToolsMaster', code: 'aitoolsmaster', refs: 7 },
        { name: '@NoCodeNinja', code: 'nocodeninja', refs: 5 }
      ];
      lsSetJSON('leaderboard', lb);
    }
    return lb.sort(function (a, b) { return b.refs - a.refs; });
  }

  function addToLeaderboard(code, name) {
    var lb = getLeaderboard();
    var found = false;
    for (var i = 0; i < lb.length; i++) {
      if (lb[i].code === code) {
        found = true;
        break;
      }
    }
    if (!found) {
      lb.push({ name: name.startsWith('@') ? name : '@' + name, code: code, refs: 0 });
      lsSetJSON('leaderboard', lb);
    }
  }

  function getGlobalReferralCount() {
    return parseInt(lsGet('global_referral_count') || '247', 10);
  }

  // Expose count globally
  window.spunkGetGlobalCount = getGlobalReferralCount;

  // ── Initialize ──────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    showWelcomeBanner();
    injectExclusiveBadges();
  }

})();
