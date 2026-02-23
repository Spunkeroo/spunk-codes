/**
 * SPUNK Network Universal Banner
 * ================================
 * Drop this script on ANY network site to show a subtle
 * cross-promotion banner linking back to spunk.codes.
 *
 * Usage: <script src="https://spunk.codes/network-banner.js" defer></script>
 *
 * Features:
 * - Small, subtle bottom banner
 * - Cycling messages about tools/ebooks
 * - Referral tracking via URL params
 * - Dismiss with X (localStorage memory)
 * - Auto-matches dark themes
 * - Zero dependencies, ~3KB
 *
 * (c) 2026 SPUNK.CODES. All rights reserved.
 */
(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────
  var STORAGE_KEY = 'spunk_network_banner_dismissed';
  var DISMISS_DAYS = 7; // re-show after 7 days
  var CYCLE_MS = 6000;  // rotate message every 6s
  var UTM_SOURCE = (function () {
    try { return location.hostname.replace(/^www\./, ''); } catch (e) { return 'network'; }
  })();

  // ── Messages ────────────────────────────────────────────
  var messages = [
    { text: 'Part of the SPUNK Network | 120+ sites | Free tools at spunk.codes', url: 'https://spunk.codes/?ref=' + UTM_SOURCE },
    { text: '200+ free developer tools -- no sign-up required', url: 'https://spunk.codes/?ref=' + UTM_SOURCE },
    { text: 'Free ebooks: Vibe Coding, AI Automation, Site Empires & more', url: 'https://spunk.codes/ebook-vibe-coding?ref=' + UTM_SOURCE },
    { text: 'Build your own site empire -- read the free blueprint', url: 'https://spunk.codes/empire-builder?ref=' + UTM_SOURCE },
    { text: 'JSON Formatter, Password Gen, PDF Tools & 200 more -- all free', url: 'https://spunk.codes/?ref=' + UTM_SOURCE },
    { text: 'Explore the full SPUNK Network: 120+ live websites', url: 'https://spunk.codes/network-hub?ref=' + UTM_SOURCE },
    { text: 'SEO tools, social growth tools, AI tools -- free forever', url: 'https://spunk.codes/?ref=' + UTM_SOURCE + '#tools' },
    { text: 'Free Cloudflare Workers toolkit -- 18 deploy-ready tools', url: 'https://spunk.codes/store?ref=' + UTM_SOURCE }
  ];

  // ── Check dismiss ───────────────────────────────────────
  function isDismissed() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var ts = parseInt(raw, 10);
      if (isNaN(ts)) return false;
      return (Date.now() - ts) < DISMISS_DAYS * 86400000;
    } catch (e) { return false; }
  }

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
  }

  if (isDismissed()) return;

  // ── Track referral from banner clicks ───────────────────
  (function trackInboundRef() {
    try {
      var p = new URLSearchParams(location.search);
      var ref = p.get('ref') || p.get('r');
      if (ref && /^[a-zA-Z0-9._-]{2,64}$/.test(ref)) {
        if (!localStorage.getItem('spunk_ref')) {
          localStorage.setItem('spunk_ref', ref);
        }
      }
    } catch (e) {}
  })();

  // ── Build banner DOM ────────────────────────────────────
  var bar = document.createElement('div');
  bar.id = 'spunk-network-banner';

  var style = document.createElement('style');
  style.textContent = [
    '#spunk-network-banner{',
    '  position:fixed;bottom:0;left:0;right:0;z-index:999999;',
    '  background:rgba(13,17,23,0.95);',
    '  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    '  border-top:1px solid rgba(88,166,255,0.15);',
    '  padding:10px 16px;',
    '  display:flex;align-items:center;justify-content:center;gap:12px;',
    '  font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    '  font-size:13px;color:#8b949e;',
    '  transform:translateY(100%);',
    '  transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);',
    '}',
    '#spunk-network-banner.snb-show{transform:translateY(0)}',
    '#spunk-network-banner a.snb-link{',
    '  color:#58a6ff;font-weight:600;text-decoration:none;',
    '  white-space:nowrap;transition:color 0.2s;',
    '}',
    '#spunk-network-banner a.snb-link:hover{color:#79c0ff;text-decoration:underline}',
    '#spunk-network-banner .snb-dot{',
    '  width:6px;height:6px;border-radius:50%;background:#39d353;',
    '  flex-shrink:0;animation:snb-pulse 2s ease-in-out infinite;',
    '}',
    '@keyframes snb-pulse{0%,100%{opacity:1}50%{opacity:0.4}}',
    '#spunk-network-banner .snb-msg{',
    '  flex:1;text-align:center;min-width:0;',
    '  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
    '  transition:opacity 0.3s;',
    '}',
    '#spunk-network-banner .snb-close{',
    '  background:none;border:none;color:#484f58;cursor:pointer;',
    '  font-size:18px;line-height:1;padding:4px 6px;flex-shrink:0;',
    '  transition:color 0.2s;font-family:inherit;',
    '}',
    '#spunk-network-banner .snb-close:hover{color:#e6edf3}',
    '#spunk-network-banner .snb-brand{',
    '  font-size:11px;font-weight:800;letter-spacing:0.08em;',
    '  background:linear-gradient(135deg,#58a6ff,#39d353);',
    '  -webkit-background-clip:text;-webkit-text-fill-color:transparent;',
    '  background-clip:text;flex-shrink:0;',
    '}',
    '@media(max-width:600px){',
    '  #spunk-network-banner{font-size:11px;padding:8px 12px;gap:8px}',
    '  #spunk-network-banner .snb-brand{display:none}',
    '}'
  ].join('\n');

  var dot = document.createElement('span');
  dot.className = 'snb-dot';

  var brand = document.createElement('span');
  brand.className = 'snb-brand';
  brand.textContent = 'SPUNK';

  var msgWrap = document.createElement('span');
  msgWrap.className = 'snb-msg';

  var link = document.createElement('a');
  link.className = 'snb-link';
  link.target = '_blank';
  link.rel = 'noopener';
  msgWrap.appendChild(link);

  var closeBtn = document.createElement('button');
  closeBtn.className = 'snb-close';
  closeBtn.innerHTML = '&#10005;';
  closeBtn.setAttribute('aria-label', 'Close banner');
  closeBtn.addEventListener('click', function () {
    bar.classList.remove('snb-show');
    dismiss();
    setTimeout(function () { bar.remove(); style.remove(); }, 500);
  });

  bar.appendChild(dot);
  bar.appendChild(brand);
  bar.appendChild(msgWrap);
  bar.appendChild(closeBtn);

  // ── Inject ──────────────────────────────────────────────
  document.head.appendChild(style);
  document.body.appendChild(bar);

  // ── Cycle messages ──────────────────────────────────────
  var idx = Math.floor(Math.random() * messages.length);

  function showMessage() {
    var m = messages[idx % messages.length];
    link.textContent = m.text;
    link.href = m.url;
    idx++;
  }

  showMessage();

  // Show after short delay
  setTimeout(function () { bar.classList.add('snb-show'); }, 1500);

  // Rotate
  setInterval(function () {
    msgWrap.style.opacity = '0';
    setTimeout(function () {
      showMessage();
      msgWrap.style.opacity = '1';
    }, 300);
  }, CYCLE_MS);

  // ── GA4 event if available ──────────────────────────────
  link.addEventListener('click', function () {
    try {
      if (typeof gtag === 'function') {
        gtag('event', 'network_banner_click', {
          banner_message: link.textContent,
          source_site: UTM_SOURCE
        });
      }
    } catch (e) {}
  });

})();
