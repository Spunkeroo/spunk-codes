/**
 * SPUNK.CODES Share Widget
 * Floating share button with panel for X, LinkedIn, Reddit, Copy Link
 * Lightweight, no dependencies, matches dark theme
 * Include before </body> on any page
 */
(function() {
  'use strict';

  // Don't init on social-cards generator page
  if (window.location.pathname.indexOf('/social-cards/') !== -1) return;

  // Get page info
  var pageTitle = document.title.split(' - ')[0] || document.title;
  var pageUrl = window.location.href;
  var siteName = 'SPUNK.CODES';

  // Inject styles
  var style = document.createElement('style');
  style.textContent = [
    '#sc-share-fab{',
      'position:fixed;bottom:24px;right:24px;z-index:9990;',
      'width:52px;height:52px;border-radius:50%;border:none;',
      'background:linear-gradient(135deg,#58a6ff,#39d353);',
      'color:#0d1117;font-size:22px;font-weight:700;',
      'cursor:pointer;display:flex;align-items:center;justify-content:center;',
      'box-shadow:0 4px 20px rgba(88,166,255,0.3);',
      'transition:all 0.3s cubic-bezier(0.4,0,0.2,1);',
      'font-family:system-ui,-apple-system,sans-serif;',
    '}',
    '#sc-share-fab:hover{',
      'transform:translateY(-3px) scale(1.05);',
      'box-shadow:0 8px 30px rgba(88,166,255,0.4);',
    '}',
    '#sc-share-fab.active{',
      'background:rgba(88,166,255,0.15);border:1px solid rgba(88,166,255,0.3);',
      'color:#58a6ff;',
    '}',
    '#sc-share-panel{',
      'position:fixed;bottom:88px;right:24px;z-index:9991;',
      'width:280px;padding:0;',
      'background:rgba(22,27,34,0.95);',
      'border:1px solid rgba(48,54,61,0.6);',
      'border-radius:16px;',
      'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);',
      'box-shadow:0 20px 60px rgba(0,0,0,0.5);',
      'opacity:0;visibility:hidden;transform:translateY(10px) scale(0.95);',
      'transition:all 0.25s cubic-bezier(0.4,0,0.2,1);',
      'pointer-events:none;',
      'font-family:system-ui,-apple-system,sans-serif;',
    '}',
    '#sc-share-panel.open{',
      'opacity:1;visibility:visible;transform:translateY(0) scale(1);',
      'pointer-events:auto;',
    '}',
    '.sc-panel-header{',
      'padding:16px 16px 12px;border-bottom:1px solid rgba(48,54,61,0.5);',
    '}',
    '.sc-panel-title{',
      'font-size:13px;font-weight:700;color:#e6edf3;margin:0;',
    '}',
    '.sc-panel-subtitle{',
      'font-size:11px;color:#484f58;margin-top:2px;',
    '}',
    '.sc-panel-body{padding:8px;}',
    '.sc-share-btn{',
      'display:flex;align-items:center;gap:10px;',
      'width:100%;padding:10px 12px;margin:0;',
      'background:transparent;border:none;border-radius:10px;',
      'color:#e6edf3;font-size:13px;font-weight:500;',
      'font-family:system-ui,-apple-system,sans-serif;',
      'cursor:pointer;transition:all 0.2s;text-align:left;',
    '}',
    '.sc-share-btn:hover{background:rgba(88,166,255,0.08);}',
    '.sc-share-btn .sc-icon{',
      'width:32px;height:32px;border-radius:8px;display:flex;',
      'align-items:center;justify-content:center;font-size:15px;flex-shrink:0;',
    '}',
    '.sc-icon-x{background:rgba(255,255,255,0.08);color:#fff;}',
    '.sc-icon-li{background:rgba(10,102,194,0.15);color:#0a66c2;}',
    '.sc-icon-rd{background:rgba(255,69,0,0.12);color:#ff4500;}',
    '.sc-icon-cp{background:rgba(88,166,255,0.1);color:#58a6ff;}',
    '.sc-share-label{font-weight:600;display:block;line-height:1.2;}',
    '.sc-share-sub{font-size:11px;color:#8b949e;font-weight:400;}',
    '.sc-copied{color:#39d353 !important;}',
    '.sc-copied .sc-icon-cp{background:rgba(57,211,83,0.15) !important;color:#39d353 !important;}',
    '@media(max-width:480px){',
      '#sc-share-panel{right:12px;bottom:80px;width:calc(100vw - 24px);}',
      '#sc-share-fab{bottom:16px;right:16px;width:46px;height:46px;font-size:18px;}',
    '}'
  ].join('');
  document.head.appendChild(style);

  // Create FAB
  var fab = document.createElement('button');
  fab.id = 'sc-share-fab';
  fab.setAttribute('aria-label', 'Share this page');
  fab.title = 'Share';
  // Share icon (arrow up from box)
  fab.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';

  // Create panel
  var panel = document.createElement('div');
  panel.id = 'sc-share-panel';

  // X share text
  var xText = pageTitle + ' \uD83D\uDD25 Found this free tool on @SpunkArt13\'s SPUNK.CODES ' + pageUrl;
  var linkedInUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(pageUrl);
  var redditUrl = 'https://www.reddit.com/submit?url=' + encodeURIComponent(pageUrl) + '&title=' + encodeURIComponent(pageTitle + ' - ' + siteName);
  var xUrl = 'https://x.com/intent/tweet?text=' + encodeURIComponent(xText);

  panel.innerHTML = [
    '<div class="sc-panel-header">',
      '<div class="sc-panel-title">Share this page</div>',
      '<div class="sc-panel-subtitle">' + pageTitle + '</div>',
    '</div>',
    '<div class="sc-panel-body">',
      '<button class="sc-share-btn" data-action="x">',
        '<span class="sc-icon sc-icon-x"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></span>',
        '<span><span class="sc-share-label">Share on X</span><span class="sc-share-sub">Post with @SpunkArt13</span></span>',
      '</button>',
      '<button class="sc-share-btn" data-action="linkedin">',
        '<span class="sc-icon sc-icon-li"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></span>',
        '<span><span class="sc-share-label">Share on LinkedIn</span><span class="sc-share-sub">Post to your network</span></span>',
      '</button>',
      '<button class="sc-share-btn" data-action="reddit">',
        '<span class="sc-icon sc-icon-rd"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.462.342.342 0 00-.462 0c-.545.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.205-.095z"/></svg></span>',
        '<span><span class="sc-share-label">Share on Reddit</span><span class="sc-share-sub">Submit to a subreddit</span></span>',
      '</button>',
      '<button class="sc-share-btn" data-action="copy" id="sc-copy-btn">',
        '<span class="sc-icon sc-icon-cp"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></span>',
        '<span><span class="sc-share-label">Copy Link</span><span class="sc-share-sub" id="sc-copy-sub">' + pageUrl + '</span></span>',
      '</button>',
    '</div>'
  ].join('');

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  // Toggle panel
  var isOpen = false;
  fab.addEventListener('click', function(e) {
    e.stopPropagation();
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    fab.classList.toggle('active', isOpen);

    if (isOpen) {
      // Change icon to X
      fab.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    } else {
      fab.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';
    }
  });

  // Close panel on outside click
  document.addEventListener('click', function() {
    if (isOpen) {
      isOpen = false;
      panel.classList.remove('open');
      fab.classList.remove('active');
      fab.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';
    }
  });

  panel.addEventListener('click', function(e) { e.stopPropagation(); });

  // Track share event
  function trackShare(method) {
    if (typeof gtag === 'function') {
      gtag('event', 'share', {
        method: method,
        content_type: 'page',
        content_id: pageUrl,
        content: pageTitle
      });
    }
  }

  // Handle share button clicks
  var shareBtns = panel.querySelectorAll('.sc-share-btn');
  for (var i = 0; i < shareBtns.length; i++) {
    shareBtns[i].addEventListener('click', function() {
      var action = this.getAttribute('data-action');

      if (action === 'x') {
        window.open(xUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
        trackShare('twitter');

      } else if (action === 'linkedin') {
        window.open(linkedInUrl, '_blank', 'width=600,height=500,noopener,noreferrer');
        trackShare('linkedin');

      } else if (action === 'reddit') {
        window.open(redditUrl, '_blank', 'width=800,height=600,noopener,noreferrer');
        trackShare('reddit');

      } else if (action === 'copy') {
        var copyBtn = this;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pageUrl).then(function() {
            copyBtn.classList.add('sc-copied');
            var label = copyBtn.querySelector('.sc-share-label');
            var sub = copyBtn.querySelector('.sc-share-sub');
            label.textContent = 'Copied!';
            sub.textContent = 'Link copied to clipboard';
            setTimeout(function() {
              copyBtn.classList.remove('sc-copied');
              label.textContent = 'Copy Link';
              sub.textContent = pageUrl;
            }, 2000);
          });
        } else {
          // Fallback
          var ta = document.createElement('textarea');
          ta.value = pageUrl;
          ta.style.cssText = 'position:fixed;opacity:0;';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          var label2 = copyBtn.querySelector('.sc-share-label');
          label2.textContent = 'Copied!';
          setTimeout(function() { label2.textContent = 'Copy Link'; }, 2000);
        }
        trackShare('copy_link');
      }
    });
  }
})();
