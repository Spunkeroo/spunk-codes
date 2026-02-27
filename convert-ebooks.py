#!/usr/bin/env python3
"""Convert ebooks to preview-only mode with email gate."""

import re
import os
import glob

EBOOK_DIR = "/Users/spunkart/spunk-codes"

# Firebase config
FIREBASE_DB = "https://predict-network-ec767-default-rtdb.firebaseio.com"

# All ebook files (excluding store)
ALL_EBOOKS = [
    "ebook-100-side-hustles.html",
    "ebook-affiliate-marketing-2026.html",
    "ebook-ai-agents.html",
    "ebook-ai-automation.html",
    "ebook-automation-mastery.html",
    "ebook-crypto-trading.html",
    "ebook-cursor-ai-mastery.html",
    "ebook-email-marketing.html",
    "ebook-free-tools-money.html",
    "ebook-github-copilot-guide.html",
    "ebook-github-pages-empire.html",
    "ebook-landing-page-secrets.html",
    "ebook-mcp-guide.html",
    "ebook-micro-saas-playbook.html",
    "ebook-no-code-empire.html",
    "ebook-passive-income.html",
    "ebook-prompt-engineering.html",
    "ebook-seo-masterclass.html",
    "ebook-site-empire.html",
    "ebook-social-media-growth.html",
    "ebook-vibe-coders-playbook.html",
    "ebook-vibe-coding.html",
]

# CSS to inject
GATE_CSS = """
/* Email Gate Styles */
.email-gate-cta{background:linear-gradient(135deg,#1a0a00,#0a1a10);border:2px solid transparent;border-image:linear-gradient(135deg,#ff5f1f,#10b981,#ff5f1f) 1;border-radius:0;padding:40px 32px;text-align:center;margin:40px 0 0;position:relative;z-index:10}
.email-gate-cta h3{color:#ff5f1f;font-size:1.6em;margin:0 0 8px;font-weight:800}
.email-gate-cta .gate-sub{color:#999;font-size:1.05em;margin-bottom:20px}
.email-gate-cta .gate-form{display:flex;gap:12px;justify-content:center;align-items:center;flex-wrap:wrap;margin:20px 0 12px}
.email-gate-cta .gate-form input[type="email"]{padding:14px 20px;border:1px solid #333;border-radius:8px;background:#111;color:#e8e8e8;font-size:1em;width:300px;max-width:100%;outline:none;transition:border-color 0.3s}
.email-gate-cta .gate-form input[type="email"]:focus{border-color:#ff5f1f}
.email-gate-cta .gate-form button{padding:14px 28px;background:#ff5f1f;color:#fff;border:none;border-radius:8px;font-size:1em;font-weight:700;cursor:pointer;transition:all 0.3s;white-space:nowrap}
.email-gate-cta .gate-form button:hover{background:#e5540f;transform:translateY(-2px)}
.email-gate-cta .gate-trust{color:#666;font-size:0.85em;margin-top:8px}
.email-gate-cta .gate-success{display:none;padding:20px 0}
.email-gate-cta .gate-success h3{color:#10b981;font-size:1.4em}
.email-gate-cta .gate-success p{color:#999;margin-top:8px}
.locked-content{filter:blur(5px);pointer-events:none;user-select:none;max-height:400px;overflow:hidden;position:relative}
.locked-content::after{content:'';position:absolute;bottom:0;left:0;right:0;height:200px;background:linear-gradient(to bottom,transparent,#0a0a0a);pointer-events:none}
"""

def get_book_title(html):
    """Extract book title from <title> tag or <h1>."""
    m = re.search(r'<title>([^<|—]+)', html)
    if m:
        title = m.group(1).strip()
        # Clean up common suffixes
        for suffix in [' — Free Ebook by spunk.codes', ' | spunk.codes', ' - Free Ebook']:
            title = title.replace(suffix, '')
        return title.strip()
    m = re.search(r'<h1[^>]*>([^<]+)', html)
    if m:
        return m.group(1).strip()
    return "This Ebook"

def make_cta_html(book_title, book_slug):
    """Generate the email gate CTA HTML."""
    return f'''
<!-- EMAIL GATE CTA -->
<div class="email-gate-cta" id="emailGate">
  <h3>You're Reading the Preview</h3>
  <p class="gate-sub">Get the complete <strong>{book_title}</strong> with all chapters — free.</p>
  <div class="gate-form" id="gateForm">
    <input type="email" id="gateEmail" placeholder="your@email.com" required>
    <button onclick="submitEmailGate()">Get Free Access</button>
  </div>
  <p class="gate-trust">Free. No spam. Instant access.</p>
  <div class="gate-success" id="gateSuccess">
    <h3>Check your inbox!</h3>
    <p>Full ebook unlocking now...</p>
  </div>
</div>
'''

def make_gate_script(book_title, book_slug):
    """Generate the email gate JavaScript."""
    return f'''
<script>
function submitEmailGate(){{
  var emailInput=document.getElementById('gateEmail');
  var email=emailInput.value.trim();
  if(!email||!email.includes('@')||!email.includes('.')){{
    emailInput.style.borderColor='#ef4444';
    emailInput.setAttribute('placeholder','Please enter a valid email');
    return;
  }}
  var btn=document.querySelector('.gate-form button');
  btn.textContent='Saving...';
  btn.disabled=true;
  var data={{email:email,book:'{book_slug}',timestamp:new Date().toISOString(),source:window.location.href}};
  fetch('{FIREBASE_DB}/emails/ebook-signups.json',{{
    method:'POST',
    headers:{{'Content-Type':'application/json'}},
    body:JSON.stringify(data)
  }}).then(function(){{
    document.getElementById('gateForm').style.display='none';
    document.querySelector('.gate-trust').style.display='none';
    document.getElementById('gateSuccess').style.display='block';
    if(typeof gtag==='function'){{
      gtag('event','ebook_unlock',{{book_title:'{book_title}'}});
    }}
    setTimeout(function(){{
      var locked=document.querySelector('.locked-content');
      if(locked){{
        locked.style.filter='none';
        locked.style.pointerEvents='auto';
        locked.style.userSelect='auto';
        locked.style.maxHeight='none';
        locked.style.overflow='visible';
        var after=locked.querySelector(':after');
        locked.classList.remove('locked-content');
      }}
    }},3000);
  }}).catch(function(){{
    document.getElementById('gateForm').style.display='none';
    document.querySelector('.gate-trust').style.display='none';
    document.getElementById('gateSuccess').style.display='block';
    setTimeout(function(){{
      var locked=document.querySelector('.locked-content');
      if(locked){{
        locked.classList.remove('locked-content');
      }}
    }},3000);
  }});
}}
</script>
'''

def inject_css(html, css):
    """Inject CSS before </style> tag."""
    if 'email-gate-cta' in html:
        return html  # Already has the CSS
    # Find the last </style> tag
    idx = html.rfind('</style>')
    if idx != -1:
        return html[:idx] + css + '\n' + html[idx:]
    # If no style tag, inject before </head>
    idx = html.find('</head>')
    if idx != -1:
        return html[:idx] + '<style>' + css + '</style>\n' + html[idx:]
    return html

def process_full_chapter_ebook(filepath):
    """Process ebooks with full ch1-ch10 sections. Lock at ch4."""
    with open(filepath, 'r') as f:
        html = f.read()

    if 'email-gate-cta' in html:
        print(f"  SKIP (already processed): {os.path.basename(filepath)}")
        return

    book_title = get_book_title(html)
    book_slug = os.path.basename(filepath).replace('.html', '').replace('ebook-', '')

    # Find ch4 start - various patterns
    # Pattern 1: <section class="chapter" id="ch4">
    # Pattern 2: <section id="ch4">
    # Pattern 3: <!-- CHAPTER 4 --> before section

    ch4_patterns = [
        r'(<!-- =+ CHAPTER 4 =+ -->\s*)?<section[^>]*id="ch4"[^>]*>',
        r'<section[^>]*id="ch4"[^>]*>',
    ]

    ch4_match = None
    for pat in ch4_patterns:
        ch4_match = re.search(pat, html)
        if ch4_match:
            break

    if not ch4_match:
        print(f"  WARNING: No ch4 found in {os.path.basename(filepath)}")
        return

    ch4_pos = ch4_match.start()

    # Also try to find the comment before ch4
    comment_match = re.search(r'<!-- =+ CHAPTER 4 =+ -->\s*', html[:ch4_pos+200])
    if comment_match and comment_match.end() <= ch4_pos + 5:
        ch4_pos = comment_match.start()

    # Find the end: everything from ch4 to the footer/end of ebook container
    # We need to wrap ch4 through ch10 in a locked-content div
    # Find the closing of the last chapter section before footer

    # Strategy: Insert CTA before ch4, wrap ch4+ in locked-content div
    # Find where the ebook content ends (before footer or before final CTA)

    # Look for the final CTA banner or footer
    end_markers = [
        r'<!-- =+ FINAL CTA =+ -->',
        r'</div><!-- end \.ebook -->',
        r'</div>\s*<footer',
        r'<footer',
    ]

    end_pos = None
    for marker in end_markers:
        m = re.search(marker, html[ch4_pos:])
        if m:
            end_pos = ch4_pos + m.start()
            break

    if end_pos is None:
        # Fallback: find the last </section> before </body>
        body_end = html.rfind('</body>')
        if body_end != -1:
            end_pos = html.rfind('</section>', ch4_pos, body_end)
            if end_pos != -1:
                end_pos = end_pos + len('</section>')

    if end_pos is None:
        print(f"  WARNING: Could not find end marker in {os.path.basename(filepath)}")
        return

    # Extract locked content
    locked_content = html[ch4_pos:end_pos]

    # Build the new content
    cta_html = make_cta_html(book_title, book_slug)
    locked_div = f'\n<div class="locked-content">\n{locked_content}\n</div>\n'

    # Replace the section
    new_html = html[:ch4_pos] + cta_html + locked_div + html[end_pos:]

    # Inject CSS
    new_html = inject_css(new_html, GATE_CSS)

    # Inject gate script before </body>
    gate_script = make_gate_script(book_title, book_slug)
    body_end = new_html.rfind('</body>')
    if body_end != -1:
        new_html = new_html[:body_end] + gate_script + '\n' + new_html[body_end:]

    with open(filepath, 'w') as f:
        f.write(new_html)

    print(f"  OK (full->gated at ch4): {os.path.basename(filepath)} - '{book_title}'")

def process_already_locked_ebook(filepath):
    """Process ebooks that already have chapter-locked or locked-overlay.
    Replace the old lock mechanism with new email gate."""
    with open(filepath, 'r') as f:
        html = f.read()

    if 'email-gate-cta' in html:
        print(f"  SKIP (already processed): {os.path.basename(filepath)}")
        return

    book_title = get_book_title(html)
    book_slug = os.path.basename(filepath).replace('.html', '').replace('ebook-', '')

    # Inject CSS
    html = inject_css(html, GATE_CSS)

    # For files with chapter-locked class at ch3:
    # These show ch1, ch2 fully, ch3 with fade. We want ch1-ch3 visible, ch4+ locked.
    # But many of these only have content for ch1-ch3 (rest are stubs).
    # Strategy: Add CTA after ch3 (the chapter-locked one), then lock everything after.

    # For files with locked-overlay:
    # These have a locked-overlay div after ch2 content. Replace the old overlay with our CTA.

    if 'locked-overlay' in html:
        # Replace existing locked-overlay content
        # Pattern: <div class="locked-overlay">...existing content...</div>
        # Replace with our email gate CTA

        # Remove old locked-overlay div and its contents
        overlay_pattern = r'<div class="locked-overlay">.*?</div>\s*</div>'
        # Actually the locked-overlay has nested divs, be more careful

        # Find the locked-overlay
        overlay_start = html.find('<div class="locked-overlay">')
        if overlay_start != -1:
            # Find the matching closing - count divs
            depth = 0
            i = overlay_start
            found_end = None
            while i < len(html):
                if html[i:i+4] == '<div':
                    depth += 1
                elif html[i:i+6] == '</div>':
                    depth -= 1
                    if depth == 0:
                        found_end = i + 6
                        break
                i += 1

            if found_end:
                # Replace the old overlay with our CTA
                old_overlay = html[overlay_start:found_end]
                cta_html = make_cta_html(book_title, book_slug)
                html = html[:overlay_start] + cta_html + html[found_end:]

        # Now find chapters after ch3 (or cat3) and wrap in locked-content
        # These files typically have stub chapters (single-line sections)
        ch_patterns = [
            (r'<section class="chapter" id="ch4"', 'ch4'),
            (r'<section class="chapter" id="ch3">', 'ch3'),  # for copilot-guide where lock is after ch2
            (r'<section class="chapter" id="cat3"', 'cat3'),
        ]

        lock_start = None
        for pat, name in ch_patterns:
            m = re.search(pat, html)
            if m:
                # Check if there's a comment before it
                pre = html[max(0,m.start()-60):m.start()]
                comment_m = re.search(r'<!-- =+ \w+ \d+ =+ -->\s*$', pre)
                lock_start = m.start()
                if comment_m:
                    lock_start = m.start() - len(pre) + comment_m.start()
                break

        if lock_start:
            # Find end of content (before footer or end of ebook div)
            end_markers = [
                r'<!-- =+ FINAL CTA =+ -->',
                r'</div><!-- end \.ebook -->',
                r'</div>\s*<footer',
                r'<footer',
            ]
            end_pos = None
            for marker in end_markers:
                m_end = re.search(marker, html[lock_start:])
                if m_end:
                    end_pos = lock_start + m_end.start()
                    break

            if end_pos and end_pos > lock_start:
                locked_content = html[lock_start:end_pos]
                locked_div = f'\n<div class="locked-content">\n{locked_content}\n</div>\n'
                html = html[:lock_start] + locked_div + html[end_pos:]

    elif 'chapter-locked' in html:
        # Files with chapter-locked at ch3
        # Remove the chapter-locked class, add our CTA before ch3, lock ch4+

        # First remove old chapter-locked CSS and class
        html = html.replace('chapter-locked', 'chapter')
        # Remove old chapter-locked CSS rules
        html = re.sub(r'\.chapter-locked\s*\{[^}]*\}', '', html)
        html = re.sub(r'\.chapter-locked::after\s*\{[^}]*\}', '', html)

        # Find ch4 or the end of content after ch3
        ch4_match = re.search(r'<section[^>]*id="ch4"[^>]*>', html)

        if ch4_match:
            ch4_pos = ch4_match.start()
            # Check for comment before
            comment_check = html[max(0,ch4_pos-80):ch4_pos]
            cm = re.search(r'<!-- =+ CHAPTER 4 =+ -->\s*$', comment_check)
            if cm:
                ch4_pos = ch4_pos - len(comment_check) + cm.start()

            # Find end
            end_markers = [
                r'<!-- =+ FINAL CTA =+ -->',
                r'</div><!-- end \.ebook -->',
                r'</div>\s*<footer',
                r'<footer',
            ]
            end_pos = None
            for marker in end_markers:
                m_end = re.search(marker, html[ch4_pos:])
                if m_end:
                    end_pos = ch4_pos + m_end.start()
                    break

            if end_pos:
                cta_html = make_cta_html(book_title, book_slug)
                locked_content = html[ch4_pos:end_pos]
                locked_div = f'\n<div class="locked-content">\n{locked_content}\n</div>\n'
                html = html[:ch4_pos] + cta_html + locked_div + html[end_pos:]
        else:
            # No ch4 - these only have ch1-ch3, lock ch3 content
            # Find end of ch3 section content - the section itself
            ch3_match = re.search(r'<section[^>]*id="ch3"[^>]*>', html)
            if ch3_match:
                # Add CTA before ch3
                ch3_pos = ch3_match.start()
                comment_check = html[max(0,ch3_pos-80):ch3_pos]
                cm = re.search(r'<!-- =+[^-]*=+ -->\s*$', comment_check)
                if cm:
                    ch3_pos = ch3_pos - len(comment_check) + cm.start()

                end_markers = [
                    r'<!-- =+ FINAL CTA =+ -->',
                    r'</div><!-- end \.ebook -->',
                    r'</div>\s*<footer',
                    r'<footer',
                ]
                end_pos = None
                for marker in end_markers:
                    m_end = re.search(marker, html[ch3_pos:])
                    if m_end:
                        end_pos = ch3_pos + m_end.start()
                        break

                if end_pos:
                    cta_html = make_cta_html(book_title, book_slug)
                    locked_content = html[ch3_pos:end_pos]
                    locked_div = f'\n<div class="locked-content">\n{locked_content}\n</div>\n'
                    html = html[:ch3_pos] + cta_html + locked_div + html[end_pos:]

    # Inject gate script before </body>
    gate_script = make_gate_script(book_title, book_slug)
    body_end = html.rfind('</body>')
    if body_end != -1:
        html = html[:body_end] + gate_script + '\n' + html[body_end:]

    with open(filepath, 'w') as f:
        f.write(html)

    print(f"  OK (relocked with email gate): {os.path.basename(filepath)} - '{book_title}'")

def process_landing_page_ebook(filepath):
    """Process ebooks that are landing-page style (preview only).
    Replace the Gumroad CTA with email capture CTA."""
    with open(filepath, 'r') as f:
        html = f.read()

    if 'email-gate-cta' in html:
        print(f"  SKIP (already processed): {os.path.basename(filepath)}")
        return

    book_title = get_book_title(html)
    book_slug = os.path.basename(filepath).replace('.html', '').replace('ebook-', '')

    # Inject CSS
    html = inject_css(html, GATE_CSS)

    # Find the CTA banner with Gumroad link and replace it
    # Pattern: <div class="cta-banner">...(Gumroad link)...</div>
    cta_pattern = r'(<div class="cta-banner">\s*<h3>Download the Full Ebook[^<]*</h3>.*?</div>)'

    cta_html = make_cta_html(book_title, book_slug)

    # Replace the first cta-banner (the main one after preview)
    m = re.search(r'<div class="cta-banner">\s*<h3>Download the Full Ebook', html)
    if m:
        # Find the closing </div> for this cta-banner
        start = m.start()
        # Simple approach: find the next </div> after the opening
        end = html.find('</div>', start)
        if end != -1:
            end += 6  # include </div>
            html = html[:start] + cta_html + html[end:]

    # Inject gate script before </body>
    gate_script = make_gate_script(book_title, book_slug)
    body_end = html.rfind('</body>')
    if body_end != -1:
        html = html[:body_end] + gate_script + '\n' + html[body_end:]

    with open(filepath, 'w') as f:
        f.write(html)

    print(f"  OK (landing page CTA replaced): {os.path.basename(filepath)} - '{book_title}'")


# Categorize files
FULL_CHAPTER_EBOOKS = [
    "ebook-vibe-coding.html",
    "ebook-ai-agents.html",
    "ebook-passive-income.html",
    "ebook-vibe-coders-playbook.html",
    "ebook-site-empire.html",
    "ebook-no-code-empire.html",
    "ebook-mcp-guide.html",
    "ebook-free-tools-money.html",
    "ebook-ai-automation.html",
]

ALREADY_LOCKED_EBOOKS = [
    "ebook-automation-mastery.html",
    "ebook-email-marketing.html",
    "ebook-landing-page-secrets.html",
    "ebook-social-media-growth.html",
    "ebook-github-pages-empire.html",
    "ebook-100-side-hustles.html",
    "ebook-cursor-ai-mastery.html",
    "ebook-github-copilot-guide.html",
    "ebook-affiliate-marketing-2026.html",
    "ebook-micro-saas-playbook.html",
]

LANDING_PAGE_EBOOKS = [
    "ebook-crypto-trading.html",
    "ebook-seo-masterclass.html",
    "ebook-prompt-engineering.html",
]

def main():
    print("=== Converting ebooks to preview-only with email gate ===\n")

    print("--- Full chapter ebooks (gate at ch4) ---")
    for f in FULL_CHAPTER_EBOOKS:
        process_full_chapter_ebook(os.path.join(EBOOK_DIR, f))

    print("\n--- Already locked ebooks (replace lock with email gate) ---")
    for f in ALREADY_LOCKED_EBOOKS:
        process_already_locked_ebook(os.path.join(EBOOK_DIR, f))

    print("\n--- Landing page ebooks (replace Gumroad CTA) ---")
    for f in LANDING_PAGE_EBOOKS:
        process_landing_page_ebook(os.path.join(EBOOK_DIR, f))

    print(f"\n=== Done! Processed {len(FULL_CHAPTER_EBOOKS) + len(ALREADY_LOCKED_EBOOKS) + len(LANDING_PAGE_EBOOKS)} ebooks ===")

if __name__ == "__main__":
    main()
