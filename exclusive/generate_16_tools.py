#!/usr/bin/env python3
"""Generate 16 exclusive developer tools for spunk.codes using a template approach."""

import os

OUTDIR = os.path.dirname(os.path.abspath(__file__))

# Shared fragments
HEAD_OPEN = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">'''

def analytics():
    return '''<script async src="https://www.googletagmanager.com/gtag/js?id=G-GVNL11PEGP"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-GVNL11PEGP')</script>
<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","pn0x1z2y3w")</script>'''

BASE_CSS = '''*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh;display:flex;flex-direction:column}
a{color:#ff5f1f;text-decoration:none}a:hover{text-decoration:underline}
header{background:#111118;border-bottom:2px solid #ff5f1f;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;position:sticky;top:0;z-index:100}
header h1{font-size:1.4rem;color:#ff5f1f}
header .back{color:#e0e0e0;font-size:.9rem}
main{flex:1;padding:24px 16px;max-width:1200px;margin:0 auto;width:100%}
button,.btn{background:#ff5f1f;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:.9rem;font-weight:600;transition:background .2s}
button:hover,.btn:hover{background:#e8520e}
button.secondary{background:#2a2a3a;color:#e0e0e0}button.secondary:hover{background:#3a3a4a}
input,textarea,select{background:#16161e;border:1px solid #1a1a2e;color:#e0e0e0;padding:10px;border-radius:6px;font-size:.9rem;width:100%;font-family:inherit}
textarea{resize:vertical;min-height:120px}
select{cursor:pointer}
label{font-size:.82rem;color:#888;display:block;margin-bottom:4px;margin-top:12px}
.card{background:#111118;border:1px solid #1a1a2e;border-radius:10px;padding:20px;margin-bottom:16px}
.row{display:flex;gap:16px;flex-wrap:wrap}
.col{flex:1;min-width:280px}
.share-row{text-align:center;padding:10px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.share-row button{font-size:.78rem;padding:5px 10px}
.copied-toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#ff5f1f;color:#fff;padding:10px 24px;border-radius:8px;font-weight:600;font-size:.9rem;z-index:999;opacity:0;transition:opacity .3s;pointer-events:none}
.copied-toast.show{opacity:1}
footer{text-align:center;padding:20px;color:#555;font-size:.8rem;border-top:1px solid #1a1a2e;margin-top:auto}
footer a{color:#ff5f1f;margin:0 4px}
@media(max-width:700px){.row{flex-direction:column}header h1{font-size:1.1rem}}'''

def header_html(title):
    return f'''<header>
<h1>{title}</h1>
<a href="https://spunk.codes" class="back">spunk.codes</a>
</header>'''

SHARE_TOAST_FOOTER = '''<div class="share-row">
<button onclick="shareX()">Share on X</button>
<button class="secondary" onclick="copyLink()">Copy Link</button>
</div>
<footer>
<a href="https://spunk.codes">spunk.codes</a> &middot;
<a href="https://spunk.bet">spunk.bet</a> &middot;
<a href="https://spunk.pics">spunk.pics</a> &middot;
<a href="https://spunk.work">spunk.work</a> &middot;
<a href="https://spunkart.com">SpunkArt.com</a>
</footer>
<div class="copied-toast" id="toast"></div>'''

def share_js(filename, share_text):
    url = f'https://spunk.codes/exclusive/{filename}'
    return f'''function esc(s){{return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}}
function showToast(m){{const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}}
const toolURL='{url}';
function shareX(){{window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent('{share_text} '+toolURL),'_blank')}}
function copyLink(){{navigator.clipboard.writeText(toolURL).then(()=>showToast('Link copied!'))}}'''

CROSS_PROMO = '<script src="https://spunk.codes/cross-promo.js" defer></script>'

def build_page(filename, title, description, extra_css, body_html, script_code, share_text):
    return f'''{HEAD_OPEN}
<title>{title} | SPUNK.CODES</title>
<meta name="description" content="{description}">
{analytics()}
<style>
{BASE_CSS}
{extra_css}
</style>
</head>
<body>
{header_html(title)}
<main>
{body_html}
</main>
{SHARE_TOAST_FOOTER}
<script>
{share_js(filename, share_text)}
{script_code}
</script>
{CROSS_PROMO}
</body>
</html>'''

# ─── TOOL DEFINITIONS ───

tools = []

# 1. Cron Expression Builder
tools.append(dict(
    filename='cron-expression-builder.html',
    title='Cron Expression Builder',
    description='Visual cron schedule builder with human-readable output. Build cron expressions interactively. Free, no signup.',
    share_text='Free Cron Expression Builder - visual cron schedule tool!',
    extra_css='''.field-group{display:flex;gap:8px;align-items:center;margin:8px 0;flex-wrap:wrap}
.field-group label{min-width:90px;margin:0;color:#ff5f1f;font-weight:600}
.field-group input,.field-group select{width:auto;flex:1;max-width:200px}
.result{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;padding:20px;margin-top:16px;text-align:center}
.result .expr{font-size:1.8rem;color:#ff5f1f;font-family:monospace;letter-spacing:2px;margin:10px 0}
.result .human{color:#888;font-size:.95rem}
.presets{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.presets button{font-size:.75rem;padding:4px 10px}
.next-runs{margin-top:12px;font-size:.82rem;color:#888;text-align:left}
.next-runs div{padding:2px 0}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">Build Your Cron Expression</h2>
<div class="presets">
<button onclick="setPreset('* * * * *')">Every Minute</button>
<button onclick="setPreset('0 * * * *')">Every Hour</button>
<button onclick="setPreset('0 0 * * *')">Daily Midnight</button>
<button onclick="setPreset('0 9 * * 1-5')">Weekdays 9AM</button>
<button onclick="setPreset('0 0 1 * *')">Monthly</button>
<button onclick="setPreset('0 0 * * 0')">Weekly Sunday</button>
</div>
<div class="field-group"><label>Minute</label><input id="f0" value="*" oninput="update()"><select onchange="document.getElementById('f0').value=this.value;update()"><option value="*">Every minute (*)</option><option value="0">At 0</option><option value="*/5">Every 5 min</option><option value="*/10">Every 10 min</option><option value="*/15">Every 15 min</option><option value="*/30">Every 30 min</option></select></div>
<div class="field-group"><label>Hour</label><input id="f1" value="*" oninput="update()"><select onchange="document.getElementById('f1').value=this.value;update()"><option value="*">Every hour (*)</option><option value="0">Midnight (0)</option><option value="6">6 AM</option><option value="9">9 AM</option><option value="12">Noon</option><option value="18">6 PM</option></select></div>
<div class="field-group"><label>Day (Month)</label><input id="f2" value="*" oninput="update()"><select onchange="document.getElementById('f2').value=this.value;update()"><option value="*">Every day (*)</option><option value="1">1st</option><option value="15">15th</option><option value="1,15">1st & 15th</option></select></div>
<div class="field-group"><label>Month</label><input id="f3" value="*" oninput="update()"><select onchange="document.getElementById('f3').value=this.value;update()"><option value="*">Every month (*)</option><option value="1">January</option><option value="6">June</option><option value="12">December</option><option value="1-6">Jan-Jun</option></select></div>
<div class="field-group"><label>Day (Week)</label><input id="f4" value="*" oninput="update()"><select onchange="document.getElementById('f4').value=this.value;update()"><option value="*">Every day (*)</option><option value="0">Sunday</option><option value="1-5">Mon-Fri</option><option value="6,0">Sat & Sun</option></select></div>
</div>
<div class="result card">
<div>Cron Expression:</div>
<div class="expr" id="expr">* * * * *</div>
<div class="human" id="human">Every minute</div>
<button onclick="navigator.clipboard.writeText(document.getElementById('expr').textContent).then(()=>showToast('Copied!'))">Copy Expression</button>
<div class="next-runs" id="nextRuns"></div>
</div>''',
    script_code=r'''
const MONTHS=['','January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function setPreset(p){const f=p.split(' ');for(let i=0;i<5;i++)document.getElementById('f'+i).value=f[i];update()}

function update(){
const parts=[];for(let i=0;i<5;i++)parts.push(document.getElementById('f'+i).value.trim()||'*');
const expr=parts.join(' ');
document.getElementById('expr').textContent=expr;
document.getElementById('human').textContent=toHuman(parts);
showNextRuns(parts);
}

function toHuman(p){
let s='';
const [min,hr,dom,mon,dow]=p;
if(min==='*'&&hr==='*'&&dom==='*'&&mon==='*'&&dow==='*')return'Every minute';
if(min==='0'&&hr==='*'&&dom==='*'&&mon==='*'&&dow==='*')return'Every hour at minute 0';
if(min==='0'&&hr==='0'&&dom==='*'&&mon==='*'&&dow==='*')return'Every day at midnight';
s='At ';
if(min.startsWith('*/')){s+='every '+min.slice(2)+' minutes'}
else if(min==='*'){s+='every minute'}
else{s+='minute '+min}
if(hr.startsWith('*/')){s+=', every '+hr.slice(2)+' hours'}
else if(hr!=='*'){s+=', at hour '+hr}
if(dom!=='*')s+=', on day '+dom+' of the month';
if(mon!=='*')s+=', in month '+mon;
if(dow!=='*'){
if(dow==='1-5')s+=', Monday to Friday';
else if(dow==='6,0'||dow==='0,6')s+=', weekends';
else s+=', on day-of-week '+dow;
}
return s;
}

function showNextRuns(p){
const el=document.getElementById('nextRuns');
try{
const now=new Date();const runs=[];
let d=new Date(now);d.setSeconds(0);d.setMilliseconds(0);
for(let i=0;i<1000&&runs.length<5;i++){
d=new Date(d.getTime()+60000);
if(matchCron(p,d))runs.push(d.toLocaleString());
}
el.innerHTML='<strong>Next 5 runs:</strong>'+runs.map(r=>'<div>'+esc(r)+'</div>').join('');
}catch(e){el.innerHTML=''}
}

function matchCron(p,d){
const checks=[[d.getMinutes(),p[0]],[d.getHours(),p[1]],[d.getDate(),p[2]],[d.getMonth()+1,p[3]],[d.getDay(),p[4]]];
return checks.every(([val,pat])=>matchField(val,pat));
}

function matchField(val,pat){
if(pat==='*')return true;
return pat.split(',').some(part=>{
if(part.includes('/')){const[range,step]=part.split('/');const s=parseInt(step);const start=range==='*'?0:parseInt(range);return val>=start&&(val-start)%s===0}
if(part.includes('-')){const[a,b]=part.split('-').map(Number);return val>=a&&val<=b}
return parseInt(part)===val;
});
}

update();
localStorage.setItem('spunkcodes_cron_last',Date.now());
'''
))

# 2. JWT Decoder
tools.append(dict(
    filename='jwt-decoder.html',
    title='JWT Decoder',
    description='Decode JWT tokens instantly. View header, payload, signature, and expiry. Free, no signup, 100% client-side.',
    share_text='Free JWT Decoder - inspect tokens instantly!',
    extra_css='''.jwt-input{font-family:monospace;min-height:100px}
.part{margin-top:16px}
.part h3{color:#ff5f1f;font-size:.95rem;margin-bottom:6px}
.part pre{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;padding:14px;overflow-x:auto;font-size:.85rem;line-height:1.5;white-space:pre-wrap;word-break:break-all}
.status{margin-top:12px;padding:10px;border-radius:6px;font-weight:600;text-align:center}
.status.valid{background:#1a3a1a;color:#3fb950;border:1px solid #3fb950}
.status.expired{background:#3a1a1a;color:#e06c75;border:1px solid #e06c75}
.status.invalid{background:#3a2a1a;color:#d19a66;border:1px solid #d19a66}
.colored{font-family:monospace;word-break:break-all;line-height:1.6;font-size:.85rem}
.c-header{color:#e06c75}.c-payload{color:#3fb950}.c-sig{color:#61afef}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:8px">Paste Your JWT Token</h2>
<textarea class="jwt-input" id="jwtInput" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." oninput="decode()"></textarea>
<button onclick="decode()" style="margin-top:8px">Decode</button>
<button class="secondary" onclick="document.getElementById('jwtInput').value='';decode()" style="margin-top:8px">Clear</button>
<button class="secondary" onclick="loadSample()" style="margin-top:8px">Load Sample</button>
</div>
<div id="output"></div>''',
    script_code=r'''
function b64decode(s){
try{
s=s.replace(/-/g,'+').replace(/_/g,'/');
while(s.length%4)s+='=';
return JSON.parse(atob(s));
}catch(e){return null}
}

function decode(){
const jwt=document.getElementById('jwtInput').value.trim();
const out=document.getElementById('output');
if(!jwt){out.innerHTML='';return}
const parts=jwt.split('.');
if(parts.length!==3){out.innerHTML='<div class="card status invalid">Invalid JWT: expected 3 parts, got '+parts.length+'</div>';return}
const header=b64decode(parts[0]);
const payload=b64decode(parts[1]);
if(!header){out.innerHTML='<div class="card status invalid">Invalid header - not valid Base64/JSON</div>';return}
if(!payload){out.innerHTML='<div class="card status invalid">Invalid payload - not valid Base64/JSON</div>';return}
let statusHtml='';
if(payload.exp){
const expDate=new Date(payload.exp*1000);
const now=new Date();
if(expDate<now){
statusHtml='<div class="card status expired">EXPIRED — '+esc(expDate.toLocaleString())+'</div>';
}else{
const diff=expDate-now;
const hrs=Math.floor(diff/3600000);const mins=Math.floor((diff%3600000)/60000);
statusHtml='<div class="card status valid">VALID — expires '+esc(expDate.toLocaleString())+' (in '+hrs+'h '+mins+'m)</div>';
}
}
let timesHtml='';
if(payload.iat||payload.exp||payload.nbf){
timesHtml='<div class="card part"><h3>Timestamps</h3><pre>';
if(payload.iat)timesHtml+='Issued At (iat): '+esc(new Date(payload.iat*1000).toLocaleString())+'\n';
if(payload.exp)timesHtml+='Expires (exp):   '+esc(new Date(payload.exp*1000).toLocaleString())+'\n';
if(payload.nbf)timesHtml+='Not Before (nbf):'+esc(new Date(payload.nbf*1000).toLocaleString())+'\n';
timesHtml+='</pre></div>';
}
out.innerHTML=statusHtml+
'<div class="card"><div class="colored"><span class="c-header">'+esc(parts[0])+'</span>.<span class="c-payload">'+esc(parts[1])+'</span>.<span class="c-sig">'+esc(parts[2])+'</span></div></div>'+
'<div class="card part"><h3>Header</h3><pre>'+esc(JSON.stringify(header,null,2))+'</pre></div>'+
'<div class="card part"><h3>Payload</h3><pre>'+esc(JSON.stringify(payload,null,2))+'</pre></div>'+
timesHtml+
'<div class="card part"><h3>Signature (Base64URL)</h3><pre>'+esc(parts[2])+'</pre></div>';
}

function loadSample(){
const h=btoa(JSON.stringify({alg:"HS256",typ:"JWT"})).replace(/=/g,'');
const now=Math.floor(Date.now()/1000);
const p=btoa(JSON.stringify({sub:"1234567890",name:"John Doe",iat:now,exp:now+3600,role:"admin"})).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
document.getElementById('jwtInput').value=h+'.'+p+'.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
decode();
}

decode();
'''
))

# 3. SQL Formatter
tools.append(dict(
    filename='sql-formatter.html',
    title='SQL Formatter',
    description='Format and beautify SQL queries. Supports MySQL, PostgreSQL, SQLite, SQL Server dialects. Free, no signup, 100% client-side.',
    share_text='Free SQL Formatter - beautify your queries instantly!',
    extra_css='''.sql-area{font-family:'Courier New',monospace;min-height:200px;tab-size:2}
.options{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:12px 0}
.options select,.options input{width:auto}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:8px">Paste Your SQL</h2>
<textarea class="sql-area" id="sqlInput" placeholder="SELECT * FROM users WHERE id = 1 AND active = true ORDER BY created_at DESC LIMIT 10;"></textarea>
<div class="options">
<label style="margin:0">Indent: <select id="indent" style="width:80px"><option value="2">2 spaces</option><option value="4" selected>4 spaces</option><option value="tab">Tab</option></select></label>
<label style="margin:0">Case: <select id="kwCase" style="width:120px"><option value="upper" selected>UPPERCASE</option><option value="lower">lowercase</option></select></label>
<button onclick="formatSQL()">Format SQL</button>
<button class="secondary" onclick="minifySQL()">Minify</button>
<button class="secondary" onclick="navigator.clipboard.writeText(document.getElementById('sqlOutput').value).then(()=>showToast('Copied!'))">Copy Output</button>
<button class="secondary" onclick="clearAll()">Clear</button>
</div>
</div>
<div class="card">
<h3 style="color:#ff5f1f;margin-bottom:8px">Formatted Output</h3>
<textarea class="sql-area" id="sqlOutput" readonly placeholder="Formatted SQL will appear here..."></textarea>
</div>''',
    script_code=r'''
const KEYWORDS=['SELECT','FROM','WHERE','AND','OR','ORDER BY','GROUP BY','HAVING','LIMIT','OFFSET','JOIN','INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL JOIN','CROSS JOIN','ON','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','CREATE TABLE','ALTER TABLE','DROP TABLE','CREATE INDEX','UNION','UNION ALL','EXCEPT','INTERSECT','CASE','WHEN','THEN','ELSE','END','AS','IN','NOT','EXISTS','BETWEEN','LIKE','IS NULL','IS NOT NULL','ASC','DESC','DISTINCT','COUNT','SUM','AVG','MIN','MAX','WITH','RETURNING','FETCH','INTO'];

function formatSQL(){
let sql=document.getElementById('sqlInput').value.trim();
if(!sql)return;
const indentVal=document.getElementById('indent').value;
const ind=indentVal==='tab'?'\t':' '.repeat(parseInt(indentVal));
const kCase=document.getElementById('kwCase').value;
// Normalize whitespace
sql=sql.replace(/\s+/g,' ').trim();
// Uppercase/lowercase keywords
const sorted=[...KEYWORDS].sort((a,b)=>b.length-a.length);
sorted.forEach(kw=>{
const re=new RegExp('\\b'+kw.replace(/ /g,'\\s+')+'\\b','gi');
sql=sql.replace(re,kCase==='upper'?kw.toUpperCase():kw.toLowerCase());
});
// Add newlines before major keywords
const major=['SELECT','FROM','WHERE','ORDER BY','GROUP BY','HAVING','LIMIT','OFFSET','INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL JOIN','CROSS JOIN','JOIN','ON','UNION ALL','UNION','EXCEPT','INTERSECT','INSERT INTO','UPDATE','SET','DELETE FROM','VALUES','WITH','RETURNING','FETCH'];
const mSorted=[...major].sort((a,b)=>b.length-a.length);
mSorted.forEach(kw=>{
const target=kCase==='upper'?kw.toUpperCase():kw.toLowerCase();
const re=new RegExp('(?<!^)\\b('+target.replace(/ /g,'\\s+')+')\\b','g');
sql=sql.replace(re,'\n$1');
});
// Indent after SELECT, SET
const lines=sql.split('\n');
let result=[];
const indentAfter=kCase==='upper'?['SELECT','SET','VALUES']:['select','set','values'];
lines.forEach(line=>{
line=line.trim();
if(!line)return;
const firstWord=line.split(/\s/)[0].toUpperCase();
if(['AND','OR','ON'].includes(firstWord)){
result.push(ind+line);
}else if(indentAfter.some(k=>result.length>0&&result[result.length-1].trim().startsWith(k))){
if(!['FROM','WHERE','SET','VALUES','ORDER','GROUP','HAVING','LIMIT','JOIN','INNER','LEFT','RIGHT','FULL','CROSS','UNION','EXCEPT','INTERSECT','RETURNING','FETCH'].includes(firstWord)){
result.push(ind+line);
}else{result.push(line)}
}else{result.push(line)}
});
document.getElementById('sqlOutput').value=result.join('\n');
}

function minifySQL(){
let sql=document.getElementById('sqlInput').value.trim();
if(!sql)return;
document.getElementById('sqlOutput').value=sql.replace(/\s+/g,' ').replace(/\s*;\s*/g,';').trim();
}

function clearAll(){document.getElementById('sqlInput').value='';document.getElementById('sqlOutput').value=''}
'''
))

# 4. CSS Grid Generator
tools.append(dict(
    filename='css-grid-generator.html',
    title='CSS Grid Generator',
    description='Visual CSS Grid layout builder with live preview and code export. Free, no signup, 100% client-side.',
    share_text='Free CSS Grid Generator - build layouts visually!',
    extra_css='''.controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
.controls label{margin:0;display:flex;align-items:center;gap:6px}
.controls input[type=number]{width:60px}
.controls input[type=text]{width:120px}
.grid-preview{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;padding:20px;min-height:300px;display:grid;gap:8px}
.grid-preview .cell{background:#1a1a2e;border:2px solid #2a2a3a;border-radius:6px;display:flex;align-items:center;justify-content:center;min-height:60px;font-size:.8rem;color:#888;cursor:pointer;transition:all .2s}
.grid-preview .cell:hover{border-color:#ff5f1f}
.grid-preview .cell.selected{border-color:#ff5f1f;background:#ff5f1f20}
.code-output{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;padding:14px;font-family:monospace;font-size:.85rem;white-space:pre-wrap;overflow-x:auto;margin-top:16px;line-height:1.5}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">Configure Grid</h2>
<div class="controls">
<label>Columns: <input type="number" id="cols" value="3" min="1" max="12" onchange="buildGrid()"></label>
<label>Rows: <input type="number" id="rows" value="3" min="1" max="12" onchange="buildGrid()"></label>
<label>Col Sizes: <input type="text" id="colSizes" value="1fr 1fr 1fr" oninput="updateGrid()"></label>
<label>Row Sizes: <input type="text" id="rowSizes" value="auto auto auto" oninput="updateGrid()"></label>
<label>Gap: <input type="text" id="gap" value="8px" style="width:60px" oninput="updateGrid()"></label>
</div>
</div>
<div class="card">
<h3 style="color:#ff5f1f;margin-bottom:8px">Preview</h3>
<div class="grid-preview" id="gridPreview"></div>
</div>
<div class="card">
<h3 style="color:#ff5f1f;margin-bottom:8px">Generated CSS <button onclick="copyCode()" style="font-size:.75rem;padding:3px 8px;margin-left:8px">Copy</button></h3>
<div class="code-output" id="codeOutput"></div>
</div>''',
    script_code=r'''
function buildGrid(){
const c=parseInt(document.getElementById('cols').value)||3;
const r=parseInt(document.getElementById('rows').value)||3;
document.getElementById('colSizes').value=Array(c).fill('1fr').join(' ');
document.getElementById('rowSizes').value=Array(r).fill('auto').join(' ');
updateGrid();
}

function updateGrid(){
const c=parseInt(document.getElementById('cols').value)||3;
const r=parseInt(document.getElementById('rows').value)||3;
const colSizes=document.getElementById('colSizes').value||'1fr';
const rowSizes=document.getElementById('rowSizes').value||'auto';
const gap=document.getElementById('gap').value||'8px';
const preview=document.getElementById('gridPreview');
preview.style.gridTemplateColumns=colSizes;
preview.style.gridTemplateRows=rowSizes;
preview.style.gap=gap;
preview.innerHTML='';
for(let i=0;i<c*r;i++){
const cell=document.createElement('div');
cell.className='cell';
cell.textContent=i+1;
cell.onclick=()=>cell.classList.toggle('selected');
preview.appendChild(cell);
}
updateCode(colSizes,rowSizes,gap,c*r);
}

function updateCode(colSizes,rowSizes,gap,count){
const code=`.container {\n  display: grid;\n  grid-template-columns: ${colSizes};\n  grid-template-rows: ${rowSizes};\n  gap: ${gap};\n}\n\n/* ${count} child elements */\n.item {\n  /* styles */\n}`;
document.getElementById('codeOutput').textContent=code;
}

function copyCode(){
navigator.clipboard.writeText(document.getElementById('codeOutput').textContent).then(()=>showToast('CSS copied!'));
}

updateGrid();
'''
))

# 5. Color Contrast Checker
tools.append(dict(
    filename='color-contrast-checker.html',
    title='Color Contrast Checker',
    description='WCAG 2.1 AA/AAA contrast ratio checker. Test text and background color accessibility. Free, no signup.',
    share_text='Free WCAG Color Contrast Checker!',
    extra_css='''.color-inputs{display:flex;gap:20px;flex-wrap:wrap;align-items:center;justify-content:center}
.color-pick{text-align:center}
.color-pick input[type=color]{width:80px;height:80px;border:none;cursor:pointer;background:none;padding:0}
.color-pick input[type=text]{width:100px;text-align:center;margin-top:6px;font-family:monospace}
.preview-box{border-radius:10px;padding:30px;text-align:center;margin:20px 0}
.preview-box .large{font-size:1.6rem;font-weight:700;margin-bottom:8px}
.preview-box .normal{font-size:1rem}
.ratio-display{text-align:center;margin:16px 0}
.ratio-display .ratio{font-size:2.4rem;font-weight:800;color:#ff5f1f}
.results{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.result-badge{padding:10px 20px;border-radius:8px;font-weight:700;text-align:center;min-width:150px}
.pass{background:#1a3a1a;color:#3fb950;border:1px solid #3fb950}
.fail{background:#3a1a1a;color:#e06c75;border:1px solid #e06c75}
.swap-btn{background:none;border:1px solid #2a2a3a;color:#e0e0e0;font-size:1.2rem;padding:8px;cursor:pointer;border-radius:50%}
.swap-btn:hover{border-color:#ff5f1f;color:#ff5f1f;background:transparent}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:16px;text-align:center">Check Color Contrast</h2>
<div class="color-inputs">
<div class="color-pick"><label>Foreground (Text)</label><br><input type="color" id="fg" value="#e0e0e0" oninput="syncHex('fg');check()"><br><input type="text" id="fgHex" value="#e0e0e0" oninput="syncColor('fg');check()"></div>
<button class="swap-btn" onclick="swapColors()" title="Swap colors">&#8644;</button>
<div class="color-pick"><label>Background</label><br><input type="color" id="bg" value="#0a0a0f" oninput="syncHex('bg');check()"><br><input type="text" id="bgHex" value="#0a0a0f" oninput="syncColor('bg');check()"></div>
</div>
</div>
<div class="card">
<div class="preview-box" id="preview"><div class="large">Large Text Preview (18pt+)</div><div class="normal">Normal text preview (14pt). The quick brown fox jumps over the lazy dog.</div></div>
<div class="ratio-display">Contrast Ratio: <span class="ratio" id="ratio">—</span></div>
<div class="results" id="results"></div>
</div>''',
    script_code=r'''
function hexToRgb(hex){
hex=hex.replace('#','');
if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
return[parseInt(hex.substr(0,2),16),parseInt(hex.substr(2,2),16),parseInt(hex.substr(4,2),16)];
}

function luminance(r,g,b){
const[rs,gs,bs]=[r,g,b].map(c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)});
return 0.2126*rs+0.7152*gs+0.0722*bs;
}

function contrastRatio(fg,bg){
const l1=luminance(...fg);const l2=luminance(...bg);
const lighter=Math.max(l1,l2);const darker=Math.min(l1,l2);
return(lighter+0.05)/(darker+0.05);
}

function syncHex(id){document.getElementById(id+'Hex').value=document.getElementById(id).value}
function syncColor(id){const v=document.getElementById(id+'Hex').value;if(/^#[0-9a-fA-F]{6}$/.test(v))document.getElementById(id).value=v}

function swapColors(){
const fg=document.getElementById('fg').value;const bg=document.getElementById('bg').value;
document.getElementById('fg').value=bg;document.getElementById('bg').value=fg;
syncHex('fg');syncHex('bg');check();
}

function check(){
const fgHex=document.getElementById('fg').value;
const bgHex=document.getElementById('bg').value;
const fg=hexToRgb(fgHex);const bg=hexToRgb(bgHex);
const ratio=contrastRatio(fg,bg);
document.getElementById('ratio').textContent=ratio.toFixed(2)+':1';
const preview=document.getElementById('preview');
preview.style.color=fgHex;preview.style.backgroundColor=bgHex;
const aaLarge=ratio>=3;const aaaNormal=ratio>=7;const aaNormal=ratio>=4.5;const aaaLarge=ratio>=4.5;
document.getElementById('results').innerHTML=
'<div class="result-badge '+(aaNormal?'pass':'fail')+'">AA Normal '+(aaNormal?'PASS':'FAIL')+'<br><small>≥ 4.5:1</small></div>'+
'<div class="result-badge '+(aaLarge?'pass':'fail')+'">AA Large '+(aaLarge?'PASS':'FAIL')+'<br><small>≥ 3:1</small></div>'+
'<div class="result-badge '+(aaaNormal?'pass':'fail')+'">AAA Normal '+(aaaNormal?'PASS':'FAIL')+'<br><small>≥ 7:1</small></div>'+
'<div class="result-badge '+(aaaLarge?'pass':'fail')+'">AAA Large '+(aaaLarge?'PASS':'FAIL')+'<br><small>≥ 4.5:1</small></div>';
}

check();
'''
))

# 6. JSON Schema Generator
tools.append(dict(
    filename='json-schema-generator.html',
    title='JSON Schema Generator',
    description='Paste JSON data and generate a JSON Schema automatically. Free, no signup, 100% client-side.',
    share_text='Free JSON Schema Generator - paste JSON, get schema!',
    extra_css='''.areas{display:flex;gap:16px;flex-wrap:wrap}
.areas>div{flex:1;min-width:300px}
.areas textarea{font-family:monospace;min-height:350px;font-size:.85rem}
.options{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0;align-items:center}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">Paste JSON &rarr; Get JSON Schema</h2>
<div class="options">
<button onclick="generate()">Generate Schema</button>
<button class="secondary" onclick="navigator.clipboard.writeText(document.getElementById('schemaOut').value).then(()=>showToast('Copied!'))">Copy Schema</button>
<button class="secondary" onclick="loadSample()">Load Sample</button>
<label style="margin:0"><input type="checkbox" id="reqAll" checked> All fields required</label>
</div>
<div class="areas">
<div><label>Input JSON</label><textarea id="jsonIn" placeholder='{"name":"John","age":30,"active":true}'></textarea></div>
<div><label>Generated Schema</label><textarea id="schemaOut" readonly placeholder="Schema will appear here..."></textarea></div>
</div>
</div>''',
    script_code=r'''
function getType(val){
if(val===null)return'null';
if(Array.isArray(val))return'array';
return typeof val;
}

function generateSchema(val,reqAll){
const t=getType(val);
if(t==='object'){
const props={};const req=[];
Object.keys(val).forEach(k=>{
props[k]=generateSchema(val[k],reqAll);
if(reqAll)req.push(k);
});
const s={type:'object',properties:props};
if(req.length)s.required=req;
return s;
}
if(t==='array'){
if(val.length===0)return{type:'array',items:{}};
return{type:'array',items:generateSchema(val[0],reqAll)};
}
if(t==='number'){
return Number.isInteger(val)?{type:'integer'}:{type:'number'};
}
return{type:t};
}

function generate(){
const input=document.getElementById('jsonIn').value.trim();
if(!input){showToast('Paste JSON first');return}
try{
const data=JSON.parse(input);
const reqAll=document.getElementById('reqAll').checked;
const schema={$schema:'https://json-schema.org/draft/2020-12/schema',...generateSchema(data,reqAll)};
document.getElementById('schemaOut').value=JSON.stringify(schema,null,2);
showToast('Schema generated!');
}catch(e){
document.getElementById('schemaOut').value='Error: '+e.message;
showToast('Invalid JSON');
}
}

function loadSample(){
document.getElementById('jsonIn').value=JSON.stringify({name:"John Doe",age:30,email:"john@example.com",active:true,scores:[95,82,88],address:{street:"123 Main St",city:"Springfield",zip:"62704"}},null,2);
generate();
}
'''
))

# 7. SVG Icon Editor
tools.append(dict(
    filename='svg-icon-editor.html',
    title='SVG Icon Editor',
    description='Edit SVG paths with live preview. Change colors, sizes, stroke. Export SVG or copy code. Free, no signup.',
    share_text='Free SVG Icon Editor - edit paths, export SVG!',
    extra_css='''.editor-row{display:flex;gap:16px;flex-wrap:wrap}
.editor-row>div{flex:1;min-width:280px}
.preview-area{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;display:flex;align-items:center;justify-content:center;min-height:300px;padding:20px}
.preview-area svg{transition:all .2s}
.controls-grid{display:grid;gap:10px}
.ctrl{display:flex;align-items:center;gap:8px}
.ctrl label{min-width:80px;margin:0}
.ctrl input[type=range]{flex:1}
.ctrl input[type=color]{width:40px;height:30px;border:none;padding:0;cursor:pointer}
.code-box{font-family:monospace;font-size:.82rem;min-height:100px}
.preset-icons{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.preset-icons button{font-size:1.2rem;padding:6px;width:36px;height:36px;display:flex;align-items:center;justify-content:center}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">SVG Icon Editor</h2>
<div class="preset-icons">
<button onclick="loadPreset('star')" title="Star">&#9733;</button>
<button onclick="loadPreset('heart')" title="Heart">&#9829;</button>
<button onclick="loadPreset('check')" title="Check">&#10003;</button>
<button onclick="loadPreset('arrow')" title="Arrow">&#10140;</button>
<button onclick="loadPreset('home')" title="Home">&#8962;</button>
</div>
<div class="editor-row">
<div>
<label>SVG Path Data</label>
<textarea class="code-box" id="pathData" oninput="render()" placeholder="M10 20 L30 10 L50 20...">M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z</textarea>
<div class="controls-grid" style="margin-top:12px">
<div class="ctrl"><label>Fill</label><input type="color" id="fillColor" value="#ff5f1f" oninput="render()"><input type="text" id="fillHex" value="#ff5f1f" oninput="document.getElementById('fillColor').value=this.value;render()" style="width:80px"></div>
<div class="ctrl"><label>Stroke</label><input type="color" id="strokeColor" value="#ffffff" oninput="render()"><input type="text" id="strokeHex" value="#ffffff" style="width:80px" oninput="document.getElementById('strokeColor').value=this.value;render()"></div>
<div class="ctrl"><label>Stroke W.</label><input type="range" id="strokeWidth" min="0" max="5" step="0.5" value="0" oninput="render()"><span id="swVal">0</span></div>
<div class="ctrl"><label>Size</label><input type="range" id="svgSize" min="24" max="512" value="120" oninput="render()"><span id="sizeVal">120</span></div>
<div class="ctrl"><label>Rotation</label><input type="range" id="rotation" min="0" max="360" value="0" oninput="render()"><span id="rotVal">0°</span></div>
<div class="ctrl"><label>Viewbox</label><input type="text" id="viewBox" value="0 0 24 24" style="width:120px" oninput="render()"></div>
</div>
</div>
<div>
<label>Preview</label>
<div class="preview-area" id="preview"></div>
<div style="display:flex;gap:8px;margin-top:8px">
<button onclick="copySVG()">Copy SVG</button>
<button class="secondary" onclick="downloadSVG()">Download SVG</button>
</div>
</div>
</div>
</div>''',
    script_code=r'''
const PRESETS={
star:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
heart:'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
check:'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z',
arrow:'M5 12h14M12 5l7 7-7 7',
home:'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'
};

function loadPreset(name){document.getElementById('pathData').value=PRESETS[name];render()}

function render(){
const path=document.getElementById('pathData').value.trim();
const fill=document.getElementById('fillColor').value;
const stroke=document.getElementById('strokeColor').value;
const sw=document.getElementById('strokeWidth').value;
const size=document.getElementById('svgSize').value;
const rot=document.getElementById('rotation').value;
const vb=document.getElementById('viewBox').value;
document.getElementById('fillHex').value=fill;
document.getElementById('strokeHex').value=stroke;
document.getElementById('swVal').textContent=sw;
document.getElementById('sizeVal').textContent=size;
document.getElementById('rotVal').textContent=rot+'°';
const svg=buildSVG(path,fill,stroke,sw,size,rot,vb);
document.getElementById('preview').innerHTML=svg;
}

function buildSVG(path,fill,stroke,sw,size,rot,vb){
return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${esc(vb)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"><g transform="rotate(${rot} 12 12)"><path d="${esc(path)}"/></g></svg>`;
}

function getSVGCode(){
const path=document.getElementById('pathData').value.trim();
const fill=document.getElementById('fillColor').value;
const stroke=document.getElementById('strokeColor').value;
const sw=document.getElementById('strokeWidth').value;
const size=document.getElementById('svgSize').value;
const rot=document.getElementById('rotation').value;
const vb=document.getElementById('viewBox').value;
return buildSVG(path,fill,stroke,sw,size,rot,vb);
}

function copySVG(){navigator.clipboard.writeText(getSVGCode()).then(()=>showToast('SVG copied!'))}
function downloadSVG(){
const blob=new Blob([getSVGCode()],{type:'image/svg+xml'});
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='icon.svg';a.click();
}

render();
'''
))

# 8. Data URL Converter
tools.append(dict(
    filename='data-url-converter.html',
    title='Data URL Converter',
    description='Convert files to data URIs (base64). Supports images, fonts, SVG, and more. Free, no signup, 100% client-side.',
    share_text='Free Data URL Converter - files to base64 data URIs!',
    extra_css='''.drop-zone{border:2px dashed #2a2a3a;border-radius:10px;padding:40px;text-align:center;cursor:pointer;transition:border-color .2s;margin:12px 0}
.drop-zone:hover,.drop-zone.drag{border-color:#ff5f1f}
.output-area{font-family:monospace;font-size:.82rem;min-height:120px;word-break:break-all}
.preview-img{max-width:300px;max-height:300px;border-radius:8px;margin:10px 0}
.stats{color:#888;font-size:.85rem;margin:8px 0}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">Convert File to Data URL</h2>
<div class="drop-zone" id="dropZone" onclick="document.getElementById('fileInput').click()">
<p style="font-size:1.2rem;margin-bottom:8px">Drop a file here or click to browse</p>
<p style="color:#888;font-size:.85rem">Supports images, SVG, fonts, text files, and more</p>
</div>
<input type="file" id="fileInput" style="display:none" onchange="handleFile(this.files[0])">
</div>
<div class="card" id="resultCard" style="display:none">
<h3 style="color:#ff5f1f;margin-bottom:8px">Result</h3>
<div class="stats" id="stats"></div>
<div id="previewArea"></div>
<label>Data URL</label>
<textarea class="output-area" id="dataOutput" readonly></textarea>
<div style="display:flex;gap:8px;margin-top:8px">
<button onclick="navigator.clipboard.writeText(document.getElementById('dataOutput').value).then(()=>showToast('Copied!'))">Copy Data URL</button>
<button class="secondary" onclick="copyCSS()">Copy as CSS</button>
<button class="secondary" onclick="copyHTML()">Copy as &lt;img&gt;</button>
</div>
</div>''',
    script_code=r'''
const dropZone=document.getElementById('dropZone');
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('drag')});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('drag'));
dropZone.addEventListener('drop',e=>{e.preventDefault();dropZone.classList.remove('drag');if(e.dataTransfer.files.length)handleFile(e.dataTransfer.files[0])});

let currentDataURL='';
function handleFile(file){
if(!file)return;
const reader=new FileReader();
reader.onload=e=>{
currentDataURL=e.target.result;
document.getElementById('dataOutput').value=currentDataURL;
document.getElementById('resultCard').style.display='block';
const origSize=file.size;
const b64Size=currentDataURL.length;
document.getElementById('stats').innerHTML=`File: <strong>${esc(file.name)}</strong> | Type: <strong>${esc(file.type||'unknown')}</strong> | Original: <strong>${formatBytes(origSize)}</strong> | Data URL: <strong>${formatBytes(b64Size)}</strong> (${Math.round(b64Size/origSize*100)}% of original)`;
const preview=document.getElementById('previewArea');
if(file.type.startsWith('image/')){
preview.innerHTML='<img class="preview-img" src="'+currentDataURL+'">';
}else{preview.innerHTML=''}
};
reader.readAsDataURL(file);
}

function formatBytes(b){if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';return(b/1048576).toFixed(1)+' MB'}

function copyCSS(){
navigator.clipboard.writeText("background-image: url('"+currentDataURL+"');").then(()=>showToast('CSS copied!'));
}
function copyHTML(){
navigator.clipboard.writeText('<img src="'+currentDataURL+'" alt="">').then(()=>showToast('HTML copied!'));
}
'''
))

# 9. Lorem Ipsum Generator
tools.append(dict(
    filename='lorem-ipsum-generator.html',
    title='Lorem Ipsum Generator',
    description='Generate lorem ipsum placeholder text by paragraphs, sentences, or words. Free, no signup, 100% client-side.',
    share_text='Free Lorem Ipsum Generator with multiple modes!',
    extra_css='''.options{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:12px 0}
.options input[type=number]{width:70px}
.output-box{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;padding:20px;min-height:200px;line-height:1.7;font-size:.95rem;white-space:pre-wrap}
.stats{color:#888;font-size:.82rem;margin-top:8px}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">Lorem Ipsum Generator</h2>
<div class="options">
<label style="margin:0">Amount: <input type="number" id="amount" value="3" min="1" max="100"></label>
<label style="margin:0">Type: <select id="type" style="width:130px">
<option value="paragraphs">Paragraphs</option>
<option value="sentences">Sentences</option>
<option value="words">Words</option>
</select></label>
<label style="margin:0"><input type="checkbox" id="startLorem" checked> Start with "Lorem ipsum..."</label>
<button onclick="generate()">Generate</button>
<button class="secondary" onclick="navigator.clipboard.writeText(document.getElementById('output').textContent).then(()=>showToast('Copied!'))">Copy</button>
</div>
</div>
<div class="card">
<div class="output-box" id="output"></div>
<div class="stats" id="stats"></div>
</div>''',
    script_code=r'''
const WORDS='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum perspiciatis unde omnis iste natus error voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis quasi architecto beatae vitae dicta explicabo nemo ipsam quia voluptas aspernatur aut odit fugit consequuntur magni dolores eos ratione sequi nesciunt neque porro quisquam dolorem adipisci numquam eius modi tempora corporis suscipit laboriosam aliquid commodi consequatur vel illum blanditiis praesentium voluptatum deleniti atque corrupti quos quas molestias'.split(' ');
const FIRST='Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

function randWord(){return WORDS[Math.floor(Math.random()*WORDS.length)]}
function randSentence(){
const len=8+Math.floor(Math.random()*12);
let s=[];for(let i=0;i<len;i++)s.push(randWord());
s[0]=s[0][0].toUpperCase()+s[0].slice(1);
return s.join(' ')+'.';
}
function randParagraph(){
const len=4+Math.floor(Math.random()*4);
let sents=[];for(let i=0;i<len;i++)sents.push(randSentence());
return sents.join(' ');
}

function generate(){
const amount=parseInt(document.getElementById('amount').value)||3;
const type=document.getElementById('type').value;
const startLorem=document.getElementById('startLorem').checked;
let result='';
if(type==='paragraphs'){
let paras=[];for(let i=0;i<amount;i++)paras.push(randParagraph());
if(startLorem&&paras.length)paras[0]=FIRST+' '+paras[0];
result=paras.join('\n\n');
}else if(type==='sentences'){
let sents=[];for(let i=0;i<amount;i++)sents.push(randSentence());
if(startLorem&&sents.length)sents[0]=FIRST;
result=sents.join(' ');
}else{
let words=[];for(let i=0;i<amount;i++)words.push(randWord());
if(startLorem)words[0]='lorem';
result=words.join(' ');
}
document.getElementById('output').textContent=result;
const wc=result.split(/\s+/).length;
const cc=result.length;
document.getElementById('stats').textContent=`Words: ${wc} | Characters: ${cc}`;
}

generate();
'''
))

# 10. CSS Animation Easing
tools.append(dict(
    filename='css-animation-easing.html',
    title='CSS Animation Easing Editor',
    description='Cubic-bezier curve editor with live animation preview. Design custom CSS easing functions. Free, no signup.',
    share_text='Free CSS Cubic-Bezier Easing Editor with live preview!',
    extra_css='''canvas{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;cursor:crosshair}
.easing-row{display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start}
.easing-row>div{flex:1;min-width:280px}
.preview-track{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;height:60px;margin:12px 0;position:relative;overflow:hidden}
.preview-ball{width:40px;height:40px;background:#ff5f1f;border-radius:50%;position:absolute;top:10px;left:0}
.preset-btns{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
.preset-btns button{font-size:.75rem;padding:4px 8px}
.code-out{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;padding:12px;font-family:monospace;font-size:.9rem;margin:8px 0}
.vals{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.vals label{margin:0;display:flex;align-items:center;gap:4px}
.vals input{width:70px}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">Cubic-Bezier Easing Editor</h2>
<div class="preset-btns">
<button onclick="setPoints(.25,.1,.25,1)">ease</button>
<button onclick="setPoints(0,0,1,1)">linear</button>
<button onclick="setPoints(.42,0,1,1)">ease-in</button>
<button onclick="setPoints(0,0,.58,1)">ease-out</button>
<button onclick="setPoints(.42,0,.58,1)">ease-in-out</button>
<button onclick="setPoints(.68,-.55,.265,1.55)">back</button>
<button onclick="setPoints(.17,.67,.83,.67)">smooth</button>
<button onclick="setPoints(.6,-.28,.735,.045)">bounce-like</button>
</div>
<div class="easing-row">
<div>
<canvas id="canvas" width="300" height="300"></canvas>
<div class="vals">
<label>x1 <input type="number" id="x1" step="0.01" value="0.25" onchange="updateFromInputs()"></label>
<label>y1 <input type="number" id="y1" step="0.01" value="0.1" onchange="updateFromInputs()"></label>
<label>x2 <input type="number" id="x2" step="0.01" value="0.25" onchange="updateFromInputs()"></label>
<label>y2 <input type="number" id="y2" step="0.01" value="1" onchange="updateFromInputs()"></label>
</div>
</div>
<div>
<label>Preview</label>
<div class="preview-track" id="track"><div class="preview-ball" id="ball"></div></div>
<button onclick="animate()">Play Animation</button>
<label style="margin-top:12px">Duration: <input type="range" id="duration" min="200" max="3000" value="1000" style="width:150px" oninput="document.getElementById('durVal').textContent=this.value+'ms'"> <span id="durVal">1000ms</span></label>
<div class="code-out" id="codeOut">cubic-bezier(0.25, 0.1, 0.25, 1)</div>
<button onclick="navigator.clipboard.writeText(document.getElementById('codeOut').textContent).then(()=>showToast('Copied!'))">Copy</button>
</div>
</div>
</div>''',
    script_code=r'''
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
let cp=[.25,.1,.25,1];
let dragging=null;
const PAD=40;const W=300-2*PAD;

function toCanvas(x,y){return[PAD+x*W,PAD+(1-y)*W]}
function fromCanvas(cx,cy){return[Math.max(0,Math.min(1,(cx-PAD)/W)),Math.max(-0.5,Math.min(1.5,1-(cy-PAD)/W))]}

function draw(){
ctx.clearRect(0,0,300,300);
ctx.strokeStyle='#2a2a3a';ctx.lineWidth=1;
ctx.strokeRect(PAD,PAD,W,W);
// Diagonal
ctx.beginPath();ctx.setLineDash([4,4]);ctx.moveTo(...toCanvas(0,0));ctx.lineTo(...toCanvas(1,1));ctx.stroke();ctx.setLineDash([]);
// Control lines
ctx.strokeStyle='#555';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(...toCanvas(0,0));ctx.lineTo(...toCanvas(cp[0],cp[1]));ctx.stroke();
ctx.beginPath();ctx.moveTo(...toCanvas(1,1));ctx.lineTo(...toCanvas(cp[2],cp[3]));ctx.stroke();
// Curve
ctx.strokeStyle='#ff5f1f';ctx.lineWidth=3;ctx.beginPath();
ctx.moveTo(...toCanvas(0,0));
const steps=100;
for(let i=1;i<=steps;i++){
const t=i/steps;
const x=3*(1-t)*(1-t)*t*cp[0]+3*(1-t)*t*t*cp[2]+t*t*t;
const y=3*(1-t)*(1-t)*t*cp[1]+3*(1-t)*t*t*cp[3]+t*t*t;
ctx.lineTo(...toCanvas(x,y));
}
ctx.stroke();
// Control points
[[cp[0],cp[1]],[cp[2],cp[3]]].forEach(([x,y],i)=>{
const[cx,cy]=toCanvas(x,y);
ctx.beginPath();ctx.arc(cx,cy,7,0,Math.PI*2);ctx.fillStyle=i===0?'#e06c75':'#61afef';ctx.fill();
ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
});
updateCode();
}

function updateCode(){
const s=`cubic-bezier(${cp[0].toFixed(2)}, ${cp[1].toFixed(2)}, ${cp[2].toFixed(2)}, ${cp[3].toFixed(2)})`;
document.getElementById('codeOut').textContent=s;
document.getElementById('x1').value=cp[0].toFixed(2);
document.getElementById('y1').value=cp[1].toFixed(2);
document.getElementById('x2').value=cp[2].toFixed(2);
document.getElementById('y2').value=cp[3].toFixed(2);
}

canvas.addEventListener('mousedown',e=>{
const rect=canvas.getBoundingClientRect();
const mx=e.clientX-rect.left;const my=e.clientY-rect.top;
[[cp[0],cp[1],0],[cp[2],cp[3],1]].forEach(([x,y,idx])=>{
const[cx,cy]=toCanvas(x,y);
if(Math.hypot(mx-cx,my-cy)<15)dragging=idx;
});
});

canvas.addEventListener('mousemove',e=>{
if(dragging===null)return;
const rect=canvas.getBoundingClientRect();
const[x,y]=fromCanvas(e.clientX-rect.left,e.clientY-rect.top);
cp[dragging*2]=Math.max(0,Math.min(1,x));
cp[dragging*2+1]=y;
draw();
});

canvas.addEventListener('mouseup',()=>{dragging=null});
canvas.addEventListener('mouseleave',()=>{dragging=null});

function setPoints(x1,y1,x2,y2){cp=[x1,y1,x2,y2];draw()}
function updateFromInputs(){
cp=[parseFloat(document.getElementById('x1').value)||0,parseFloat(document.getElementById('y1').value)||0,parseFloat(document.getElementById('x2').value)||0,parseFloat(document.getElementById('y2').value)||0];
draw();
}

function animate(){
const ball=document.getElementById('ball');
const dur=document.getElementById('duration').value;
ball.style.transition='none';
ball.style.left='0px';
requestAnimationFrame(()=>{requestAnimationFrame(()=>{
ball.style.transition=`left ${dur}ms cubic-bezier(${cp.join(',')})`;
ball.style.left=(document.getElementById('track').offsetWidth-40)+'px';
})});
}

draw();
'''
))

# 11. Image Compressor
tools.append(dict(
    filename='image-compressor.html',
    title='Image Compressor',
    description='Client-side image compression with quality slider. Compare before/after sizes. Free, no signup, 100% private.',
    share_text='Free Image Compressor - compress images in your browser!',
    extra_css='''.drop-zone{border:2px dashed #2a2a3a;border-radius:10px;padding:40px;text-align:center;cursor:pointer;transition:border-color .2s;margin:12px 0}
.drop-zone:hover,.drop-zone.drag{border-color:#ff5f1f}
.compare{display:flex;gap:16px;flex-wrap:wrap}
.compare>div{flex:1;min-width:250px;text-align:center}
.compare img{max-width:100%;max-height:300px;border-radius:8px;border:1px solid #1a1a2e}
.slider-row{display:flex;align-items:center;gap:12px;margin:16px 0}
.slider-row input[type=range]{flex:1}
.stats-row{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin:12px 0}
.stat-box{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;padding:12px 20px;text-align:center}
.stat-box .val{font-size:1.4rem;color:#ff5f1f;font-weight:700}
.stat-box .lbl{font-size:.78rem;color:#888}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">Image Compressor</h2>
<div class="drop-zone" id="dropZone" onclick="document.getElementById('fileInput').click()">
<p style="font-size:1.2rem;margin-bottom:8px">Drop an image or click to browse</p>
<p style="color:#888;font-size:.85rem">PNG, JPG, WebP supported</p>
</div>
<input type="file" id="fileInput" accept="image/*" style="display:none" onchange="loadImage(this.files[0])">
</div>
<div class="card" id="resultCard" style="display:none">
<div class="slider-row">
<span>Quality:</span>
<input type="range" id="quality" min="1" max="100" value="75" oninput="compress()">
<span id="qualVal">75%</span>
<label style="margin:0">Format: <select id="format" style="width:100px" onchange="compress()"><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option><option value="image/png">PNG</option></select></label>
</div>
<div class="stats-row" id="statsRow"></div>
<div class="compare">
<div><h3 style="color:#888;margin-bottom:8px">Original</h3><img id="origImg"></div>
<div><h3 style="color:#888;margin-bottom:8px">Compressed</h3><img id="compImg"></div>
</div>
<button onclick="download()" style="margin-top:12px">Download Compressed</button>
</div>''',
    script_code=r'''
const dropZone=document.getElementById('dropZone');
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('drag')});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('drag'));
dropZone.addEventListener('drop',e=>{e.preventDefault();dropZone.classList.remove('drag');if(e.dataTransfer.files.length)loadImage(e.dataTransfer.files[0])});

let origFile=null;let origImg=null;let compBlob=null;

function loadImage(file){
if(!file)return;
origFile=file;
const url=URL.createObjectURL(file);
document.getElementById('origImg').src=url;
origImg=new Image();
origImg.onload=()=>{compress()};
origImg.src=url;
document.getElementById('resultCard').style.display='block';
}

function compress(){
if(!origImg)return;
const q=parseInt(document.getElementById('quality').value)/100;
document.getElementById('qualVal').textContent=Math.round(q*100)+'%';
const fmt=document.getElementById('format').value;
const canvas=document.createElement('canvas');
canvas.width=origImg.naturalWidth;canvas.height=origImg.naturalHeight;
const ctx=canvas.getContext('2d');
ctx.drawImage(origImg,0,0);
canvas.toBlob(blob=>{
compBlob=blob;
document.getElementById('compImg').src=URL.createObjectURL(blob);
const origSize=origFile.size;const compSize=blob.size;
const saved=origSize-compSize;const pct=Math.round((saved/origSize)*100);
document.getElementById('statsRow').innerHTML=
`<div class="stat-box"><div class="val">${formatBytes(origSize)}</div><div class="lbl">Original</div></div>`+
`<div class="stat-box"><div class="val">${formatBytes(compSize)}</div><div class="lbl">Compressed</div></div>`+
`<div class="stat-box"><div class="val">${pct>0?pct+'%':'N/A'}</div><div class="lbl">Saved</div></div>`+
`<div class="stat-box"><div class="val">${origImg.naturalWidth}×${origImg.naturalHeight}</div><div class="lbl">Dimensions</div></div>`;
},fmt,q);
}

function formatBytes(b){if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';return(b/1048576).toFixed(1)+' MB'}

function download(){
if(!compBlob)return;
const a=document.createElement('a');
a.href=URL.createObjectURL(compBlob);
const ext=document.getElementById('format').value.split('/')[1];
a.download='compressed.'+ext;
a.click();
}
'''
))

# 12. Pomodoro Timer
tools.append(dict(
    filename='pomodoro-timer.html',
    title='Pomodoro Timer',
    description='Pomodoro work/break timer with session stats and notifications. Free, no signup, 100% client-side.',
    share_text='Free Pomodoro Timer with stats tracking!',
    extra_css='''.timer-display{text-align:center;padding:40px 20px}
.timer-display .time{font-size:5rem;font-weight:800;color:#ff5f1f;font-variant-numeric:tabular-nums;letter-spacing:4px}
.timer-display .phase{font-size:1.2rem;color:#888;margin-bottom:20px;text-transform:uppercase;letter-spacing:2px}
.timer-controls{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.timer-controls button{min-width:100px}
.settings{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin:16px 0}
.settings label{margin:0;display:flex;align-items:center;gap:6px}
.settings input{width:60px}
.stats-grid{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:16px}
.stat{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;padding:14px 24px;text-align:center;min-width:120px}
.stat .num{font-size:1.6rem;color:#ff5f1f;font-weight:700}
.stat .lbl{font-size:.78rem;color:#888}
.progress-ring{margin:10px 0}''',
    body_html='''<div class="card">
<div class="timer-display">
<div class="phase" id="phase">Work</div>
<div class="time" id="time">25:00</div>
<div class="progress-ring"><progress id="prog" value="0" max="1" style="width:80%;height:6px;accent-color:#ff5f1f"></progress></div>
<div class="timer-controls">
<button onclick="startTimer()" id="startBtn">Start</button>
<button class="secondary" onclick="pauseTimer()" id="pauseBtn" disabled>Pause</button>
<button class="secondary" onclick="resetTimer()">Reset</button>
<button class="secondary" onclick="skipPhase()">Skip</button>
</div>
</div>
<div class="settings">
<label>Work: <input type="number" id="workMin" value="25" min="1" max="90"> min</label>
<label>Short Break: <input type="number" id="shortMin" value="5" min="1" max="30"> min</label>
<label>Long Break: <input type="number" id="longMin" value="15" min="1" max="60"> min</label>
<label>Long break every: <input type="number" id="longEvery" value="4" min="2" max="10"> sessions</label>
<label><input type="checkbox" id="autoStart"> Auto-start next</label>
<label><input type="checkbox" id="notifOn" onchange="requestNotif()"> Notifications</label>
</div>
</div>
<div class="card">
<h3 style="color:#ff5f1f;text-align:center;margin-bottom:8px">Session Stats</h3>
<div class="stats-grid" id="statsGrid"></div>
<div style="text-align:center;margin-top:12px"><button class="secondary" onclick="resetStats()" style="font-size:.75rem">Reset Stats</button></div>
</div>''',
    script_code=r'''
const LS='spunkcodes_pomodoro';
let stats=JSON.parse(localStorage.getItem(LS))||{completed:0,totalWork:0,today:0,todayDate:''};
let phase='work';let remaining=25*60;let timer=null;let totalTime=25*60;let sessions=0;

function saveStats(){localStorage.setItem(LS,JSON.stringify(stats))}

function getMin(id){return parseInt(document.getElementById(id).value)||1}

function startTimer(){
if(timer)return;
const btn=document.getElementById('startBtn');btn.disabled=true;
document.getElementById('pauseBtn').disabled=false;
timer=setInterval(()=>{
remaining--;
if(remaining<=0){clearInterval(timer);timer=null;onPhaseEnd()}
renderTime();
},1000);
}

function pauseTimer(){
clearInterval(timer);timer=null;
document.getElementById('startBtn').disabled=false;
document.getElementById('pauseBtn').disabled=true;
}

function resetTimer(){
pauseTimer();
if(phase==='work')remaining=getMin('workMin')*60;
else if(phase==='short')remaining=getMin('shortMin')*60;
else remaining=getMin('longMin')*60;
totalTime=remaining;
renderTime();
}

function skipPhase(){pauseTimer();remaining=0;onPhaseEnd()}

function onPhaseEnd(){
if(phase==='work'){
sessions++;stats.completed++;stats.totalWork+=getMin('workMin');
const today=new Date().toDateString();
if(stats.todayDate!==today){stats.todayDate=today;stats.today=0}
stats.today++;
saveStats();
if(sessions%getMin('longEvery')===0){phase='long'}else{phase='short'}
}else{phase='work'}
setPhase(phase);
notify(phase==='work'?'Time to work!':'Take a break!');
if(document.getElementById('autoStart').checked)startTimer();
renderStats();
}

function setPhase(p){
phase=p;
const names={work:'Work',short:'Short Break',long:'Long Break'};
document.getElementById('phase').textContent=names[p];
if(p==='work')remaining=getMin('workMin')*60;
else if(p==='short')remaining=getMin('shortMin')*60;
else remaining=getMin('longMin')*60;
totalTime=remaining;
renderTime();
document.getElementById('startBtn').disabled=false;
document.getElementById('pauseBtn').disabled=true;
}

function renderTime(){
const m=Math.floor(remaining/60);const s=remaining%60;
document.getElementById('time').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
document.getElementById('prog').value=totalTime>0?(totalTime-remaining)/totalTime:0;
document.title=(phase==='work'?'🍅':'☕')+' '+document.getElementById('time').textContent+' - Pomodoro';
}

function renderStats(){
const today=new Date().toDateString();
if(stats.todayDate!==today){stats.today=0}
document.getElementById('statsGrid').innerHTML=
`<div class="stat"><div class="num">${stats.completed}</div><div class="lbl">Total Sessions</div></div>`+
`<div class="stat"><div class="num">${stats.today}</div><div class="lbl">Today</div></div>`+
`<div class="stat"><div class="num">${stats.totalWork}m</div><div class="lbl">Total Focus</div></div>`+
`<div class="stat"><div class="num">${Math.round(stats.totalWork/60*10)/10}h</div><div class="lbl">Hours</div></div>`;
}

function resetStats(){if(confirm('Reset all stats?')){stats={completed:0,totalWork:0,today:0,todayDate:''};saveStats();renderStats()}}

function notify(msg){
try{if(document.getElementById('notifOn').checked&&Notification.permission==='granted')new Notification('Pomodoro',{body:msg,icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🍅</text></svg>'})}catch(e){}
try{new Audio('data:audio/wav;base64,UklGRl9vT19teleVBhdmVmbXQgEA').play()}catch(e){}
}

function requestNotif(){if(document.getElementById('notifOn').checked&&'Notification'in window)Notification.requestPermission()}

renderTime();renderStats();
'''
))

# 13. Diff Viewer
tools.append(dict(
    filename='diff-viewer.html',
    title='Diff Viewer',
    description='Side-by-side text diff viewer with color-coded additions and deletions. Free, no signup, 100% client-side.',
    share_text='Free Side-by-Side Diff Viewer!',
    extra_css='''.diff-inputs{display:flex;gap:16px;flex-wrap:wrap}
.diff-inputs>div{flex:1;min-width:280px}
.diff-inputs textarea{font-family:monospace;min-height:200px;font-size:.85rem}
.diff-output{font-family:monospace;font-size:.85rem;line-height:1.6;overflow-x:auto}
.diff-table{width:100%;border-collapse:collapse}
.diff-table td{padding:2px 8px;vertical-align:top;border-bottom:1px solid #1a1a2e;white-space:pre-wrap;word-break:break-all}
.diff-table .ln{color:#555;text-align:right;width:40px;user-select:none;border-right:1px solid #1a1a2e;padding-right:6px}
.diff-table .add{background:#1a3a1a;color:#3fb950}
.diff-table .del{background:#3a1a1a;color:#e06c75}
.diff-table .mod{background:#3a2a1a;color:#d19a66}
.diff-stats{display:flex;gap:12px;margin:12px 0;font-size:.85rem}
.diff-stats span{padding:4px 10px;border-radius:6px}
.diff-stats .s-add{background:#1a3a1a;color:#3fb950}
.diff-stats .s-del{background:#3a1a1a;color:#e06c75}
.diff-stats .s-same{background:#1a1a2e;color:#888}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">Text Diff Viewer</h2>
<div class="diff-inputs">
<div><label>Original Text</label><textarea id="textA" placeholder="Paste original text here..."></textarea></div>
<div><label>Modified Text</label><textarea id="textB" placeholder="Paste modified text here..."></textarea></div>
</div>
<div style="display:flex;gap:8px;margin-top:12px">
<button onclick="computeDiff()">Compare</button>
<button class="secondary" onclick="swapTexts()">Swap</button>
<button class="secondary" onclick="clearAll()">Clear</button>
<button class="secondary" onclick="loadSample()">Sample</button>
</div>
</div>
<div class="card" id="resultCard" style="display:none">
<div class="diff-stats" id="diffStats"></div>
<div class="diff-output" id="diffOutput"></div>
</div>''',
    script_code=r'''
function computeDiff(){
const a=document.getElementById('textA').value.split('\n');
const b=document.getElementById('textB').value.split('\n');
const lcs=lcsMatrix(a,b);
const diff=buildDiff(a,b,lcs);
renderDiff(diff);
document.getElementById('resultCard').style.display='block';
}

function lcsMatrix(a,b){
const m=a.length,n=b.length;
const dp=Array(m+1).fill(null).map(()=>Array(n+1).fill(0));
for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){
if(a[i-1]===b[j-1])dp[i][j]=dp[i-1][j-1]+1;
else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);
}
return dp;
}

function buildDiff(a,b,dp){
const diff=[];let i=a.length,j=b.length;
while(i>0||j>0){
if(i>0&&j>0&&a[i-1]===b[j-1]){
diff.unshift({type:'same',a:a[i-1],b:b[j-1],ln_a:i,ln_b:j});i--;j--;
}else if(j>0&&(i===0||dp[i][j-1]>=dp[i-1][j])){
diff.unshift({type:'add',b:b[j-1],ln_b:j});j--;
}else{
diff.unshift({type:'del',a:a[i-1],ln_a:i});i--;
}
}
return diff;
}

function renderDiff(diff){
let adds=0,dels=0,same=0;
let html='<table class="diff-table">';
diff.forEach(d=>{
if(d.type==='same'){same++;
html+=`<tr><td class="ln">${d.ln_a}</td><td>${esc(d.a)}</td><td class="ln">${d.ln_b}</td><td>${esc(d.b)}</td></tr>`;
}else if(d.type==='del'){dels++;
html+=`<tr><td class="ln">${d.ln_a}</td><td class="del">- ${esc(d.a)}</td><td class="ln"></td><td></td></tr>`;
}else{adds++;
html+=`<tr><td class="ln"></td><td></td><td class="ln">${d.ln_b}</td><td class="add">+ ${esc(d.b)}</td></tr>`;
}
});
html+='</table>';
document.getElementById('diffOutput').innerHTML=html;
document.getElementById('diffStats').innerHTML=
`<span class="s-add">+${adds} added</span><span class="s-del">-${dels} removed</span><span class="s-same">${same} unchanged</span>`;
}

function swapTexts(){const a=document.getElementById('textA').value;document.getElementById('textA').value=document.getElementById('textB').value;document.getElementById('textB').value=a}
function clearAll(){document.getElementById('textA').value='';document.getElementById('textB').value='';document.getElementById('resultCard').style.display='none'}
function loadSample(){
document.getElementById('textA').value='function hello() {\n  console.log("Hello World");\n  return true;\n}\n\nconst x = 42;';
document.getElementById('textB').value='function hello() {\n  console.log("Hello Universe");\n  return true;\n}\n\nconst x = 100;\nconst y = 200;';
computeDiff();
}
'''
))

# 14. ASCII Art Generator
tools.append(dict(
    filename='ascii-art-generator.html',
    title='ASCII Art Generator',
    description='Convert text to ASCII art with multiple font styles. Free, no signup, 100% client-side.',
    share_text='Free ASCII Art Generator - text to ASCII art!',
    extra_css='''.ascii-output{background:#16161e;border:1px solid #1a1a2e;border-radius:8px;padding:20px;font-family:monospace;font-size:.7rem;line-height:1.1;overflow-x:auto;white-space:pre;min-height:120px}
.font-btns{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
.font-btns button{font-size:.78rem;padding:4px 10px}
.font-btns button.active{background:#ff5f1f;color:#fff}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">Text to ASCII Art</h2>
<label>Enter Text</label>
<input type="text" id="textInput" placeholder="Hello World" value="SPUNK" oninput="render()" maxlength="30">
<div class="font-btns" id="fontBtns"></div>
<div style="display:flex;gap:8px;margin:8px 0">
<button onclick="navigator.clipboard.writeText(document.getElementById('output').textContent).then(()=>showToast('Copied!'))">Copy</button>
<button class="secondary" onclick="downloadTxt()">Download .txt</button>
</div>
</div>
<div class="card">
<div class="ascii-output" id="output"></div>
</div>''',
    script_code=r'''
// Simple block font maps
const FONTS={
block:{height:5,chars:{
'A':['  █  ','█   █','█████','█   █','█   █'],'B':['████ ','█   █','████ ','█   █','████ '],
'C':[' ████','█    ','█    ','█    ',' ████'],'D':['████ ','█   █','█   █','█   █','████ '],
'E':['█████','█    ','████ ','█    ','█████'],'F':['█████','█    ','████ ','█    ','█    '],
'G':[' ████','█    ','█  ██','█   █',' ████'],'H':['█   █','█   █','█████','█   █','█   █'],
'I':['█████','  █  ','  █  ','  █  ','█████'],'J':['█████','    █','    █','█   █',' ███ '],
'K':['█   █','█  █ ','███  ','█  █ ','█   █'],'L':['█    ','█    ','█    ','█    ','█████'],
'M':['█   █','██ ██','█ █ █','█   █','█   █'],'N':['█   █','██  █','█ █ █','█  ██','█   █'],
'O':[' ███ ','█   █','█   █','█   █',' ███ '],'P':['████ ','█   █','████ ','█    ','█    '],
'Q':[' ███ ','█   █','█ █ █','█  █ ',' ██ █'],'R':['████ ','█   █','████ ','█  █ ','█   █'],
'S':[' ████','█    ',' ███ ','    █','████ '],'T':['█████','  █  ','  █  ','  █  ','  █  '],
'U':['█   █','█   █','█   █','█   █',' ███ '],'V':['█   █','█   █','█   █',' █ █ ','  █  '],
'W':['█   █','█   █','█ █ █','██ ██','█   █'],'X':['█   █',' █ █ ','  █  ',' █ █ ','█   █'],
'Y':['█   █',' █ █ ','  █  ','  █  ','  █  '],'Z':['█████','   █ ','  █  ',' █   ','█████'],
'0':[' ███ ','█  ██','█ █ █','██  █',' ███ '],'1':['  █  ',' ██  ','  █  ','  █  ',' ███ '],
'2':[' ███ ','█   █','  ██ ',' █   ','█████'],'3':[' ███ ','█   █','  ██ ','█   █',' ███ '],
'4':['█   █','█   █','█████','    █','    █'],'5':['█████','█    ','████ ','    █','████ '],
'6':[' ███ ','█    ','████ ','█   █',' ███ '],'7':['█████','    █','   █ ','  █  ',' █   '],
'8':[' ███ ','█   █',' ███ ','█   █',' ███ '],'9':[' ███ ','█   █',' ████','    █',' ███ '],
' ':['     ','     ','     ','     ','     '],
'!':['  █  ','  █  ','  █  ','     ','  █  '],'.':['     ','     ','     ','     ','  █  '],
'-':['     ','     ','█████','     ','     '],'_':['     ','     ','     ','     ','█████'],
}},
shadow:{height:5,chars:{
'A':['  ▄  ','▐█ █▌','▐███▌','▐▌ ▐▌','▀▘ ▀▘'],'B':['▐██▄ ','▐▌ ▐▌','▐██▄ ','▐▌ ▐▌','▐██▀ '],
'C':[' ▄██▌','▐▌   ','▐▌   ','▐▌   ',' ▀██▌'],'D':['▐██▄ ','▐▌ ▐▌','▐▌ ▐▌','▐▌ ▐▌','▐██▀ '],
'E':['▐███▌','▐▌   ','▐██▌ ','▐▌   ','▐███▌'],'F':['▐███▌','▐▌   ','▐██▌ ','▐▌   ','▐▌   '],
' ':['     ','     ','     ','     ','     '],
}},
mini:{height:3,chars:{
'A':[' █ ','█▀█','█ █'],'B':['██ ','█▄ ','██▀'],'C':['▄█▄','█  ','▀█▀'],
'D':['█▄ ','█ █','█▀ '],'E':['██▄','█▄ ','██▀'],'F':['██▄','█▄ ','█  '],
'G':['▄█▄','█ ▄','▀█▀'],'H':['█ █','███','█ █'],'I':['███',' █ ','███'],
'J':['███','  █','▀█ '],'K':['█▄▀','██ ','█ █'],'L':['█  ','█  ','███'],
'M':['█▄█','█▀█','█ █'],'N':['█▀█','█▐█','█ █'],'O':['▄█▄','█ █','▀█▀'],
'P':['██▄','█▀ ','█  '],'Q':['▄█▄','█ █','▀██'],'R':['██▄','█▀▄','█ █'],
'S':['▄██','▀█▄','██▀'],'T':['███',' █ ',' █ '],'U':['█ █','█ █','▀█▀'],
'V':['█ █','█ █',' ▀ '],'W':['█ █','█▄█','█▀█'],'X':['█ █',' █ ','█ █'],
'Y':['█ █',' █ ',' █ '],'Z':['██▀',' █ ','▀██'],
'0':['▄█▄','█ █','▀█▀'],'1':[' █ ','██ ',' █ '],'2':['▀█▄',' █ ','█▀▀'],
'3':['██▄',' █▄','██▀'],'4':['█ █','▀█▀','  █'],'5':['██▄','▀█▄','██▀'],
'6':['▄█▄','██▄','▀█▀'],'7':['██▀','  █','  █'],'8':['▄█▄','▄█▄','▀█▀'],'9':['▄█▄','▀██','▀█▀'],
' ':['   ','   ','   '],'!':['█','█','▀'],'.':['  ','  ','█'],'-':['   ','███','   '],
}},
};

let currentFont='block';

function buildFontBtns(){
const el=document.getElementById('fontBtns');
el.innerHTML='';
Object.keys(FONTS).forEach(f=>{
const btn=document.createElement('button');
btn.textContent=f.charAt(0).toUpperCase()+f.slice(1);
btn.className=f===currentFont?'active':'secondary';
btn.onclick=()=>{currentFont=f;buildFontBtns();render()};
el.appendChild(btn);
});
}

function render(){
const text=document.getElementById('textInput').value.toUpperCase();
const font=FONTS[currentFont];
const lines=Array(font.height).fill('');
for(const ch of text){
const glyph=font.chars[ch]||font.chars[' ']||Array(font.height).fill('     ');
for(let r=0;r<font.height;r++){
lines[r]+=(glyph[r]||'     ')+' ';
}
}
document.getElementById('output').textContent=lines.join('\n');
}

function downloadTxt(){
const blob=new Blob([document.getElementById('output').textContent],{type:'text/plain'});
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ascii-art.txt';a.click();
}

buildFontBtns();render();
'''
))

# 15. Unit Converter
tools.append(dict(
    filename='unit-converter.html',
    title='Unit Converter',
    description='Universal unit converter: length, weight, temperature, data, time, area, volume, speed. Free, no signup.',
    share_text='Free Universal Unit Converter!',
    extra_css='''.cat-btns{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
.cat-btns button{font-size:.82rem;padding:6px 12px}
.cat-btns button.active{background:#ff5f1f}
.converter-row{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;margin:16px 0}
.converter-row>div{flex:1;min-width:200px}
.converter-row input{font-size:1.2rem;padding:12px}
.result-big{font-size:2rem;color:#ff5f1f;font-weight:700;text-align:center;margin:16px 0}
.all-results{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:16px}
.all-results .item{background:#16161e;border:1px solid #1a1a2e;border-radius:6px;padding:8px 12px;font-size:.85rem}
.all-results .item .val{color:#ff5f1f;font-weight:600}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:8px">Unit Converter</h2>
<div class="cat-btns" id="catBtns"></div>
<div class="converter-row">
<div><label>Value</label><input type="number" id="val" value="1" oninput="convert()"></div>
<div><label>From</label><select id="fromUnit" onchange="convert()"></select></div>
<div><label>To</label><select id="toUnit" onchange="convert()"></select></div>
</div>
<div class="result-big" id="result">—</div>
<button class="secondary" onclick="swapUnits()">Swap Units</button>
</div>
<div class="card">
<h3 style="color:#ff5f1f;margin-bottom:8px">All Conversions</h3>
<div class="all-results" id="allResults"></div>
</div>''',
    script_code=r'''
const CATS={
length:{name:'Length',base:'m',units:{mm:0.001,cm:0.01,m:1,km:1000,in:0.0254,ft:0.3048,yd:0.9144,mi:1609.344}},
weight:{name:'Weight',base:'kg',units:{mg:0.000001,g:0.001,kg:1,t:1000,oz:0.0283495,lb:0.453592,st:6.35029}},
temperature:{name:'Temperature',base:'C',units:{C:1,F:1,K:1},custom:true},
data:{name:'Data',base:'B',units:{B:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776,bit:0.125}},
time:{name:'Time',base:'s',units:{ms:0.001,s:1,min:60,hr:3600,day:86400,week:604800,month:2592000,year:31536000}},
area:{name:'Area',base:'m2',units:{'mm²':0.000001,'cm²':0.0001,'m²':1,'km²':1000000,'in²':0.00064516,'ft²':0.092903,'ac':4046.86,'ha':10000}},
volume:{name:'Volume',base:'L',units:{mL:0.001,L:1,gal:3.78541,qt:0.946353,pt:0.473176,cup:0.236588,'fl oz':0.0295735,'m³':1000}},
speed:{name:'Speed',base:'m/s',units:{'m/s':1,'km/h':0.277778,'mph':0.44704,'kn':0.514444,'ft/s':0.3048}},
};

let currentCat='length';

function buildCatBtns(){
const el=document.getElementById('catBtns');
el.innerHTML='';
Object.keys(CATS).forEach(k=>{
const btn=document.createElement('button');
btn.textContent=CATS[k].name;
btn.className=k===currentCat?'active':'secondary';
btn.onclick=()=>{currentCat=k;buildCatBtns();populateUnits();convert()};
el.appendChild(btn);
});
}

function populateUnits(){
const cat=CATS[currentCat];
const fromEl=document.getElementById('fromUnit');
const toEl=document.getElementById('toUnit');
fromEl.innerHTML='';toEl.innerHTML='';
Object.keys(cat.units).forEach((u,i)=>{
fromEl.innerHTML+=`<option value="${u}" ${i===0?'selected':''}>${u}</option>`;
toEl.innerHTML+=`<option value="${u}" ${i===1?'selected':''}>${u}</option>`;
});
}

function convert(){
const val=parseFloat(document.getElementById('val').value);
if(isNaN(val)){document.getElementById('result').textContent='—';return}
const from=document.getElementById('fromUnit').value;
const to=document.getElementById('toUnit').value;
const cat=CATS[currentCat];
let result;
if(cat.custom&&currentCat==='temperature'){
result=convertTemp(val,from,to);
}else{
const base=val*cat.units[from];
result=base/cat.units[to];
}
document.getElementById('result').textContent=formatNum(result)+' '+to;
// All conversions
const allEl=document.getElementById('allResults');
allEl.innerHTML='';
Object.keys(cat.units).forEach(u=>{
let r;
if(cat.custom&&currentCat==='temperature'){r=convertTemp(val,from,u)}
else{r=(val*cat.units[from])/cat.units[u]}
allEl.innerHTML+=`<div class="item"><span class="val">${formatNum(r)}</span> ${u}</div>`;
});
}

function convertTemp(val,from,to){
let c;
if(from==='C')c=val;else if(from==='F')c=(val-32)*5/9;else c=val-273.15;
if(to==='C')return c;if(to==='F')return c*9/5+32;return c+273.15;
}

function formatNum(n){
if(Math.abs(n)<0.0001&&n!==0)return n.toExponential(4);
if(Math.abs(n)>=1e9)return n.toExponential(4);
return parseFloat(n.toPrecision(8)).toString();
}

function swapUnits(){
const f=document.getElementById('fromUnit');const t=document.getElementById('toUnit');
const tmp=f.value;f.value=t.value;t.value=tmp;convert();
}

buildCatBtns();populateUnits();convert();
'''
))

# 16. Text to Speech
tools.append(dict(
    filename='text-to-speech.html',
    title='Text to Speech',
    description='Browser-based text-to-speech using Web Speech API. Control voice, rate, pitch, volume. Free, no signup.',
    share_text='Free Text-to-Speech tool - browser-based, no signup!',
    extra_css='''.tts-textarea{min-height:150px;font-size:1rem}
.controls-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin:16px 0}
.ctrl{display:flex;align-items:center;gap:8px}
.ctrl label{min-width:60px;margin:0}
.ctrl input[type=range]{flex:1}
.ctrl span{min-width:40px;text-align:right;color:#ff5f1f;font-weight:600}
.play-controls{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:16px 0}
.play-controls button{min-width:100px;font-size:1rem;padding:10px 20px}
.char-count{text-align:right;font-size:.78rem;color:#888;margin-top:4px}
.status{text-align:center;color:#888;font-size:.9rem;margin:8px 0}
.presets{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.presets button{font-size:.75rem;padding:4px 8px}''',
    body_html='''<div class="card">
<h2 style="color:#ff5f1f;margin-bottom:12px">Text to Speech</h2>
<textarea class="tts-textarea" id="textInput" placeholder="Type or paste text here...">Hello! Welcome to the SPUNK CODES text-to-speech tool. This is completely free and runs in your browser.</textarea>
<div class="char-count"><span id="charCount">0</span> characters</div>
<div class="presets">
<button onclick="setText('The quick brown fox jumps over the lazy dog.')">Pangram</button>
<button onclick="setText('To be, or not to be, that is the question.')">Shakespeare</button>
<button onclick="setText('In the beginning was the Word, and the Word was with God, and the Word was God.')">Bible</button>
</div>
</div>
<div class="card">
<label>Voice</label>
<select id="voiceSelect" style="margin-bottom:8px"></select>
<div class="controls-grid">
<div class="ctrl"><label>Rate</label><input type="range" id="rate" min="0.1" max="3" step="0.1" value="1" oninput="updateVal('rate')"><span id="rateVal">1.0</span></div>
<div class="ctrl"><label>Pitch</label><input type="range" id="pitch" min="0" max="2" step="0.1" value="1" oninput="updateVal('pitch')"><span id="pitchVal">1.0</span></div>
<div class="ctrl"><label>Volume</label><input type="range" id="volume" min="0" max="1" step="0.1" value="1" oninput="updateVal('volume')"><span id="volumeVal">1.0</span></div>
</div>
<div class="play-controls">
<button onclick="speak()" id="speakBtn">&#9654; Speak</button>
<button class="secondary" onclick="pauseResume()" id="pauseBtn">Pause</button>
<button class="secondary" onclick="stopSpeech()">Stop</button>
</div>
<div class="status" id="status">Ready</div>
</div>''',
    script_code=r'''
const synth=window.speechSynthesis;
let voices=[];
let speaking=false;

function loadVoices(){
voices=synth.getVoices();
const sel=document.getElementById('voiceSelect');
sel.innerHTML='';
voices.forEach((v,i)=>{
sel.innerHTML+=`<option value="${i}">${esc(v.name)} (${esc(v.lang)})${v.default?' - DEFAULT':''}</option>`;
});
}

loadVoices();
if(synth.onvoiceschanged!==undefined)synth.onvoiceschanged=loadVoices;

function updateVal(id){
const v=document.getElementById(id).value;
document.getElementById(id+'Val').textContent=parseFloat(v).toFixed(1);
}

function setText(t){document.getElementById('textInput').value=t;updateCharCount()}

document.getElementById('textInput').addEventListener('input',updateCharCount);
function updateCharCount(){document.getElementById('charCount').textContent=document.getElementById('textInput').value.length}
updateCharCount();

function speak(){
synth.cancel();
const text=document.getElementById('textInput').value.trim();
if(!text){showToast('Enter some text first');return}
const utter=new SpeechSynthesisUtterance(text);
const vi=document.getElementById('voiceSelect').value;
if(voices[vi])utter.voice=voices[vi];
utter.rate=parseFloat(document.getElementById('rate').value);
utter.pitch=parseFloat(document.getElementById('pitch').value);
utter.volume=parseFloat(document.getElementById('volume').value);
utter.onstart=()=>{speaking=true;document.getElementById('status').textContent='Speaking...';document.getElementById('speakBtn').textContent='Speaking...'};
utter.onend=()=>{speaking=false;document.getElementById('status').textContent='Done';document.getElementById('speakBtn').textContent='▶ Speak'};
utter.onerror=()=>{speaking=false;document.getElementById('status').textContent='Error';document.getElementById('speakBtn').textContent='▶ Speak'};
synth.speak(utter);
}

function pauseResume(){
if(synth.paused){synth.resume();document.getElementById('pauseBtn').textContent='Pause';document.getElementById('status').textContent='Speaking...'}
else if(synth.speaking){synth.pause();document.getElementById('pauseBtn').textContent='Resume';document.getElementById('status').textContent='Paused'}
}

function stopSpeech(){
synth.cancel();speaking=false;
document.getElementById('status').textContent='Stopped';
document.getElementById('speakBtn').textContent='▶ Speak';
document.getElementById('pauseBtn').textContent='Pause';
}
'''
))

# ─── GENERATE ALL FILES ───

def main():
    count = 0
    for tool in tools:
        filepath = os.path.join(OUTDIR, tool['filename'])
        html = build_page(
            filename=tool['filename'],
            title=tool['title'],
            description=tool['description'],
            extra_css=tool['extra_css'],
            body_html=tool['body_html'],
            script_code=tool['script_code'],
            share_text=tool['share_text'],
        )
        with open(filepath, 'w') as f:
            f.write(html)
        count += 1
        print(f"  Created: {tool['filename']}")
    print(f"\nDone! Generated {count} tools.")

if __name__ == '__main__':
    main()
