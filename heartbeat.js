/* Spunk Network Heartbeat v1.0 — Universal page health monitor */
(function(){
  'use strict';
  var INTERVAL=10000,MAX_CHECKS=5,checked={},errBanner=null,dot=null;

  /* LIVE pulsing dot — bottom-left, tiny, unobtrusive */
  function createDot(){
    dot=document.createElement('div');
    dot.id='spunk-hb-dot';
    var s=dot.style;
    s.position='fixed';s.bottom='8px';s.left='8px';s.width='6px';s.height='6px';
    s.borderRadius='50%';s.background='#0f0';s.zIndex='99999';s.pointerEvents='none';
    s.boxShadow='0 0 4px #0f0';s.opacity='0.7';
    var style=document.createElement('style');
    style.textContent='@keyframes spunk-hb-pulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}#spunk-hb-dot{animation:spunk-hb-pulse 2s ease-in-out infinite}';
    document.head.appendChild(style);
    document.body.appendChild(dot);
  }

  /* Error banner — shown when critical elements missing */
  function showError(msg){
    if(!errBanner){
      errBanner=document.createElement('div');
      var s=errBanner.style;
      s.position='fixed';s.top='0';s.left='0';s.width='100%';s.padding='8px 16px';
      s.background='#d32f2f';s.color='#fff';s.fontSize='13px';s.fontFamily='system-ui,sans-serif';
      s.textAlign='center';s.zIndex='100000';s.transition='transform .3s';
      document.body.appendChild(errBanner);
    }
    errBanner.textContent=msg;
    errBanner.style.transform='translateY(0)';
  }
  function hideError(){
    if(errBanner) errBanner.style.transform='translateY(-100%)';
  }

  /* Check internal links — HEAD requests, same-origin only, max 5 per cycle */
  function checkLinks(){
    var links=document.querySelectorAll('a[href]');
    var origin=location.origin,count=0,bad=[];
    for(var i=0;i<links.length&&count<MAX_CHECKS;i++){
      var href=links[i].href;
      if(href.indexOf(origin)!==0||checked[href]) continue;
      checked[href]=true;count++;
      (function(url){
        var x=new XMLHttpRequest();
        x.open('HEAD',url,true);
        x.timeout=5000;
        x.onload=function(){if(x.status>=400) bad.push(url);};
        x.onerror=function(){bad.push(url);};
        x.send();
      })(href);
    }
  }

  /* Auto-refresh elements with data-auto-update="true" from localStorage */
  function autoRefresh(){
    var els=document.querySelectorAll('[data-auto-update="true"]');
    for(var i=0;i<els.length;i++){
      var key=els[i].getAttribute('data-update-key');
      if(key){
        var val=localStorage.getItem(key);
        if(val!==null) els[i].textContent=val;
      }
    }
  }

  /* Critical element check */
  function checkCritical(){
    var missing=[];
    if(!document.querySelector('nav')&&!document.querySelector('[role="navigation"]')) missing.push('navigation');
    if(!document.querySelector('main')&&!document.querySelector('[role="main"]')&&!document.querySelector('.main')) missing.push('main content');
    if(missing.length){
      showError('Page issue: Missing '+missing.join(', '));
      return false;
    }
    hideError();
    return true;
  }

  /* GA4 heartbeat event */
  function trackHeartbeat(status){
    if(typeof gtag==='function'){
      gtag('event','heartbeat',{page:location.pathname,status:status});
    }
  }

  /* Set dot color */
  function setDotStatus(healthy){
    if(!dot) return;
    dot.style.background=healthy?'#0f0':'#f44';
    dot.style.boxShadow='0 0 4px '+(healthy?'#0f0':'#f44');
  }

  /* Main heartbeat cycle */
  function beat(){
    var healthy=checkCritical();
    checkLinks();
    autoRefresh();
    setDotStatus(healthy);
    trackHeartbeat(healthy?'healthy':'degraded');
  }

  /* Init */
  function init(){
    createDot();
    beat();
    setInterval(beat,INTERVAL);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
