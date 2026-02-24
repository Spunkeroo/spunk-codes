/* Spunk Network Universal Referral v1.0 — Cross-domain referral tracking */
(function(){
  'use strict';
  var STORAGE_KEY='spunk_referred_by',DISMISSED_KEY='spunk_ref_banner_dismissed';
  var SITES=['spunk.codes','spunk.bet','spunkart.com'];

  /* Read ?ref= from URL */
  function getRefParam(){
    var m=location.search.match(/[?&]ref=([^&#]+)/);
    return m?decodeURIComponent(m[1]):null;
  }

  /* Store referrer */
  function storeRef(code){
    if(!code) return;
    localStorage.setItem(STORAGE_KEY,code);
    /* Also store timestamp for expiry tracking */
    localStorage.setItem(STORAGE_KEY+'_ts',Date.now().toString());
  }

  /* Get stored referrer */
  function getRef(){
    return localStorage.getItem(STORAGE_KEY);
  }

  /* Track via GA4 */
  function trackReferral(code){
    if(typeof gtag==='function'){
      gtag('event','referral_visit',{
        ref:code,
        page:location.pathname,
        site:location.hostname
      });
    }
  }

  /* Show referral banner */
  function showBanner(code){
    if(localStorage.getItem(DISMISSED_KEY)) return;
    var banner=document.createElement('div');
    var s=banner.style;
    s.position='fixed';s.bottom='16px';s.right='16px';s.maxWidth='340px';
    s.padding='14px 18px';s.borderRadius='10px';
    s.background='linear-gradient(135deg,#1a1a2e,#16213e)';
    s.border='1px solid rgba(0,255,136,.3)';s.color='#e0e0e0';
    s.fontSize='13px';s.fontFamily='system-ui,sans-serif';s.lineHeight='1.5';
    s.zIndex='99998';s.boxShadow='0 4px 20px rgba(0,0,0,.4)';
    banner.innerHTML='<div style="display:flex;justify-content:space-between;align-items:start"><div><strong style="color:#00ff88">Welcome!</strong> You were referred by a Spunk Network member!<br>Use code <strong style="color:#00d4ff">SPUNK</strong> for 5 free premium tools</div><button id="spunk-ref-close" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px;padding:0 0 0 10px;line-height:1">&times;</button></div>';
    document.body.appendChild(banner);
    document.getElementById('spunk-ref-close').addEventListener('click',function(){
      banner.remove();
      localStorage.setItem(DISMISSED_KEY,'1');
    });
  }

  /* Cross-domain: append ref to outbound Spunk Network links */
  function patchLinks(code){
    if(!code) return;
    var host=location.hostname;
    document.addEventListener('click',function(e){
      var a=e.target.closest('a');
      if(!a||!a.href) return;
      for(var i=0;i<SITES.length;i++){
        if(a.href.indexOf(SITES[i])!==-1&&a.href.indexOf(host)===-1){
          var sep=a.href.indexOf('?')===-1?'?':'&';
          if(a.href.indexOf('ref=')===-1) a.href+=sep+'ref='+encodeURIComponent(code);
          break;
        }
      }
    });
  }

  /* Init */
  function init(){
    var param=getRefParam();
    var stored=getRef();
    var code=param||stored;
    if(param){
      storeRef(param);
      trackReferral(param);
      showBanner(param);
    }else if(stored&&!localStorage.getItem(DISMISSED_KEY)){
      /* Returning user with stored ref — still show banner if not dismissed */
    }
    patchLinks(code);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
