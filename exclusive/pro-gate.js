/**
 * SPUNK.CODES — Pro Access Gate Module
 * =====================================
 * Drop-in script for any tool page to enforce Pro access.
 *
 * Features:
 *   1. Check if user is Pro (localStorage-based)
 *   2. Show upgrade modal if not Pro
 *   3. Handle Gumroad webhook simulation (for future payment integration)
 *   4. Track pro conversions via GA4
 *   5. Grace period support for new signups
 *   6. Configurable gate behavior (soft vs hard)
 *
 * Usage:
 *   <script src="/exclusive/pro-gate.js"></script>
 *
 * Or with config:
 *   <script>
 *     window.proGateConfig = {
 *       mode: 'hard',         // 'hard' = blocks content, 'soft' = shows banner
 *       redirect: '/pricing.html',
 *       toolName: 'SEO Audit Pro',
 *       trialMinutes: 0       // 0 = no trial, >0 = free trial minutes
 *     };
 *   </script>
 *   <script src="/exclusive/pro-gate.js"></script>
 *
 * Pro status is stored as:
 *   localStorage 'spunk_pro' = 'true'
 *   localStorage 'spunk_referral_code' = 'SPUNK' (also grants access)
 *   localStorage 'spunk_pro_plan' = 'pro-monthly' | 'pro-annual' | 'lifetime' | 'team'
 *   localStorage 'spunk_pro_expires' = timestamp (0 = lifetime / never)
 *   localStorage 'spunk_pro_activated' = ISO date string
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────
  var config = window.proGateConfig || {};
  var MODE = config.mode || 'soft';                      // 'hard' or 'soft'
  var REDIRECT_URL = config.redirect || '/pricing.html';
  var CHECKOUT_URL = config.checkout || '/checkout.html';
  var TOOL_NAME = config.toolName || document.title.split('|')[0].trim();
  var TRIAL_MINUTES = config.trialMinutes || 0;
  var LS_PREFIX = 'spunk_';
  var GA4_ID = 'G-GVNL11PEGP';

  // ── LocalStorage helpers ────────────────────────────────
  function lsGet(k) { try { return localStorage.getItem(LS_PREFIX + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(LS_PREFIX + k, v); } catch (e) {} }
  function lsRemove(k) { try { localStorage.removeItem(LS_PREFIX + k); } catch (e) {} }

  // ── GA4 Tracking ────────────────────────────────────────
  function track(action, params) {
    if (typeof gtag === 'function') {
      gtag('event', action, Object.assign({
        event_category: 'pro_gate',
        tool_name: TOOL_NAME,
        page: window.location.pathname
      }, params || {}));
    }
  }

  // ── Pro Status Check ────────────────────────────────────

  /**
   * Returns true if the user has active Pro access.
   * Checks multiple signals:
   *   1. spunk_pro = 'true'
   *   2. spunk_referral_code = 'SPUNK' (master referral code)
   *   3. Pro not expired (if expiry is set)
   */
  function isPro() {
    // Direct pro flag
    if (lsGet('pro') === 'true') {
      // Check expiry if set
      var expires = lsGet('pro_expires');
      if (expires && expires !== '0') {
        var expiryTs = parseInt(expires, 10);
        if (expiryTs > 0 && Date.now() > expiryTs) {
          // Expired
          lsSet('pro', 'false');
          lsRemove('pro_expires');
          track('pro_expired', { plan: lsGet('pro_plan') || 'unknown' });
          return false;
        }
      }
      return true;
    }

    // Master referral code
    var refCode = lsGet('referral_code');
    if (refCode && refCode.toUpperCase() === 'SPUNK') {
      return true;
    }

    // Check referral system too
    try {
      var refCode2 = localStorage.getItem('spunk_ref_code');
      if (refCode2 && refCode2.toUpperCase() === 'SPUNK') return true;
    } catch (e) {}

    return false;
  }

  /**
   * Check if user is in a free trial period
   */
  function isInTrial() {
    if (TRIAL_MINUTES <= 0) return false;

    var trialStart = lsGet('trial_' + slugify(TOOL_NAME));
    if (!trialStart) {
      // Start trial
      lsSet('trial_' + slugify(TOOL_NAME), Date.now().toString());
      track('pro_trial_started', { tool: TOOL_NAME, minutes: TRIAL_MINUTES });
      return true;
    }

    var elapsed = Date.now() - parseInt(trialStart, 10);
    var trialMs = TRIAL_MINUTES * 60 * 1000;
    return elapsed < trialMs;
  }

  function getTrialTimeLeft() {
    var trialStart = lsGet('trial_' + slugify(TOOL_NAME));
    if (!trialStart) return TRIAL_MINUTES * 60;
    var elapsed = Date.now() - parseInt(trialStart, 10);
    var remaining = (TRIAL_MINUTES * 60 * 1000) - elapsed;
    return Math.max(0, Math.floor(remaining / 1000));
  }

  function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // ── Get Pro Plan Info ───────────────────────────────────
  function getProInfo() {
    return {
      isPro: isPro(),
      plan: lsGet('pro_plan') || null,
      activatedAt: lsGet('pro_activated') || null,
      expiresAt: lsGet('pro_expires') || null,
      isLifetime: lsGet('pro_plan') === 'lifetime',
      isTrial: isInTrial()
    };
  }

  // ── Activate Pro ────────────────────────────────────────

  /**
   * Activate Pro access. Called after successful payment or
   * for testing/demo purposes.
   */
  function activatePro(plan, durationDays) {
    plan = plan || 'pro-monthly';
    lsSet('pro', 'true');
    lsSet('pro_plan', plan);
    lsSet('pro_activated', new Date().toISOString());

    if (plan === 'lifetime' || !durationDays) {
      lsSet('pro_expires', '0'); // Never expires
    } else {
      var expiryTs = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
      lsSet('pro_expires', expiryTs.toString());
    }

    track('pro_activated', {
      plan: plan,
      duration_days: durationDays || 'lifetime',
      source: 'pro_gate'
    });

    // Remove gate UI if present
    var overlay = document.getElementById('sc-pro-gate-overlay');
    if (overlay) overlay.remove();
    var banner = document.getElementById('sc-pro-gate-banner');
    if (banner) banner.remove();

    // Dispatch custom event for other scripts to react
    window.dispatchEvent(new CustomEvent('spunk:pro_activated', {
      detail: { plan: plan, tool: TOOL_NAME }
    }));
  }

  /**
   * Deactivate Pro access
   */
  function deactivatePro() {
    lsSet('pro', 'false');
    lsRemove('pro_plan');
    lsRemove('pro_activated');
    lsRemove('pro_expires');
    track('pro_deactivated');
  }

  // ── Gumroad Webhook Simulation ──────────────────────────

  /**
   * Simulates a Gumroad webhook payload for testing.
   * In production, this would be called by a server-side
   * webhook handler after Gumroad confirms payment.
   */
  function handleGumroadWebhook(payload) {
    if (!payload || !payload.product_id) return false;

    var planMap = {
      'plan-pro-monthly': { plan: 'pro-monthly', days: 31 },
      'plan-pro-annual': { plan: 'pro-annual', days: 365 },
      'plan-lifetime': { plan: 'lifetime', days: 0 },
      'plan-team-monthly': { plan: 'team-monthly', days: 31 },
      'plan-team-annual': { plan: 'team-annual', days: 365 }
    };

    var mapped = planMap[payload.product_id];
    if (!mapped) return false;

    activatePro(mapped.plan, mapped.days || undefined);

    // Store additional Gumroad data
    if (payload.email) lsSet('pro_email', payload.email);
    if (payload.sale_id) lsSet('pro_sale_id', payload.sale_id);
    if (payload.order_number) lsSet('pro_order', payload.order_number);

    track('gumroad_webhook_processed', {
      product_id: payload.product_id,
      plan: mapped.plan,
      email: payload.email || 'unknown',
      sale_id: payload.sale_id || 'unknown'
    });

    return true;
  }

  /**
   * Check URL for Gumroad success callback params.
   * Gumroad can redirect back with ?sale_id=xxx&product_id=xxx
   */
  function checkGumroadCallback() {
    var params = new URLSearchParams(window.location.search);
    var saleId = params.get('sale_id');
    var productId = params.get('product_id') || params.get('product');

    if (saleId && productId) {
      handleGumroadWebhook({
        sale_id: saleId,
        product_id: productId,
        email: params.get('email') || ''
      });

      // Clean URL
      if (window.history && window.history.replaceState) {
        params.delete('sale_id');
        params.delete('product_id');
        params.delete('product');
        params.delete('email');
        var clean = window.location.pathname;
        var remaining = params.toString();
        if (remaining) clean += '?' + remaining;
        clean += window.location.hash;
        window.history.replaceState({}, '', clean);
      }
    }
  }

  // ── UI: Upgrade Modal (Hard Gate) ──────────────────────

  function showHardGate() {
    var css = document.createElement('style');
    css.textContent = [
      '@keyframes scProFadeIn{from{opacity:0}to{opacity:1}}',
      '@keyframes scProSlideUp{from{opacity:0;transform:translateY(30px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}',
      '@keyframes scProPulse{0%,100%{box-shadow:0 0 0 0 rgba(88,166,255,0.3)}50%{box-shadow:0 0 0 8px rgba(88,166,255,0)}}',

      '#sc-pro-gate-overlay{position:fixed;inset:0;z-index:10002;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1rem;animation:scProFadeIn 0.3s ease;font-family:system-ui,-apple-system,sans-serif}',

      '.sc-pro-gate-modal{background:linear-gradient(145deg,#161b22,#0d1117);border:1px solid rgba(88,166,255,0.25);border-radius:20px;padding:2.5rem;max-width:480px;width:100%;text-align:center;animation:scProSlideUp 0.4s ease;box-shadow:0 24px 80px rgba(0,0,0,0.6),0 0 40px rgba(88,166,255,0.06)}',

      '.sc-pro-gate-badge{display:inline-flex;align-items:center;gap:0.4rem;padding:0.3rem 1rem;background:linear-gradient(135deg,rgba(88,166,255,0.12),rgba(57,211,83,0.12));border:1px solid rgba(88,166,255,0.25);border-radius:20px;font-size:0.7rem;font-weight:800;color:#58a6ff;letter-spacing:1px;text-transform:uppercase;margin-bottom:1.2rem}',

      '.sc-pro-gate-icon{font-size:3rem;margin-bottom:1rem}',

      '.sc-pro-gate-modal h2{color:#e6edf3;font-size:1.5rem;font-weight:800;margin-bottom:0.5rem;line-height:1.2}',
      '.sc-pro-gate-modal h2 span{background:linear-gradient(135deg,#58a6ff,#39d353);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',

      '.sc-pro-gate-modal p{color:#8b949e;font-size:0.9rem;margin-bottom:1.5rem;line-height:1.6}',

      '.sc-pro-gate-features{text-align:left;margin:0 auto 1.5rem;max-width:320px}',
      '.sc-pro-gate-features div{padding:0.3rem 0;font-size:0.85rem;color:#c9d1d9;display:flex;align-items:center;gap:0.5rem}',
      '.sc-pro-gate-features div::before{content:"\\2713";color:#39d353;font-weight:700;flex-shrink:0}',

      '.sc-pro-gate-cta{display:inline-flex;align-items:center;gap:0.5rem;padding:0.9rem 2.5rem;background:linear-gradient(135deg,#58a6ff,#388bfd);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;transition:all 0.25s;text-decoration:none;font-family:system-ui;animation:scProPulse 2s infinite 1s}',
      '.sc-pro-gate-cta:hover{transform:scale(1.05);box-shadow:0 8px 30px rgba(88,166,255,0.35)}',

      '.sc-pro-gate-alt{display:flex;align-items:center;justify-content:center;gap:1rem;margin-top:1rem}',
      '.sc-pro-gate-alt a{color:#8b949e;font-size:0.8rem;transition:color 0.2s;cursor:pointer;background:none;border:none;font-family:inherit}',
      '.sc-pro-gate-alt a:hover{color:#e6edf3}',

      '.sc-pro-gate-price{margin-top:0.8rem;font-size:0.8rem;color:#484f58}',
      '.sc-pro-gate-price strong{color:#39d353}',

      '@media(max-width:480px){.sc-pro-gate-modal{padding:1.5rem;border-radius:16px}.sc-pro-gate-modal h2{font-size:1.3rem}}'
    ].join('\n');
    document.head.appendChild(css);

    var overlay = document.createElement('div');
    overlay.id = 'sc-pro-gate-overlay';
    overlay.innerHTML =
      '<div class="sc-pro-gate-modal">' +
        '<div class="sc-pro-gate-badge">PRO EXCLUSIVE</div>' +
        '<div class="sc-pro-gate-icon">&#128274;</div>' +
        '<h2><span>' + escapeHtml(TOOL_NAME) + '</span> is a Pro tool</h2>' +
        '<p>Unlock this tool and 33 more exclusive pro tools, plus all ebooks ($200+ value), no ads, and priority updates.</p>' +
        '<div class="sc-pro-gate-features">' +
          '<div>34 exclusive pro tools</div>' +
          '<div>All ebooks included</div>' +
          '<div>No ads anywhere</div>' +
          '<div>Export to all formats</div>' +
          '<div>30-day money-back guarantee</div>' +
        '</div>' +
        '<a href="' + CHECKOUT_URL + '?plan=pro-annual&tool=' + encodeURIComponent(TOOL_NAME) + '" class="sc-pro-gate-cta">Upgrade to Pro &rarr;</a>' +
        '<div class="sc-pro-gate-price">Starting at <strong>$6.58/mo</strong> (billed annually) or <strong>$149 lifetime</strong></div>' +
        '<div class="sc-pro-gate-alt">' +
          '<a href="' + REDIRECT_URL + '">View all plans</a>' +
          '<span style="color:#30363d">|</span>' +
          '<a href="/" >Browse free tools</a>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // Prevent scroll
    document.body.style.overflow = 'hidden';

    // Track
    track('pro_gate_shown', { mode: 'hard', tool: TOOL_NAME });

    // CTA click tracking
    overlay.querySelector('.sc-pro-gate-cta').addEventListener('click', function () {
      track('pro_gate_cta_click', { mode: 'hard', tool: TOOL_NAME, action: 'upgrade' });
    });
  }

  // ── UI: Upgrade Banner (Soft Gate) ─────────────────────

  function showSoftGate() {
    var css = document.createElement('style');
    css.textContent = [
      '@keyframes scProBannerSlide{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}',

      '#sc-pro-gate-banner{position:fixed;top:0;left:0;right:0;z-index:10001;background:linear-gradient(90deg,#0d1117,#161b22,#0d1117);border-bottom:1px solid rgba(88,166,255,0.2);padding:0.7rem 1.5rem;display:flex;align-items:center;justify-content:center;gap:1rem;font-family:system-ui,-apple-system,sans-serif;animation:scProBannerSlide 0.5s ease;box-shadow:0 4px 20px rgba(0,0,0,0.4);flex-wrap:wrap}',

      '#sc-pro-gate-banner .sc-pgb-text{color:#e6edf3;font-size:0.85rem;font-weight:600}',
      '#sc-pro-gate-banner .sc-pgb-text span{background:linear-gradient(135deg,#58a6ff,#39d353);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800}',

      '#sc-pro-gate-banner .sc-pgb-cta{display:inline-flex;align-items:center;gap:0.4rem;padding:0.45rem 1.2rem;background:linear-gradient(135deg,#58a6ff,#388bfd);color:#fff;border:none;border-radius:20px;font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.25s;text-decoration:none;white-space:nowrap}',
      '#sc-pro-gate-banner .sc-pgb-cta:hover{transform:scale(1.05);box-shadow:0 4px 16px rgba(88,166,255,0.3)}',

      '#sc-pro-gate-banner .sc-pgb-close{background:none;border:none;color:#484f58;font-size:1.2rem;cursor:pointer;padding:0.2rem 0.5rem;transition:color 0.2s;flex-shrink:0}',
      '#sc-pro-gate-banner .sc-pgb-close:hover{color:#fff}',

      '@media(max-width:640px){#sc-pro-gate-banner{padding:0.5rem 1rem;gap:0.5rem}#sc-pro-gate-banner .sc-pgb-text{font-size:0.75rem}}'
    ].join('\n');
    document.head.appendChild(css);

    var trialText = '';
    if (isInTrial()) {
      var secsLeft = getTrialTimeLeft();
      var minsLeft = Math.ceil(secsLeft / 60);
      trialText = ' Trial: ' + minsLeft + 'min left.';
    }

    var banner = document.createElement('div');
    banner.id = 'sc-pro-gate-banner';
    banner.innerHTML =
      '<span class="sc-pgb-text">&#128274; <span>' + escapeHtml(TOOL_NAME) + '</span> is a Pro tool. Upgrade for full access to 34 exclusive tools + all ebooks.' + trialText + '</span>' +
      '<a href="' + CHECKOUT_URL + '?plan=pro-annual&tool=' + encodeURIComponent(TOOL_NAME) + '" class="sc-pgb-cta">Upgrade to Pro &rarr;</a>' +
      '<button class="sc-pgb-close" aria-label="Dismiss">&times;</button>';

    document.body.prepend(banner);

    // Close handler
    banner.querySelector('.sc-pgb-close').addEventListener('click', function () {
      banner.style.transform = 'translateY(-100%)';
      banner.style.opacity = '0';
      banner.style.transition = 'all 0.4s ease';
      try { sessionStorage.setItem('sc_pgb_dismissed', '1'); } catch (e) {}
      track('pro_gate_dismissed', { mode: 'soft', tool: TOOL_NAME });
      setTimeout(function () { banner.remove(); }, 500);
    });

    // CTA click tracking
    banner.querySelector('.sc-pgb-cta').addEventListener('click', function () {
      track('pro_gate_cta_click', { mode: 'soft', tool: TOOL_NAME, action: 'upgrade' });
    });

    track('pro_gate_shown', { mode: 'soft', tool: TOOL_NAME });
  }

  // ── HTML Escape ─────────────────────────────────────────
  function escapeHtml(s) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(s));
    return div.innerHTML;
  }

  // ── Main Gate Logic ─────────────────────────────────────
  function runGate() {
    // First check for Gumroad callback
    checkGumroadCallback();

    // If Pro, do nothing (full access)
    if (isPro()) {
      track('pro_gate_bypassed', { tool: TOOL_NAME, plan: lsGet('pro_plan') || 'referral' });

      // Add pro badge to page
      injectProBadge();
      return;
    }

    // If in trial, show soft gate regardless of mode
    if (isInTrial()) {
      // Don't re-show if dismissed this session
      try { if (sessionStorage.getItem('sc_pgb_dismissed') === '1') return; } catch (e) {}
      showSoftGate();
      return;
    }

    // Gate based on mode
    if (MODE === 'hard') {
      showHardGate();
    } else {
      // Soft mode: show banner unless dismissed this session
      try { if (sessionStorage.getItem('sc_pgb_dismissed') === '1') return; } catch (e) {}
      showSoftGate();
    }
  }

  // ── Pro Badge ───────────────────────────────────────────
  function injectProBadge() {
    var css = document.createElement('style');
    css.textContent = [
      '.sc-pro-badge{display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.7rem;background:linear-gradient(135deg,rgba(88,166,255,0.12),rgba(57,211,83,0.12));border:1px solid rgba(88,166,255,0.3);border-radius:20px;font-size:0.65rem;font-weight:800;color:#58a6ff;letter-spacing:1px;text-transform:uppercase;margin-left:0.5rem;vertical-align:middle}',
      '.sc-pro-badge::before{content:"";display:inline-block;width:6px;height:6px;background:linear-gradient(135deg,#58a6ff,#39d353);border-radius:50%}'
    ].join('\n');
    document.head.appendChild(css);

    var h1 = document.querySelector('h1');
    if (h1 && !h1.querySelector('.sc-pro-badge')) {
      var badge = document.createElement('span');
      badge.className = 'sc-pro-badge';
      badge.textContent = 'PRO';
      h1.appendChild(badge);
    }
  }

  // ── Initialize ──────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runGate);
  } else {
    runGate();
  }

  // ── Public API ──────────────────────────────────────────
  window.spunkProGate = {
    isPro: isPro,
    isInTrial: isInTrial,
    getProInfo: getProInfo,
    activatePro: activatePro,
    deactivatePro: deactivatePro,
    handleGumroadWebhook: handleGumroadWebhook,
    checkGumroadCallback: checkGumroadCallback,
    showHardGate: showHardGate,
    showSoftGate: showSoftGate
  };

  // ── Listen for postMessage from Gumroad embed ──────────
  // Gumroad sends a postMessage when purchase is complete
  window.addEventListener('message', function (event) {
    // Only accept from Gumroad domain
    if (!event.origin || event.origin.indexOf('gumroad.com') === -1) return;

    var data = event.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) { return; }
    }

    if (data && (data.post_type === 'sale' || data.action === 'purchase_complete')) {
      handleGumroadWebhook({
        sale_id: data.sale_id || data.id || 'gumroad-' + Date.now(),
        product_id: data.product_id || data.product_permalink || 'plan-pro-annual',
        email: data.email || data.buyer_email || ''
      });
    }
  });

})();
