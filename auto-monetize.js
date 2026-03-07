/**
 * SPUNK.CODES — Auto-Monetize Engine
 * ====================================
 * Drop-in script for ALL tool pages. Adds:
 *   1. Non-intrusive "Upgrade to Pro" bottom banner (free users only)
 *   2. Contextual affiliate recommendations based on tool category
 *   3. GA4 click tracking for all affiliate + CTA interactions
 *   4. Pro user detection via localStorage (hides all promos for Pro)
 *
 * Usage:
 *   <script src="/auto-monetize.js"></script>
 *
 * Optional data attributes on <body> or <html>:
 *   data-tool-category="dev|seo|design|email|ai|hosting|payments|social|crypto|general"
 *   data-tool-name="JSON Formatter"
 */

(function () {
  'use strict';

  /* ── CONFIG ── */
  var LS_PREFIX = 'sc_';
  var PRO_KEY = LS_PREFIX + 'pro_status';
  var DISMISS_KEY = LS_PREFIX + 'promo_dismissed';
  var DISMISS_DAYS = 3; // Re-show banner after 3 days
  var SHOW_DELAY = 4000; // ms before showing banner
  var AFFILIATE_DELAY = 6000; // ms before showing affiliate card

  /* ── AFFILIATE DATABASE ── */
  // Replace placeholder URLs with real affiliate links when available
  var affiliates = {
    hosting: [
      { name: 'Vercel Pro', desc: 'Deploy frontend instantly. Free tier + Pro for teams.', url: 'https://vercel.com/?ref=spunkcodes', cta: 'Try Vercel Free', icon: '&#9650;' },
      { name: 'Netlify', desc: 'Build, deploy, scale modern web projects.', url: 'https://www.netlify.com/?ref=spunkcodes', cta: 'Try Netlify', icon: '&#9889;' },
      { name: 'DigitalOcean', desc: '$200 free credit for new users. Deploy in seconds.', url: 'https://www.digitalocean.com/?refcode=spunkcodes', cta: 'Get $200 Credit', icon: '&#127754;' }
    ],
    email: [
      { name: 'ConvertKit', desc: 'Email marketing built for creators. Free up to 1K subs.', url: 'https://convertkit.com/?lmref=spunkcodes', cta: 'Start Free', icon: '&#9993;' },
      { name: 'Beehiiv', desc: 'Newsletter platform with built-in monetization.', url: 'https://www.beehiiv.com/?via=spunkcodes', cta: 'Try Beehiiv', icon: '&#127855;' },
      { name: 'Resend', desc: 'Modern email API for developers. Free tier included.', url: 'https://resend.com/?ref=spunkcodes', cta: 'Try Resend', icon: '&#128233;' }
    ],
    dev: [
      { name: 'GitHub Copilot', desc: 'AI pair programmer. Write code 55% faster.', url: 'https://github.com/features/copilot?ref=spunkcodes', cta: 'Try Copilot', icon: '&#129302;' },
      { name: 'JetBrains', desc: 'Professional IDEs for every language. Free trials.', url: 'https://www.jetbrains.com/?ref=spunkcodes', cta: 'Try JetBrains', icon: '&#128187;' },
      { name: 'Vercel Pro', desc: 'Deploy frontend instantly. Free tier + Pro for teams.', url: 'https://vercel.com/?ref=spunkcodes', cta: 'Try Vercel', icon: '&#9650;' }
    ],
    design: [
      { name: 'Canva Pro', desc: 'Design anything. Templates, brand kits, AI tools.', url: 'https://www.canva.com/pro/?ref=spunkcodes', cta: 'Try Canva Pro', icon: '&#127912;' },
      { name: 'Figma', desc: 'Collaborative design tool used by top teams.', url: 'https://www.figma.com/?ref=spunkcodes', cta: 'Try Figma', icon: '&#9998;' }
    ],
    seo: [
      { name: 'Ahrefs', desc: 'All-in-one SEO toolset. Backlinks, keywords, audits.', url: 'https://ahrefs.com/?ref=spunkcodes', cta: 'Try Ahrefs', icon: '&#128269;' },
      { name: 'SEMrush', desc: 'SEO, content marketing, competitor research in one tool.', url: 'https://www.semrush.com/?ref=spunkcodes', cta: 'Try SEMrush', icon: '&#128200;' }
    ],
    ai: [
      { name: 'Claude API', desc: 'Anthropic\'s powerful AI. Best for coding & analysis.', url: 'https://www.anthropic.com/?ref=spunkcodes', cta: 'Try Claude', icon: '&#129504;' },
      { name: 'OpenAI API', desc: 'GPT-4 and DALL-E. Industry standard AI platform.', url: 'https://platform.openai.com/?ref=spunkcodes', cta: 'Try OpenAI', icon: '&#127759;' }
    ],
    payments: [
      { name: 'Stripe', desc: 'Payment infrastructure for the internet. Start free.', url: 'https://stripe.com/?ref=spunkcodes', cta: 'Try Stripe', icon: '&#128179;' },
      { name: 'Gumroad', desc: 'Sell digital products in minutes. No monthly fee.', url: 'https://gumroad.com/?ref=spunkcodes', cta: 'Try Gumroad', icon: '&#128176;' }
    ],
    social: [
      { name: 'Canva Pro', desc: 'Design social media graphics, videos, and more.', url: 'https://www.canva.com/pro/?ref=spunkcodes', cta: 'Try Canva Pro', icon: '&#127912;' },
      { name: 'Beehiiv', desc: 'Grow your audience with newsletters.', url: 'https://www.beehiiv.com/?via=spunkcodes', cta: 'Try Beehiiv', icon: '&#127855;' }
    ],
    crypto: [
      { name: 'DigitalOcean', desc: 'Host crypto projects. $200 free credit.', url: 'https://www.digitalocean.com/?refcode=spunkcodes', cta: 'Get $200 Credit', icon: '&#127754;' },
      { name: 'Stripe', desc: 'Accept crypto & fiat payments.', url: 'https://stripe.com/?ref=spunkcodes', cta: 'Try Stripe', icon: '&#128179;' }
    ],
    general: [
      { name: 'GitHub Copilot', desc: 'AI pair programmer. Ship faster.', url: 'https://github.com/features/copilot?ref=spunkcodes', cta: 'Try Copilot', icon: '&#129302;' },
      { name: 'Canva Pro', desc: 'Design anything in minutes.', url: 'https://www.canva.com/pro/?ref=spunkcodes', cta: 'Try Canva', icon: '&#127912;' },
      { name: 'Vercel', desc: 'Deploy your projects instantly.', url: 'https://vercel.com/?ref=spunkcodes', cta: 'Try Vercel', icon: '&#9650;' }
    ]
  };

  /* ── TOOL NAME TO CATEGORY MAPPING ── */
  var toolCategoryMap = {
    'json': 'dev', 'api': 'dev', 'regex': 'dev', 'code': 'dev', 'jwt': 'dev',
    'docker': 'dev', 'git': 'dev', 'webhook': 'dev', 'base64': 'dev', 'yaml': 'dev',
    'markdown': 'dev', 'html': 'dev', 'css': 'dev', 'tailwind': 'dev', 'chmod': 'dev',
    'robots': 'dev', 'schema': 'dev', 'codebase': 'dev', 'slug': 'dev', 'placeholder': 'dev',
    'seo': 'seo', 'meta': 'seo', 'og': 'seo', 'sitemap': 'seo', 'keyword': 'seo',
    'backlink': 'seo', 'rank': 'seo',
    'color': 'design', 'font': 'design', 'gradient': 'design', 'favicon': 'design',
    'image': 'design', 'brand': 'design', 'palette': 'design', 'responsive': 'design',
    'screen': 'design',
    'email': 'email', 'newsletter': 'email', 'subject': 'email',
    'ai': 'ai', 'prompt': 'ai', 'writing': 'ai', 'gpt': 'ai', 'claude': 'ai',
    'tweet': 'social', 'social': 'social', 'hashtag': 'social', 'bio': 'social',
    'bluesky': 'social', 'youtube': 'social', 'tiktok': 'social',
    'pricing': 'payments', 'checkout': 'payments', 'invoice': 'payments',
    'commission': 'payments', 'revenue': 'payments', 'profit': 'payments',
    'crypto': 'crypto', 'bitcoin': 'crypto', 'wallet': 'crypto',
    'landing': 'hosting', 'deploy': 'hosting', 'domain': 'hosting', 'dns': 'hosting',
    'uptime': 'hosting', 'speed': 'hosting'
  };

  /* ── HELPERS ── */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  function isPro() {
    var status = lsGet(PRO_KEY);
    var spunkPro = lsGet('spunk_pro');
    return status === 'true' || status === 'pro' || status === 'lifetime' || spunkPro === 'true';
  }

  function isDismissed() {
    var ts = lsGet(DISMISS_KEY);
    if (!ts) return false;
    var elapsed = Date.now() - parseInt(ts, 10);
    return elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  }

  function track(action, label) {
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: 'auto_monetize',
        event_label: label || ''
      });
    }
  }

  function detectCategory() {
    // Check data attribute first
    var cat = document.body.getAttribute('data-tool-category') ||
              document.documentElement.getAttribute('data-tool-category');
    if (cat && affiliates[cat]) return cat;

    // Detect from URL / page title
    var path = window.location.pathname.toLowerCase();
    var title = (document.title || '').toLowerCase();
    var combined = path + ' ' + title;

    var keys = Object.keys(toolCategoryMap);
    for (var i = 0; i < keys.length; i++) {
      if (combined.indexOf(keys[i]) !== -1) {
        return toolCategoryMap[keys[i]];
      }
    }
    return 'general';
  }

  function getToolName() {
    var name = document.body.getAttribute('data-tool-name') ||
               document.documentElement.getAttribute('data-tool-name');
    if (name) return name;
    // Extract from title
    var title = document.title || '';
    var parts = title.split('|');
    if (parts.length > 1) return parts[0].trim();
    parts = title.split(' - ');
    if (parts.length > 1) return parts[0].trim();
    parts = title.split('—');
    if (parts.length > 1) return parts[0].trim();
    return title.trim();
  }

  /* ── Skip on certain pages ── */
  var skipPages = ['pricing', 'checkout', 'ebook-store', 'network-hub', 'revenue-dashboard', 'automation-status', 'advertise', 'affiliat', 'reseller'];
  var currentPath = window.location.pathname.toLowerCase();
  for (var i = 0; i < skipPages.length; i++) {
    if (currentPath.indexOf(skipPages[i]) !== -1) return;
  }

  /* ── Don't show anything to Pro users ── */
  if (isPro()) return;

  /* ── INJECT STYLES ── */
  var css = document.createElement('style');
  css.textContent = [
    /* Pro Banner */
    '@keyframes scMonSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}',
    '.sc-mon-banner{position:fixed;bottom:0;left:0;right:0;z-index:9998;animation:scMonSlideUp 0.5s ease forwards;font-family:system-ui,-apple-system,sans-serif}',
    '.sc-mon-banner-inner{max-width:1000px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:0.8rem 1.5rem;background:rgba(13,17,23,0.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(88,166,255,0.2);border-left:1px solid rgba(48,54,61,0.3);border-right:1px solid rgba(48,54,61,0.3);border-radius:16px 16px 0 0}',
    '.sc-mon-banner-text{font-size:0.82rem;color:#8b949e;line-height:1.4}',
    '.sc-mon-banner-text strong{color:#e6edf3;font-weight:700}',
    '.sc-mon-banner-text em{color:#58a6ff;font-style:normal;font-weight:600}',
    '.sc-mon-banner-cta{flex-shrink:0;display:inline-flex;align-items:center;gap:0.4rem;padding:0.55rem 1.2rem;background:linear-gradient(135deg,#58a6ff,#39d353);color:#fff;font-size:0.8rem;font-weight:700;border:none;border-radius:10px;cursor:pointer;transition:all 0.3s;text-decoration:none;white-space:nowrap}',
    '.sc-mon-banner-cta:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(88,166,255,0.3)}',
    '.sc-mon-banner-close{background:none;border:none;color:#484f58;font-size:1.2rem;cursor:pointer;padding:0.3rem;line-height:1;transition:color 0.2s;flex-shrink:0}',
    '.sc-mon-banner-close:hover{color:#fff}',

    /* Affiliate Card */
    '@keyframes scAffFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
    '.sc-mon-aff{position:fixed;bottom:70px;right:16px;z-index:9997;width:280px;animation:scAffFadeIn 0.4s ease forwards;font-family:system-ui,-apple-system,sans-serif}',
    '.sc-mon-aff-card{background:rgba(13,17,23,0.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(48,54,61,0.5);border-radius:14px;padding:1rem;transition:all 0.3s}',
    '.sc-mon-aff-card:hover{border-color:rgba(88,166,255,0.3);box-shadow:0 8px 30px rgba(0,0,0,0.3)}',
    '.sc-mon-aff-header{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem}',
    '.sc-mon-aff-icon{font-size:1.2rem}',
    '.sc-mon-aff-name{font-size:0.85rem;font-weight:700;color:#e6edf3}',
    '.sc-mon-aff-label{font-size:0.6rem;color:#484f58;margin-left:auto;text-transform:uppercase;letter-spacing:0.5px;font-weight:600}',
    '.sc-mon-aff-desc{font-size:0.78rem;color:#8b949e;line-height:1.4;margin-bottom:0.7rem}',
    '.sc-mon-aff-btn{display:block;text-align:center;padding:0.5rem;background:rgba(88,166,255,0.1);border:1px solid rgba(88,166,255,0.2);border-radius:8px;color:#58a6ff;font-size:0.78rem;font-weight:700;text-decoration:none;transition:all 0.2s}',
    '.sc-mon-aff-btn:hover{background:rgba(88,166,255,0.2);border-color:rgba(88,166,255,0.4)}',
    '.sc-mon-aff-close{position:absolute;top:6px;right:8px;background:none;border:none;color:#484f58;font-size:0.9rem;cursor:pointer;padding:2px;line-height:1}',
    '.sc-mon-aff-close:hover{color:#fff}',

    '@media(max-width:640px){',
    '  .sc-mon-banner-inner{flex-wrap:wrap;padding:0.7rem 1rem;border-radius:12px 12px 0 0}',
    '  .sc-mon-banner-text{font-size:0.75rem}',
    '  .sc-mon-aff{right:8px;left:8px;width:auto;bottom:60px}',
    '}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── PRO BANNER ── */
  if (!isDismissed()) {
    setTimeout(function () {
      if (isPro()) return; // Re-check in case they upgraded

      var banner = document.createElement('div');
      banner.className = 'sc-mon-banner';
      banner.innerHTML =
        '<div class="sc-mon-banner-inner">' +
          '<div class="sc-mon-banner-text">' +
            '<strong>Like this tool?</strong> Get <em>330 exclusive tools</em>, 33 ebooks, and priority features with <em>Pro</em> &mdash; from $9.97/mo' +
          '</div>' +
          '<a href="/pricing" class="sc-mon-banner-cta" id="sc-mon-cta">Upgrade to Pro &rarr;</a>' +
          '<button class="sc-mon-banner-close" id="sc-mon-close" aria-label="Dismiss">&times;</button>' +
        '</div>';
      document.body.appendChild(banner);
      track('pro_banner_view', getToolName());

      document.getElementById('sc-mon-cta').addEventListener('click', function () {
        track('pro_banner_click', getToolName());
      });

      document.getElementById('sc-mon-close').addEventListener('click', function () {
        banner.style.transform = 'translateY(100%)';
        banner.style.opacity = '0';
        banner.style.transition = 'all 0.4s ease';
        lsSet(DISMISS_KEY, String(Date.now()));
        track('pro_banner_dismiss', getToolName());
        setTimeout(function () { banner.remove(); }, 500);
      });
    }, SHOW_DELAY);
  }

  /* ── AFFILIATE RECOMMENDATION ── */
  setTimeout(function () {
    if (isPro()) return;

    var category = detectCategory();
    var options = affiliates[category] || affiliates.general;
    // Pick a random affiliate from the category
    var pick = options[Math.floor(Math.random() * options.length)];

    var card = document.createElement('div');
    card.className = 'sc-mon-aff';
    card.style.position = 'relative';
    card.innerHTML =
      '<div class="sc-mon-aff-card">' +
        '<button class="sc-mon-aff-close" id="sc-aff-close" aria-label="Close">&times;</button>' +
        '<div class="sc-mon-aff-header">' +
          '<span class="sc-mon-aff-icon">' + pick.icon + '</span>' +
          '<span class="sc-mon-aff-name">' + pick.name + '</span>' +
          '<span class="sc-mon-aff-label">Recommended</span>' +
        '</div>' +
        '<div class="sc-mon-aff-desc">' + pick.desc + '</div>' +
        '<a href="' + pick.url + '" target="_blank" rel="noopener sponsored" class="sc-mon-aff-btn" id="sc-aff-link">' + pick.cta + '</a>' +
      '</div>';
    document.body.appendChild(card);
    track('affiliate_card_view', pick.name + ' | ' + category);

    document.getElementById('sc-aff-link').addEventListener('click', function () {
      track('affiliate_card_click', pick.name + ' | ' + category + ' | ' + getToolName());
    });

    document.getElementById('sc-aff-close').addEventListener('click', function () {
      card.style.opacity = '0';
      card.style.transform = 'translateY(8px)';
      card.style.transition = 'all 0.3s ease';
      track('affiliate_card_dismiss', pick.name);
      setTimeout(function () { card.remove(); }, 400);
    });

    // Auto-hide after 30 seconds
    setTimeout(function () {
      if (card.parentNode) {
        card.style.opacity = '0';
        card.style.transition = 'opacity 1s ease';
        setTimeout(function () { if (card.parentNode) card.remove(); }, 1000);
      }
    }, 30000);

  }, AFFILIATE_DELAY);

})();
