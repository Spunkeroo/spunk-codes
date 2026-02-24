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
 *   7. SPUNK referral code: unlocks 5 starter tools for free
 *   8. Tiered referral system: 0=5 tools, 3 refs=15 tools, 5 refs=all tools
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
 *
 * Referral system stored as:
 *   localStorage 'spunk_referral_unlocked' = 'true'
 *   localStorage 'spunk_referral_date' = timestamp
 *   localStorage 'spunk_referral_link' = full referral URL
 *   localStorage 'spunk_referral_id' = SPUNK_XXXXXX
 *   localStorage 'spunk_referral_count' = number of referrals
 *   localStorage 'spunk_referral_tier' = 'starter' | 'growth' | 'unlimited'
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

  // ── Referral System Config ────────────────────────────
  var SPUNK_CODE = 'SPUNK';

  // The 5 starter tools unlocked by SPUNK code
  var STARTER_TOOLS = [
    'social-media-scheduler',
    'email-automation-builder',
    'workflow-automator',
    'content-repurposer',
    'seo-keyword-cluster'
  ];

  // Growth tier: 15 tools (starter + 10 more)
  var GROWTH_TOOLS = STARTER_TOOLS.concat([
    'pitch-deck-builder',
    'competitor-intel',
    'revenue-dashboard',
    'api-doc-generator',
    'color-system-builder',
    'burn-rate-analyzer',
    'brand-strategy-pro',
    'ad-spend-optimizer',
    'css-animation-studio',
    'sprint-velocity-tracker'
  ]);

  // Referral tiers
  var REFERRAL_TIERS = {
    starter:   { min: 0, tools: 5,   label: 'Starter',   toolList: STARTER_TOOLS },
    growth:    { min: 3, tools: 15,  label: 'Growth',    toolList: GROWTH_TOOLS },
    unlimited: { min: 5, tools: 95,  label: 'Unlimited', toolList: null } // null = all tools
  };

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

  // ── Referral ID Generator ─────────────────────────────
  function generateReferralId() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var id = '';
    for (var i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'SPUNK_' + id;
  }

  // ── Get current tool slug ─────────────────────────────
  function getCurrentToolSlug() {
    var path = window.location.pathname;
    // Extract slug from paths like /exclusive/tool-name or /exclusive/tool-name/index.html
    var match = path.match(/\/exclusive\/([a-z0-9-]+)/);
    return match ? match[1] : '';
  }

  // ── Referral Tier Check ───────────────────────────────
  function getReferralTier() {
    var count = parseInt(lsGet('referral_count') || '0', 10);
    if (count >= REFERRAL_TIERS.unlimited.min) return 'unlimited';
    if (count >= REFERRAL_TIERS.growth.min) return 'growth';
    return 'starter';
  }

  function getReferralCount() {
    return parseInt(lsGet('referral_count') || '0', 10);
  }

  // ── Check if tool is unlocked via referral ────────────
  function isToolUnlockedByReferral(toolSlug) {
    if (lsGet('referral_unlocked') !== 'true') return false;

    var tier = getReferralTier();
    if (tier === 'unlimited') return true;

    var tierData = REFERRAL_TIERS[tier];
    if (!tierData || !tierData.toolList) return false;

    return tierData.toolList.indexOf(toolSlug) !== -1;
  }

  // ── Process SPUNK Code ────────────────────────────────
  function processSpunkCode() {
    // Already processed?
    if (lsGet('referral_unlocked') === 'true') return true;

    // Store referral data
    lsSet('referral_unlocked', 'true');
    lsSet('referral_date', Date.now().toString());
    lsSet('referral_code', SPUNK_CODE);
    lsSet('referral_count', '0');
    lsSet('referral_tier', 'starter');

    // Generate unique referral link
    var refId = generateReferralId();
    lsSet('referral_id', refId);
    lsSet('referral_link', 'https://spunk.codes/?ref=' + refId);

    // Track via GA4
    track('referral_unlock', { code: SPUNK_CODE, referral_id: refId });

    return true;
  }

  // ── Show Welcome Message ──────────────────────────────
  function showReferralWelcome() {
    var refId = lsGet('referral_id') || generateReferralId();
    var refLink = 'https://spunk.codes/?ref=' + refId;

    var css = document.createElement('style');
    css.textContent = [
      '@keyframes scRefFadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}',
      '#sc-referral-welcome{position:fixed;bottom:24px;right:24px;z-index:10003;background:linear-gradient(145deg,#161b22,#0d1117);border:1px solid rgba(57,211,83,0.3);border-radius:16px;padding:1.5rem;max-width:380px;width:calc(100% - 48px);animation:scRefFadeIn 0.5s ease;box-shadow:0 16px 60px rgba(0,0,0,0.5),0 0 30px rgba(57,211,83,0.06);font-family:system-ui,-apple-system,sans-serif}',
      '#sc-referral-welcome .sc-rw-badge{display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.7rem;background:rgba(57,211,83,0.12);border:1px solid rgba(57,211,83,0.3);border-radius:20px;font-size:0.65rem;font-weight:800;color:#39d353;letter-spacing:1px;text-transform:uppercase;margin-bottom:0.75rem}',
      '#sc-referral-welcome h3{color:#e6edf3;font-size:1.1rem;font-weight:800;margin:0 0 0.5rem;line-height:1.3}',
      '#sc-referral-welcome h3 span{color:#39d353}',
      '#sc-referral-welcome p{color:#8b949e;font-size:0.82rem;line-height:1.5;margin:0 0 1rem}',
      '#sc-referral-welcome .sc-rw-link{display:flex;gap:0.5rem;margin-bottom:0.75rem}',
      '#sc-referral-welcome .sc-rw-link input{flex:1;background:rgba(13,17,23,0.8);border:1px solid rgba(48,54,61,0.6);border-radius:8px;padding:0.4rem 0.6rem;color:#58a6ff;font-size:0.75rem;font-family:monospace;outline:none}',
      '#sc-referral-welcome .sc-rw-link button{padding:0.4rem 0.8rem;background:linear-gradient(135deg,#58a6ff,#388bfd);color:#fff;border:none;border-radius:8px;font-size:0.75rem;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap}',
      '#sc-referral-welcome .sc-rw-link button:hover{transform:scale(1.05)}',
      '#sc-referral-welcome .sc-rw-actions{display:flex;gap:0.5rem;align-items:center}',
      '#sc-referral-welcome .sc-rw-dashboard{color:#58a6ff;font-size:0.8rem;font-weight:600;text-decoration:none;transition:color 0.2s}',
      '#sc-referral-welcome .sc-rw-dashboard:hover{color:#79c0ff}',
      '#sc-referral-welcome .sc-rw-close{margin-left:auto;background:none;border:none;color:#484f58;font-size:1.2rem;cursor:pointer;padding:0.2rem 0.5rem;transition:color 0.2s}',
      '#sc-referral-welcome .sc-rw-close:hover{color:#e6edf3}',
      '@media(max-width:480px){#sc-referral-welcome{bottom:12px;right:12px;left:12px;width:auto;max-width:none;padding:1.2rem}}'
    ].join('\n');
    document.head.appendChild(css);

    var welcome = document.createElement('div');
    welcome.id = 'sc-referral-welcome';
    welcome.innerHTML =
      '<div class="sc-rw-badge">SPUNK NETWORK</div>' +
      '<h3>Welcome to the <span>Spunk Network!</span></h3>' +
      '<p>You\'ve unlocked 5 free automation tools. Share your referral link to unlock more!</p>' +
      '<div class="sc-rw-link">' +
        '<input type="text" value="' + refLink + '" readonly id="sc-rw-link-input">' +
        '<button id="sc-rw-copy-btn">Copy</button>' +
      '</div>' +
      '<div class="sc-rw-actions">' +
        '<a href="/referral-dashboard.html" class="sc-rw-dashboard">View Dashboard &rarr;</a>' +
        '<button class="sc-rw-close" aria-label="Close" id="sc-rw-close">&times;</button>' +
      '</div>';

    document.body.appendChild(welcome);

    // Copy handler
    document.getElementById('sc-rw-copy-btn').addEventListener('click', function() {
      var input = document.getElementById('sc-rw-link-input');
      input.select();
      try {
        navigator.clipboard.writeText(input.value);
      } catch(e) {
        document.execCommand('copy');
      }
      this.textContent = 'Copied!';
      var self = this;
      setTimeout(function() { self.textContent = 'Copy'; }, 2000);
      track('referral_link_copied', { source: 'welcome_popup' });
    });

    // Close handler
    document.getElementById('sc-rw-close').addEventListener('click', function() {
      welcome.style.opacity = '0';
      welcome.style.transform = 'translateY(20px)';
      welcome.style.transition = 'all 0.3s ease';
      setTimeout(function() { welcome.remove(); }, 300);
      lsSet('referral_welcome_shown', 'true');
    });

    // Auto-hide after 15 seconds
    setTimeout(function() {
      if (document.getElementById('sc-referral-welcome')) {
        welcome.style.opacity = '0';
        welcome.style.transform = 'translateY(20px)';
        welcome.style.transition = 'all 0.3s ease';
        setTimeout(function() { if (welcome.parentNode) welcome.remove(); }, 300);
      }
    }, 15000);
  }

  // ── Check URL for ?code=SPUNK or ?ref=SPUNK_XXXXXX ──
  function checkReferralParams() {
    var params = new URLSearchParams(window.location.search);
    var code = params.get('code');
    var ref = params.get('ref');

    // Handle ?code=SPUNK
    if (code && code.toUpperCase() === SPUNK_CODE) {
      var isNew = lsGet('referral_unlocked') !== 'true';
      processSpunkCode();

      // Clean URL
      if (window.history && window.history.replaceState) {
        params.delete('code');
        var clean = window.location.pathname;
        var remaining = params.toString();
        if (remaining) clean += '?' + remaining;
        clean += window.location.hash;
        window.history.replaceState({}, '', clean);
      }

      // Show welcome only for new users
      if (isNew) {
        setTimeout(showReferralWelcome, 500);
      }

      return true;
    }

    // Handle ?ref=SPUNK_XXXXXX (someone using a referral link)
    if (ref && ref.indexOf('SPUNK_') === 0) {
      // Track this referral
      track('referral_visit', { referrer_id: ref, page: window.location.pathname });

      // Store the referrer so we can count it
      lsSet('referred_by', ref);

      // Auto-apply SPUNK code for the new visitor
      var isNewVisitor = lsGet('referral_unlocked') !== 'true';
      processSpunkCode();

      // Increment referral count for the referrer (tracked locally for demo, would be server-side in production)
      // For the referrer's own tracking, this gets handled when they visit the dashboard
      try {
        var referralLog = JSON.parse(localStorage.getItem('sc_referral_log') || '[]');
        referralLog.push({
          referrer: ref,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        });
        localStorage.setItem('sc_referral_log', JSON.stringify(referralLog));
      } catch(e) {}

      // Clean URL
      if (window.history && window.history.replaceState) {
        params.delete('ref');
        var clean2 = window.location.pathname;
        var remaining2 = params.toString();
        if (remaining2) clean2 += '?' + remaining2;
        clean2 += window.location.hash;
        window.history.replaceState({}, '', clean2);
      }

      if (isNewVisitor) {
        setTimeout(showReferralWelcome, 500);
      }

      return true;
    }

    return false;
  }

  // ── Pro Status Check ────────────────────────────────────

  /**
   * Returns true if the user has active Pro access.
   * Checks multiple signals:
   *   1. spunk_pro = 'true'
   *   2. Full pro (paid) — unlocks everything
   *   3. SPUNK referral — unlocks only allowed tools per tier
   */
  function isPro() {
    // Direct pro flag (paid plan)
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

    // SPUNK referral code — check if THIS specific tool is unlocked
    var currentSlug = getCurrentToolSlug();
    if (currentSlug && isToolUnlockedByReferral(currentSlug)) {
      return true;
    }

    // Legacy: master referral code check (backwards compat)
    var refCode = lsGet('referral_code');
    if (refCode && refCode.toUpperCase() === SPUNK_CODE && currentSlug) {
      // Only allow if tool is in the allowed list for their tier
      return isToolUnlockedByReferral(currentSlug);
    }

    // Check referral system too (legacy)
    try {
      var refCode2 = localStorage.getItem('spunk_ref_code');
      if (refCode2 && refCode2.toUpperCase() === SPUNK_CODE && currentSlug) {
        return isToolUnlockedByReferral(currentSlug);
      }
    } catch (e) {}

    return false;
  }

  /**
   * Returns true if user has SPUNK referral access (any tier)
   */
  function hasReferralAccess() {
    return lsGet('referral_unlocked') === 'true';
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
      isTrial: isInTrial(),
      hasReferral: hasReferralAccess(),
      referralTier: getReferralTier(),
      referralCount: getReferralCount(),
      referralId: lsGet('referral_id') || null,
      referralLink: lsGet('referral_link') || null
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

      '.sc-pro-gate-ref{display:inline-flex;align-items:center;gap:0.5rem;padding:0.7rem 2rem;background:transparent;color:#39d353;border:1px solid rgba(57,211,83,0.3);border-radius:12px;font-size:0.9rem;font-weight:700;cursor:pointer;transition:all 0.25s;text-decoration:none;font-family:system-ui;margin-top:0.75rem}',
      '.sc-pro-gate-ref:hover{background:rgba(57,211,83,0.08);transform:scale(1.03)}',

      '.sc-pro-gate-alt{display:flex;align-items:center;justify-content:center;gap:1rem;margin-top:1rem}',
      '.sc-pro-gate-alt a{color:#8b949e;font-size:0.8rem;transition:color 0.2s;cursor:pointer;background:none;border:none;font-family:inherit}',
      '.sc-pro-gate-alt a:hover{color:#e6edf3}',

      '.sc-pro-gate-price{margin-top:0.8rem;font-size:0.8rem;color:#484f58}',
      '.sc-pro-gate-price strong{color:#39d353}',

      '.sc-pro-gate-divider{margin:1rem 0;padding:0;border:none;border-top:1px solid rgba(48,54,61,0.5);color:#484f58;font-size:0.75rem;text-align:center;position:relative}',
      '.sc-pro-gate-divider span{background:#0d1117;padding:0 0.75rem;position:relative;top:-0.6rem;color:#484f58;font-size:0.75rem}',

      '@media(max-width:480px){.sc-pro-gate-modal{padding:1.5rem;border-radius:16px}.sc-pro-gate-modal h2{font-size:1.3rem}}'
    ].join('\n');
    document.head.appendChild(css);

    var currentSlug = getCurrentToolSlug();
    var isStarterTool = STARTER_TOOLS.indexOf(currentSlug) !== -1;
    var refSection = '';

    if (isStarterTool) {
      refSection =
        '<div class="sc-pro-gate-divider"><span>OR GET IT FREE</span></div>' +
        '<a href="' + window.location.pathname + '?code=SPUNK" class="sc-pro-gate-ref">Enter code SPUNK for free access &rarr;</a>' +
        '<p style="font-size:0.75rem;color:#484f58;margin-top:0.5rem;margin-bottom:0">This is one of 5 free starter tools</p>';
    }

    var overlay = document.createElement('div');
    overlay.id = 'sc-pro-gate-overlay';
    overlay.innerHTML =
      '<div class="sc-pro-gate-modal">' +
        '<div class="sc-pro-gate-badge">PRO EXCLUSIVE</div>' +
        '<div class="sc-pro-gate-icon">&#128274;</div>' +
        '<h2><span>' + escapeHtml(TOOL_NAME) + '</span> is a Pro tool</h2>' +
        '<p>Unlock this tool and 33 more exclusive pro tools, plus all ebooks ($200+ value), no ads, and priority updates.</p>' +
        '<div class="sc-pro-gate-features">' +
          '<div>75 exclusive pro tools</div>' +
          '<div>All ebooks included</div>' +
          '<div>No ads anywhere</div>' +
          '<div>Export to all formats</div>' +
          '<div>30-day money-back guarantee</div>' +
        '</div>' +
        '<a href="' + CHECKOUT_URL + '?plan=pro-annual&tool=' + encodeURIComponent(TOOL_NAME) + '" class="sc-pro-gate-cta">Upgrade to Pro &rarr;</a>' +
        '<div class="sc-pro-gate-price">Starting at <strong>$6.58/mo</strong> (billed annually) or <strong>$149 lifetime</strong></div>' +
        refSection +
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
    track('pro_gate_shown', { mode: 'hard', tool: TOOL_NAME, is_starter: isStarterTool });

    // CTA click tracking
    overlay.querySelector('.sc-pro-gate-cta').addEventListener('click', function () {
      track('pro_gate_cta_click', { mode: 'hard', tool: TOOL_NAME, action: 'upgrade' });
    });

    // Referral link click tracking
    var refBtn = overlay.querySelector('.sc-pro-gate-ref');
    if (refBtn) {
      refBtn.addEventListener('click', function(e) {
        e.preventDefault();
        processSpunkCode();
        // Remove overlay and reload gate
        overlay.remove();
        document.body.style.overflow = '';
        track('referral_code_used_from_gate', { tool: TOOL_NAME });
        // Re-run gate logic (will now pass since tool is unlocked)
        runGate();
      });
    }
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

      '#sc-pro-gate-banner .sc-pgb-ref{color:#39d353;font-size:0.8rem;font-weight:600;cursor:pointer;background:none;border:none;text-decoration:underline;white-space:nowrap;font-family:system-ui,-apple-system,sans-serif}',
      '#sc-pro-gate-banner .sc-pgb-ref:hover{color:#56e06a}',

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

    var currentSlug = getCurrentToolSlug();
    var isStarterTool = STARTER_TOOLS.indexOf(currentSlug) !== -1;
    var refButton = isStarterTool
      ? '<button class="sc-pgb-ref" id="sc-pgb-ref-btn">or use code SPUNK (free)</button>'
      : '';

    var banner = document.createElement('div');
    banner.id = 'sc-pro-gate-banner';
    banner.innerHTML =
      '<span class="sc-pgb-text">&#128274; <span>' + escapeHtml(TOOL_NAME) + '</span> is a Pro tool. Upgrade for full access to 75 exclusive tools + all ebooks.' + trialText + '</span>' +
      '<a href="' + CHECKOUT_URL + '?plan=pro-annual&tool=' + encodeURIComponent(TOOL_NAME) + '" class="sc-pgb-cta">Upgrade to Pro &rarr;</a>' +
      refButton +
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

    // Referral button handler
    var refBtnEl = document.getElementById('sc-pgb-ref-btn');
    if (refBtnEl) {
      refBtnEl.addEventListener('click', function() {
        processSpunkCode();
        banner.remove();
        track('referral_code_used_from_banner', { tool: TOOL_NAME });
        injectProBadge();
        showReferralWelcome();
      });
    }

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
    // First check for referral params
    checkReferralParams();

    // Then check for Gumroad callback
    checkGumroadCallback();

    // If Pro, do nothing (full access)
    if (isPro()) {
      track('pro_gate_bypassed', { tool: TOOL_NAME, plan: lsGet('pro_plan') || 'referral' });

      // Add pro badge to page
      injectProBadge();

      // If referral user on a starter tool, show referral badge instead
      if (hasReferralAccess() && !lsGet('pro_plan')) {
        injectReferralBadge();
      }
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

  // ── Referral Badge ────────────────────────────────────
  function injectReferralBadge() {
    var css = document.createElement('style');
    css.textContent = [
      '.sc-ref-badge{display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.7rem;background:rgba(57,211,83,0.1);border:1px solid rgba(57,211,83,0.3);border-radius:20px;font-size:0.65rem;font-weight:800;color:#39d353;letter-spacing:1px;text-transform:uppercase;margin-left:0.5rem;vertical-align:middle;cursor:pointer;transition:all 0.2s}',
      '.sc-ref-badge:hover{background:rgba(57,211,83,0.15)}'
    ].join('\n');
    document.head.appendChild(css);

    var h1 = document.querySelector('h1');
    if (h1 && !h1.querySelector('.sc-ref-badge')) {
      var badge = document.createElement('a');
      badge.className = 'sc-ref-badge';
      badge.href = '/referral-dashboard.html';
      badge.textContent = 'SPUNK FREE';
      badge.title = 'Unlocked via SPUNK referral code';
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
    showSoftGate: showSoftGate,
    // Referral system API
    processSpunkCode: processSpunkCode,
    hasReferralAccess: hasReferralAccess,
    getReferralTier: getReferralTier,
    getReferralCount: getReferralCount,
    isToolUnlockedByReferral: isToolUnlockedByReferral,
    STARTER_TOOLS: STARTER_TOOLS,
    GROWTH_TOOLS: GROWTH_TOOLS,
    REFERRAL_TIERS: REFERRAL_TIERS
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
