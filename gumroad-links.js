/**
 * SPUNK.CODES -- Gumroad Revenue Integration Script
 * ===================================================
 * Drop-in script that:
 *   1. Maps ebook slugs to Gumroad product URLs
 *   2. Creates "Buy" button components that link to Gumroad checkout
 *   3. Tracks revenue events via GA4
 *   4. Tracks affiliate link attribution
 *
 * Usage:
 *   <script src="/gumroad-links.js"></script>
 *
 * Then in any page:
 *   <div data-gumroad-product="ebook-site-empire"></div>
 *
 * Or call programmatically:
 *   window.scGumroad.openCheckout('ebook-site-empire');
 */

(function () {
  'use strict';

  // ── Product Catalog ─────────────────────────────────────
  var GUMROAD_BASE = 'https://monkeyshine40.gumroad.com/l/';
  var STORE_FALLBACK = 'https://monkeyshine40.gumroad.com/l/mhmzrz';

  var products = {
    // Premium Ebooks
    'ebook-site-empire':          { url: GUMROAD_BASE + 'mhmzrz', price: '$39.99', name: 'The 120-Site Empire Blueprint' },
    'ebook-ai-automation':        { url: GUMROAD_BASE + 'mhmzrz', price: '$29.99', name: 'The AI Automation Playbook' },
    'ebook-ai-agents':            { url: GUMROAD_BASE + 'mhmzrz', price: '$29.99', name: 'Building AI Agents' },
    'ebook-mcp-guide':            { url: GUMROAD_BASE + 'mhmzrz', price: '$24.99', name: 'The MCP Server Guide' },
    'ebook-vibe-coders-playbook': { url: GUMROAD_BASE + 'mhmzrz', price: '$29.99', name: "The Vibe Coder's Playbook" },
    'ebook-free-tools-money':     { url: GUMROAD_BASE + 'mhmzrz', price: '$19.99', name: 'Free Tools That Print Money' },
    'ebook-no-code-empire':       { url: GUMROAD_BASE + 'mhmzrz', price: '$19.99', name: 'The No-Code Empire' },
    'ebook-passive-income':       { url: GUMROAD_BASE + 'mhmzrz', price: '$19.99', name: 'The Passive Income Machine' },
    'ebook-automation-mastery':   { url: GUMROAD_BASE + 'mhmzrz', price: '$29.99', name: 'Automation Mastery' },

    // Free Ebooks (still link to Gumroad for lead capture)
    'ebook-prompt-engineering':   { url: GUMROAD_BASE + 'mhmzrz', price: 'Free',   name: 'Prompt Engineering Bible' },
    'ebook-seo-masterclass':      { url: GUMROAD_BASE + 'mhmzrz', price: 'Free',   name: 'SEO Masterclass 2026' },
    'ebook-crypto-trading':       { url: GUMROAD_BASE + 'mhmzrz', price: 'Free',   name: 'Crypto Trading for Beginners' },
    'ebook-vibe-coding':          { url: GUMROAD_BASE + 'mhmzrz', price: 'Free',   name: 'Vibe Coding Mastery' },
    'ebook-social-media-growth':  { url: GUMROAD_BASE + 'mhmzrz', price: 'Free',   name: 'Social Media Growth' },

    // Bundles
    'bundle-solo-founder':        { url: GUMROAD_BASE + 'mhmzrz', price: '$49.99', name: 'Solo Founder Pack' },
    'bundle-creator':             { url: GUMROAD_BASE + 'mhmzrz', price: '$39.99', name: 'Creator Pack' },
    'bundle-full-access':         { url: GUMROAD_BASE + 'mhmzrz', price: '$79.99', name: 'Full Access Bundle' },
    'bundle-everything':          { url: GUMROAD_BASE + 'mhmzrz', price: '$99.00', name: 'Everything Bundle' },

    // Plans
    'plan-pro-monthly':           { url: GUMROAD_BASE + 'mhmzrz', price: '$19/mo', name: 'Pro Monthly' },
    'plan-pro-annual':            { url: GUMROAD_BASE + 'mhmzrz', price: '$99/yr', name: 'Pro Annual' },
    'plan-lifetime':              { url: GUMROAD_BASE + 'mhmzrz', price: '$199',   name: 'Lifetime Access' }
  };

  // ── GA4 Event Tracking ──────────────────────────────────
  function trackEvent(action, params) {
    if (typeof gtag === 'function') {
      gtag('event', action, params || {});
    }
  }

  // ── Affiliate Attribution ───────────────────────────────
  function getRefCode() {
    try {
      var code = localStorage.getItem('spunkart_ref') || localStorage.getItem('sc_aff_ref_code') || '';
      return code;
    } catch (e) {
      return '';
    }
  }

  function buildCheckoutUrl(productKey) {
    var product = products[productKey];
    if (!product) return STORE_FALLBACK;

    var url = product.url;
    var ref = getRefCode();

    // Append referral code if present
    if (ref) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + 'ref=' + encodeURIComponent(ref);
    }

    return url;
  }

  // ── Open Checkout ───────────────────────────────────────
  function openCheckout(productKey) {
    var product = products[productKey];
    var url = buildCheckoutUrl(productKey);
    var name = product ? product.name : productKey;
    var price = product ? product.price : 'N/A';

    // Track the click
    trackEvent('begin_checkout', {
      payment_type: 'gumroad',
      item_name: name,
      item_id: productKey,
      price: price,
      referral_code: getRefCode(),
      source: window.location.pathname
    });

    // Track as conversion event
    trackEvent('purchase_intent', {
      product: productKey,
      value: price,
      currency: 'USD'
    });

    // Open Gumroad checkout
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // ── Buy Button Component ────────────────────────────────
  function createBuyButton(productKey, options) {
    options = options || {};
    var product = products[productKey];
    if (!product) return null;

    var isFree = product.price === 'Free';

    var btn = document.createElement('a');
    btn.href = buildCheckoutUrl(productKey);
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.className = options.className || 'sc-gumroad-btn';

    // Default styles
    var btnStyle = [
      'display:inline-flex',
      'align-items:center',
      'gap:8px',
      'padding:10px 24px',
      'border-radius:10px',
      'font-weight:700',
      'font-size:0.9rem',
      'font-family:system-ui,-apple-system,sans-serif',
      'cursor:pointer',
      'transition:all 0.25s',
      'text-decoration:none',
      'border:none',
      'white-space:nowrap'
    ];

    if (isFree) {
      btnStyle.push('background:rgba(57,211,83,0.1)');
      btnStyle.push('border:1px solid rgba(57,211,83,0.25)');
      btnStyle.push('color:#39d353');
    } else {
      btnStyle.push('background:linear-gradient(135deg,#58a6ff,#388bfd)');
      btnStyle.push('color:#fff');
    }

    if (!options.className) {
      btn.style.cssText = btnStyle.join(';');
    }

    btn.innerHTML = (isFree ? 'Read Free' : 'Buy ' + product.price) + ' &#8594;';

    if (options.showName) {
      btn.innerHTML = product.name + ' - ' + btn.innerHTML;
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openCheckout(productKey);
    });

    // Track impression
    trackEvent('product_view', {
      item_name: product.name,
      item_id: productKey,
      price: product.price,
      source: window.location.pathname
    });

    return btn;
  }

  // ── Auto-init Buy Buttons ───────────────────────────────
  function initButtons() {
    var targets = document.querySelectorAll('[data-gumroad-product]');
    targets.forEach(function (el) {
      var productKey = el.getAttribute('data-gumroad-product');
      var showName = el.hasAttribute('data-show-name');
      var className = el.getAttribute('data-btn-class') || '';

      var btn = createBuyButton(productKey, {
        showName: showName,
        className: className
      });

      if (btn) {
        el.appendChild(btn);
      }
    });
  }

  // ── Inject Hover Styles ─────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '.sc-gumroad-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(88,166,255,0.3);opacity:0.95}',
    '.sc-gumroad-btn:active{transform:translateY(0)}'
  ].join('\n');
  document.head.appendChild(style);

  // ── Initialize on DOM Ready ─────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButtons);
  } else {
    initButtons();
  }

  // ── Track Page-Level Revenue Events ─────────────────────
  (function trackPageRevenue() {
    var path = window.location.pathname;

    // Track ebook page views as potential revenue
    if (path.indexOf('ebook-') !== -1) {
      var slug = path.replace(/^\//, '').replace(/\.html$/, '');
      var product = products[slug];
      if (product) {
        trackEvent('view_item', {
          item_name: product.name,
          item_id: slug,
          price: product.price,
          currency: 'USD',
          item_category: 'ebook'
        });
      }
    }

    // Track pricing page views
    if (path.indexOf('pricing') !== -1) {
      trackEvent('view_pricing', {
        source: document.referrer || 'direct'
      });
    }

    // Track store page views
    if (path.indexOf('store') !== -1) {
      trackEvent('view_store', {
        source: document.referrer || 'direct'
      });
    }
  })();

  // ── Expose Public API ───────────────────────────────────
  window.scGumroad = {
    products: products,
    openCheckout: openCheckout,
    createBuyButton: createBuyButton,
    buildCheckoutUrl: buildCheckoutUrl,
    getRefCode: getRefCode
  };

})();
