/**
 * SPUNK.CODES — Universal Referral Tracker
 * ==========================================
 * Drop this script on any page across any site.
 *
 * What it does:
 *   1. Reads ?ref= or ?r= from URL on any page
 *   2. Stores the referrer handle in localStorage: 'referred_by'
 *   3. Increments the referrer's click count in localStorage
 *   4. Shows a subtle toast: "Referred by [handle] — you both earn rewards!"
 *   5. Works on spunk.codes and cross-site
 *   6. Tracks via GA4 if available
 *   7. Cleans the URL after capturing (no ugly params left)
 *
 * Usage:
 *   <script src="/referral-tracker.js"></script>
 *   — or —
 *   <script src="https://spunk.codes/referral-tracker.js"></script>
 */

(function () {
  'use strict';

  // ── Config ───────────────────────────────────────────────
  var LS_PREFIX       = 'spunk_referral_';
  var REFERRAL_EXPIRY = 90;  // days
  var TOAST_DURATION  = 6000; // ms
  var TOAST_DELAY     = 800;  // ms before showing
  var SITE_URL        = 'https://spunk.codes';

  // ── Helpers ──────────────────────────────────────────────
  function lsGet(k) {
    try { return localStorage.getItem(LS_PREFIX + k); } catch (e) { return null; }
  }

  function lsSet(k, v) {
    try { localStorage.setItem(LS_PREFIX + k, v); } catch (e) {}
  }

  function lsGetJSON(k) {
    try { return JSON.parse(localStorage.getItem(LS_PREFIX + k)); } catch (e) { return null; }
  }

  function lsSetJSON(k, v) {
    try { localStorage.setItem(LS_PREFIX + k, JSON.stringify(v)); } catch (e) {}
  }

  function sanitize(s) {
    return (s || '').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64).toLowerCase();
  }

  function isExpired() {
    var ts = lsGet('referred_at');
    if (!ts) return true;
    return (Date.now() - parseInt(ts, 10)) > REFERRAL_EXPIRY * 24 * 60 * 60 * 1000;
  }

  function trackGA4(action, params) {
    if (typeof gtag === 'function') {
      gtag('event', action, Object.assign({
        event_category: 'referral_tracker',
        non_interaction: true
      }, params || {}));
    }
  }

  // ── 1. Detect referral from URL ──────────────────────────
  var params = new URLSearchParams(window.location.search);
  var refHandle = params.get('ref') || params.get('r');

  if (refHandle) {
    refHandle = sanitize(refHandle);
  }

  if (refHandle && refHandle.length >= 1) {
    var existingRef = lsGet('referred_by');
    var isNew = !existingRef || isExpired();

    // ── 2. Store the referrer handle ──────────────────────
    if (isNew) {
      lsSet('referred_by', refHandle);
      lsSet('referred_at', String(Date.now()));
      lsSet('referred_page', window.location.pathname);
      lsSet('referred_site', window.location.hostname);

      trackGA4('referral_captured', {
        ref_handle: refHandle,
        ref_page: window.location.pathname,
        ref_site: window.location.hostname,
        is_new: 'true'
      });
    } else {
      trackGA4('referral_revisit', {
        ref_handle: refHandle,
        existing_ref: existingRef,
        ref_page: window.location.pathname
      });
    }

    // ── 3. Increment the referrer's click count ───────────
    var clickKey = 'clicks_' + refHandle;
    var currentClicks = parseInt(lsGet(clickKey) || '0', 10);
    lsSet(clickKey, String(currentClicks + 1));

    // Also increment in the referrer's stats if they created a handle on this browser
    var myHandle = lsGet('handle');
    if (myHandle && myHandle === refHandle) {
      // Don't count self-referrals
    } else {
      var stats = lsGetJSON('stats_for_' + refHandle) || { clicks: 0, signups: 0 };
      stats.clicks++;
      lsSetJSON('stats_for_' + refHandle, stats);
    }

    // Update global referral stats (for the dashboard on refer.html)
    // If current user is the referrer viewing their own stats
    var ownHandle = lsGet('handle');
    if (ownHandle) {
      var ownStats = lsGetJSON('stats') || { clicks: 0, signups: 0, spunk_earned: 0 };
      // Only count if this is a different referrer clicking their link
      // This is tracked from the referrer's browser perspective
    }

    // Log the visit for analytics
    var visitLog = lsGetJSON('visit_log') || [];
    visitLog.push({
      handle: refHandle,
      time: Date.now(),
      page: window.location.pathname,
      site: window.location.hostname
    });
    // Keep last 200 entries
    if (visitLog.length > 200) {
      visitLog = visitLog.slice(-200);
    }
    lsSetJSON('visit_log', visitLog);

    // Increment global counter
    var globalKey = 'spunk_ref_global_referral_count';
    try {
      var globalCount = parseInt(localStorage.getItem(globalKey) || '247', 10);
      localStorage.setItem(globalKey, String(globalCount + 1));
    } catch (e) {}

    // ── 4. Show referral toast ────────────────────────────
    setTimeout(function () {
      showToast(refHandle);
    }, TOAST_DELAY);

    // ── 5. Clean the URL ──────────────────────────────────
    if (window.history && window.history.replaceState) {
      params.delete('ref');
      params.delete('r');
      var cleanUrl = window.location.pathname;
      var remaining = params.toString();
      if (remaining) cleanUrl += '?' + remaining;
      cleanUrl += window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }
  }

  // ── Toast notification ───────────────────────────────────
  function showToast(handle) {
    // Don't show if already dismissed this session
    var dismissed = false;
    try { dismissed = sessionStorage.getItem(LS_PREFIX + 'toast_dismissed') === '1'; } catch (e) {}
    if (dismissed) return;

    // Inject toast CSS
    var style = document.createElement('style');
    style.textContent = [
      '@keyframes spunkToastIn{from{transform:translateX(calc(100% + 20px));opacity:0}to{transform:translateX(0);opacity:1}}',
      '@keyframes spunkToastOut{from{transform:translateX(0);opacity:1}to{transform:translateX(calc(100% + 20px));opacity:0}}',
      '@keyframes spunkToastProgress{from{width:100%}to{width:0%}}',

      '.spunk-ref-toast{',
      '  position:fixed;bottom:24px;right:24px;z-index:99999;',
      '  max-width:380px;width:calc(100vw - 48px);',
      '  background:rgba(22,27,34,0.95);',
      '  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);',
      '  border:1px solid rgba(57,211,83,0.25);',
      '  border-radius:14px;',
      '  padding:16px 20px;',
      '  font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      '  animation:spunkToastIn 0.5s cubic-bezier(0.4,0,0.2,1) forwards;',
      '  box-shadow:0 12px 40px rgba(0,0,0,0.4),0 0 0 1px rgba(57,211,83,0.1);',
      '  cursor:default;',
      '}',
      '.spunk-ref-toast.hiding{animation:spunkToastOut 0.4s cubic-bezier(0.4,0,0.2,1) forwards}',

      '.spunk-ref-toast-content{display:flex;align-items:flex-start;gap:12px}',

      '.spunk-ref-toast-icon{',
      '  width:36px;height:36px;flex-shrink:0;',
      '  background:linear-gradient(135deg,rgba(57,211,83,0.15),rgba(88,166,255,0.15));',
      '  border:1px solid rgba(57,211,83,0.2);',
      '  border-radius:10px;',
      '  display:flex;align-items:center;justify-content:center;',
      '  font-size:18px;',
      '}',

      '.spunk-ref-toast-body{flex:1;min-width:0}',
      '.spunk-ref-toast-title{font-size:13px;font-weight:700;color:#e6edf3;margin-bottom:3px;line-height:1.3}',
      '.spunk-ref-toast-title strong{color:#39d353}',
      '.spunk-ref-toast-desc{font-size:12px;color:#8b949e;line-height:1.4}',
      '.spunk-ref-toast-desc a{color:#58a6ff;text-decoration:underline;text-underline-offset:2px}',
      '.spunk-ref-toast-desc a:hover{color:#39d353}',

      '.spunk-ref-toast-close{',
      '  position:absolute;top:8px;right:10px;',
      '  background:none;border:none;color:#484f58;font-size:16px;',
      '  cursor:pointer;padding:4px;line-height:1;transition:color 0.2s;',
      '}',
      '.spunk-ref-toast-close:hover{color:#e6edf3}',

      '.spunk-ref-toast-bar{',
      '  position:absolute;bottom:0;left:14px;right:14px;height:2px;',
      '  background:rgba(48,54,61,0.5);border-radius:2px;overflow:hidden;',
      '}',
      '.spunk-ref-toast-bar-fill{',
      '  height:100%;background:linear-gradient(90deg,#39d353,#58a6ff);border-radius:2px;',
      '  animation:spunkToastProgress ' + TOAST_DURATION + 'ms linear forwards;',
      '}',

      '@media(max-width:480px){',
      '  .spunk-ref-toast{bottom:12px;right:12px;width:calc(100vw - 24px);max-width:none;padding:14px 16px}',
      '}'
    ].join('\n');
    document.head.appendChild(style);

    // Build toast HTML
    var toast = document.createElement('div');
    toast.className = 'spunk-ref-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    var displayHandle = handle.length > 20 ? handle.substring(0, 20) + '...' : handle;

    toast.innerHTML =
      '<button class="spunk-ref-toast-close" aria-label="Dismiss">&times;</button>' +
      '<div class="spunk-ref-toast-content">' +
        '<div class="spunk-ref-toast-icon">&#128279;</div>' +
        '<div class="spunk-ref-toast-body">' +
          '<div class="spunk-ref-toast-title">Referred by <strong>' + escapeHtml(displayHandle) + '</strong></div>' +
          '<div class="spunk-ref-toast-desc">You both earn rewards! <a href="' + SITE_URL + '/refer.html" target="_blank" rel="noopener">Learn more</a></div>' +
        '</div>' +
      '</div>' +
      '<div class="spunk-ref-toast-bar"><div class="spunk-ref-toast-bar-fill"></div></div>';

    document.body.appendChild(toast);

    // Close button
    var closeBtn = toast.querySelector('.spunk-ref-toast-close');
    closeBtn.addEventListener('click', function () {
      dismissToast(toast);
    });

    // Auto-dismiss after duration
    var autoTimer = setTimeout(function () {
      dismissToast(toast);
    }, TOAST_DURATION);

    // Pause auto-dismiss on hover
    toast.addEventListener('mouseenter', function () {
      clearTimeout(autoTimer);
      var fill = toast.querySelector('.spunk-ref-toast-bar-fill');
      if (fill) fill.style.animationPlayState = 'paused';
    });

    toast.addEventListener('mouseleave', function () {
      var fill = toast.querySelector('.spunk-ref-toast-bar-fill');
      if (fill) fill.style.animationPlayState = 'running';
      autoTimer = setTimeout(function () {
        dismissToast(toast);
      }, 2000);
    });

    trackGA4('referral_toast_shown', { ref_handle: handle });
  }

  function dismissToast(toast) {
    if (!toast || toast.classList.contains('hiding')) return;
    toast.classList.add('hiding');
    try { sessionStorage.setItem(LS_PREFIX + 'toast_dismissed', '1'); } catch (e) {}
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 500);
    trackGA4('referral_toast_dismissed');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ── 6. Expose API globally ───────────────────────────────
  window.spunkReferralTracker = {
    /**
     * Get the handle that referred the current user (or null).
     */
    getReferredBy: function () {
      if (isExpired()) return null;
      return lsGet('referred_by');
    },

    /**
     * Check if user was referred by anyone.
     */
    isReferred: function () {
      return !!this.getReferredBy();
    },

    /**
     * Get referral metadata.
     */
    getReferralInfo: function () {
      if (isExpired()) return null;
      return {
        handle: lsGet('referred_by'),
        referredAt: lsGet('referred_at'),
        landingPage: lsGet('referred_page'),
        site: lsGet('referred_site')
      };
    },

    /**
     * Get click count for a specific handle (from this browser).
     */
    getClicks: function (handle) {
      return parseInt(lsGet('clicks_' + sanitize(handle)) || '0', 10);
    },

    /**
     * Get the full visit log.
     */
    getVisitLog: function () {
      return lsGetJSON('visit_log') || [];
    },

    /**
     * Manually trigger a signup attribution.
     * Call this when a user completes a meaningful action (signup, purchase, etc.)
     */
    trackSignup: function (eventData) {
      var referrer = lsGet('referred_by');
      if (!referrer) return false;

      // Increment signup count for the referrer
      var stats = lsGetJSON('stats_for_' + referrer) || { clicks: 0, signups: 0 };
      stats.signups++;
      lsSetJSON('stats_for_' + referrer, stats);

      // If the referrer is also on this browser (their own dashboard), update their stats
      var ownHandle = lsGet('handle');
      if (ownHandle === referrer) {
        var ownStats = lsGetJSON('stats') || { clicks: 0, signups: 0, spunk_earned: 0 };
        ownStats.signups++;
        ownStats.spunk_earned += 100; // 100 SPUNK per referral
        lsSetJSON('stats', ownStats);
      }

      trackGA4('referral_signup', Object.assign({
        ref_handle: referrer,
        ref_site: window.location.hostname
      }, eventData || {}));

      return true;
    },

    /**
     * Clear referral attribution (e.g. on explicit opt-out).
     */
    clearReferral: function () {
      try {
        localStorage.removeItem(LS_PREFIX + 'referred_by');
        localStorage.removeItem(LS_PREFIX + 'referred_at');
        localStorage.removeItem(LS_PREFIX + 'referred_page');
        localStorage.removeItem(LS_PREFIX + 'referred_site');
      } catch (e) {}
    }
  };

})();
