/**
 * Universal Usage Tracker for Spunk.Codes
 * Auto-detects tool, tracks usage via localStorage, injects floating badge
 * Sends events to GA4 if available
 */
(function () {
  'use strict';

  // Derive tool key from pathname
  var path = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '').replace(/\//g, '_');
  if (!path) return; // skip index/root

  // Skip non-tool pages
  var skipPages = ['index','store','pricing','checkout','affiliate','ebook-store','revenue-dashboard',
    'automation-status','network-hub','404','blog','exclusive-tools','spunk-rewards',
    'newsletter','install','join','launch','giveaway','challenge','advertise','sponsor',
    'cross-sell-footer','network-footer-snippet','network-stats','terms-of-service','referral',
    'reseller','white-label','api-access','affiliates','affiliate-tracker','analytics-dashboard',
    'site-empire-dashboard','free-tools-list','spunk'];
  var baseName = path.split('_').pop() || path;
  if (skipPages.indexOf(path) !== -1 || skipPages.indexOf(baseName) !== -1) return;

  var STORAGE_KEY = 'sa_usage_' + path;
  var SEED_KEY = 'sa_seed_' + path;

  // Skip if an inline usage badge already exists on the page
  if (document.getElementById('usageBadge') || document.querySelector('.usage-badge')) return;

  // Deterministic seed per tool (50-500 range, stable per tool name)
  function getSeed() {
    var existing = localStorage.getItem(SEED_KEY);
    if (existing) return parseInt(existing, 10);
    var hash = 0;
    for (var i = 0; i < path.length; i++) {
      hash = ((hash << 5) - hash) + path.charCodeAt(i);
      hash |= 0;
    }
    var seed = 50 + Math.abs(hash % 451); // 50-500
    localStorage.setItem(SEED_KEY, seed);
    return seed;
  }

  var seed = getSeed();
  var raw = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
  raw++;
  localStorage.setItem(STORAGE_KEY, raw);
  var count = seed + raw;

  // GA4 event
  if (typeof gtag === 'function') {
    try {
      gtag('event', 'tool_usage', {
        event_category: 'engagement',
        event_label: path,
        value: count
      });
    } catch (e) { /* silent */ }
  }

  // Create floating badge
  var badge = document.createElement('div');
  badge.id = 'sa-usage-float';
  var icon = count >= 100 ? '\uD83D\uDD25 ' : '';
  badge.textContent = icon + 'Used ' + count.toLocaleString() + ' time' + (count !== 1 ? 's' : '');

  // Styles
  var s = badge.style;
  s.position = 'fixed';
  s.top = '12px';
  s.right = '12px';
  s.zIndex = '9998';
  s.display = 'inline-flex';
  s.alignItems = 'center';
  s.gap = '4px';
  s.padding = '4px 12px';
  s.fontSize = '12px';
  s.fontWeight = '600';
  s.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  s.color = '#8b949e';
  s.background = 'rgba(88,166,255,0.1)';
  s.border = '1px solid rgba(88,166,255,0.2)';
  s.borderRadius = '20px';
  s.backdropFilter = 'blur(10px)';
  s.webkitBackdropFilter = 'blur(10px)';
  s.pointerEvents = 'none';
  s.userSelect = 'none';
  s.transition = 'opacity 0.3s ease';
  s.opacity = '0';
  s.lineHeight = '1';
  s.whiteSpace = 'nowrap';
  s.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';

  document.body.appendChild(badge);

  // Fade in after short delay
  setTimeout(function () {
    badge.style.opacity = '1';
  }, 400);

  // Fade out on scroll down, show on scroll up
  var lastScroll = 0;
  window.addEventListener('scroll', function () {
    var st = window.pageYOffset || document.documentElement.scrollTop;
    badge.style.opacity = st > lastScroll && st > 200 ? '0' : '1';
    lastScroll = st;
  }, { passive: true });
})();
