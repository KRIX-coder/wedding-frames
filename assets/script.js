(function(){
  var b=document.querySelector('.menu-btn'),m=document.getElementById('mnav');
  function setMenu(o){if(!m)return;if(o){m.hidden=false;m.classList.add('open');requestAnimationFrame(function(){m.classList.add('show')})}else{m.classList.remove('show');setTimeout(function(){if(!m.classList.contains('show')){m.classList.remove('open');m.hidden=true}},350)}
    document.body.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o);if(o){var c=m.querySelector('.mclose');c&&c.focus()}else b.focus()}
  if(b&&m){b.addEventListener('click',function(){setMenu(true)});
    m.querySelector('.mclose').addEventListener('click',function(){setMenu(false)});
    m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){if(a.getAttribute('href').charAt(0)==='#')return;setMenu(false)})});
    document.addEventListener('keydown',function(e){
      if(!m.classList.contains('show'))return;
      if(e.key==='Escape'){setMenu(false);return}
      // keep Tab focus inside the open menu (it is an aria-modal dialog)
      if(e.key==='Tab'){var f=[].slice.call(m.querySelectorAll('a[href],button')).filter(function(x){return x.offsetParent!==null});
        if(!f.length)return;var a=f[0],z=f[f.length-1];
        var ae=document.activeElement;
        if(!m.contains(ae)){e.preventDefault();(e.shiftKey?z:a).focus()}
        else if(e.shiftKey&&ae===a){e.preventDefault();z.focus()}
        else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
    window.addEventListener('resize',function(){if(innerWidth>860&&m.classList.contains('show'))setMenu(false)})}
  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(e){io.observe(e)});
  }else els.forEach(function(e){e.classList.add('in')});
  // Horizontal scroller: arrows + slow auto-slide (pauses on hover/focus/touch)
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.hs-wrap').forEach(function(w){
    var t=w.querySelector('.hscroll'),p=w.querySelector('.hs-prev'),n=w.querySelector('.hs-next');
    var auto=t.hasAttribute('data-auto')&&!reduce,half=0,pos=0,last=null,SPEED=28,RESUME=2500;
    // pause state: the carousel only moves itself when nobody is touching/hovering/focusing it and no
    // user-driven scroll (drag, iOS momentum glide, arrow/keyboard smooth-scroll) has happened for RESUME ms
    var touching=false,hovering=false,kbFocus=false,quietAt=0,speed=0,lastSet=-1;
    function poke(ms){quietAt=Math.max(quietAt,performance.now()+(ms||RESUME))}
    function step(){var c=t.querySelector('.cat');return c?c.offsetWidth+20:300}
    if(auto){
      var kids=[].slice.call(t.children);
      kids.forEach(function(c){var d=c.cloneNode(true);d.setAttribute('aria-hidden','true');d.tabIndex=-1;t.appendChild(d)});
      t.classList.add('auto');
    }
    function measure(){var c=t.children;if(auto&&c.length)half=c[c.length/2].offsetLeft-c[0].offsetLeft}
    function upd(){if(auto)return;p.disabled=t.scrollLeft<4;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-4}
    p.addEventListener('click',function(){poke();t.scrollBy({left:-step(),behavior:'smooth'})});
    n.addEventListener('click',function(){poke();t.scrollBy({left:step(),behavior:'smooth'})});
    t.addEventListener('scroll',function(){
      // any scroll we didn't write ourselves (finger, momentum glide, smooth arrow scroll) keeps it paused
      if(auto&&Math.abs(t.scrollLeft-lastSet)>1.5)poke();
      upd()},{passive:true});
    window.addEventListener('resize',function(){measure();upd()});
    t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){poke();t.scrollBy({left:step(),behavior:'smooth'})}if(e.key==='ArrowLeft'){poke();t.scrollBy({left:-step(),behavior:'smooth'})}});
    measure();upd();
    if(!auto)return;
    // finger down = fully paused until it lifts (the old code started a 2.5s timer on touchstart, so a long
    // drag or iOS momentum glide got fought by the auto-scroll -> flicker)
    t.addEventListener('touchstart',function(){touching=true;poke()},{passive:true});
    ['touchend','touchcancel'].forEach(function(ev){t.addEventListener(ev,function(){touching=false;poke()},{passive:true})});
    t.addEventListener('wheel',function(){poke()},{passive:true});
    // hover/focus pauses only for a real mouse / keyboard (iPhone fires fake mouseenter on tap, which froze it)
    w.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')hovering=true});
    w.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'){hovering=false;poke(800)}});
    w.addEventListener('focusin',function(e){try{kbFocus=e.target.matches(':focus-visible')}catch(_){kbFocus=false}});
    w.addEventListener('focusout',function(){kbFocus=false;poke(800)});
    var visible=true;if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting}).observe(w);
    function tick(ts){
      if(last===null)last=ts;var dt=Math.min(ts-last,64)/1000;last=ts;
      if(touching||hovering||kbFocus||performance.now()<quietAt||!visible||!half){
        speed=0;pos=t.scrollLeft;            // hands off: never write scrollLeft while the user is in control
      }else{
        speed=Math.min(SPEED,speed+SPEED*dt/0.8); // ease back in over ~0.8s instead of snapping to full speed
        pos+=speed*dt;
        if(pos>=half)pos-=half;              // loop wrap happens only here, never under a finger
        lastSet=pos;t.scrollLeft=pos;
      }
      requestAnimationFrame(tick);
    }
    window.addEventListener('load',measure);requestAnimationFrame(tick);
  });
  // Photo slots: if a photo file is missing, drop the broken <img> and show the "Add photo" hint.
  // (Images are no longer hidden while loading, which would stop loading="lazy" from ever fetching them.)
  document.querySelectorAll('.slot img').forEach(function(i){
    function miss(){var s=i.parentNode;if(s)s.classList.add('missing');i.remove()}
    i.addEventListener('error',miss);if(i.complete&&!i.naturalWidth&&i.getAttribute('src'))miss()});
  // Touch screens: photos turn from black & white to colour once they're on screen
  // (desktop keeps colour-on-hover). Reverts when scrolled away so the effect replays.
  if(window.matchMedia&&matchMedia('(hover: none)').matches&&'IntersectionObserver' in window){
    var cio=new IntersectionObserver(function(es){es.forEach(function(e){
      var rb=e.rootBounds,ir=e.intersectionRect;
      // "reached" = at least half of the photo showing, or it fills most of the visible band (tall photos / hero)
      var on=e.isIntersecting&&(e.intersectionRatio>=.5||(rb&&ir.height>=rb.height*.6&&ir.width>=e.boundingClientRect.width*.5));
      e.target.classList.toggle('in-color',on)})},{rootMargin:'-12% 0px -12% 0px',threshold:[0,.25,.5,.75,1]});
    document.querySelectorAll('.hero,.slot').forEach(function(el){cio.observe(el)});
  }
  // Portfolio marquee: tap to pause/resume on touch screens (hover already pauses on desktop)
  document.querySelectorAll('.marquee').forEach(function(mq){mq.addEventListener('click',function(){mq.classList.toggle('paused')})});
  // Custom dropdown
  var dd=document.getElementById('dd');
  if(dd){
    var btn=dd.querySelector('.dd-btn'),list=dd.querySelector('.dd-list'),val=document.getElementById('dd-v'),hid=document.getElementById('service'),oth=document.getElementById('other'),opts=[].slice.call(list.children),cur=-1;
    function open(o){dd.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);if(o){cur=Math.max(0,opts.findIndex(function(x){return x.dataset.v===hid.value}));hl()}}
    function hl(){opts.forEach(function(x,i){x.classList.toggle('hl',i===cur)});if(opts[cur])opts[cur].scrollIntoView({block:'nearest'})}
    function pick(i){var o=opts[i];hid.value=o.dataset.v;val.textContent=o.dataset.v;val.classList.remove('ph-t');opts.forEach(function(x){x.setAttribute('aria-selected',x===o)});
      var isO=o.dataset.v==='Other';oth.hidden=!isO;oth.required=isO;if(isO)oth.focus();else{oth.value='';}open(false);if(!isO)btn.focus()}
    btn.addEventListener('click',function(){open(!dd.classList.contains('open'))});
    opts.forEach(function(o,i){o.addEventListener('click',function(){pick(i)})});
    document.addEventListener('click',function(e){if(!dd.contains(e.target))open(false)});
    dd.addEventListener('focusout',function(e){if(!dd.contains(e.relatedTarget))open(false)});
    dd.addEventListener('keydown',function(e){var isOpen=dd.classList.contains('open');
      if(e.key==='Escape'&&isOpen){open(false);btn.focus()}
      else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!isOpen)open(true);else{cur=(cur+(e.key==='ArrowDown'?1:-1)+opts.length)%opts.length;hl()}}
      else if((e.key==='Enter'||e.key===' ')&&isOpen&&e.target===btn&&cur>-1){e.preventDefault();pick(cur)}});
  }
  // Contact form -> opens WhatsApp with the enquiry prefilled (number set in data-whatsapp on the form)
  var f=document.getElementById('enquiry');
  // event date can't be in the past
  var di=document.getElementById('date');
  if(di){var td=new Date();td.setMinutes(td.getMinutes()-td.getTimezoneOffset());di.min=td.toISOString().slice(0,10)}
  if(f)f.addEventListener('submit',function(e){
    e.preventDefault();
    var d=new FormData(f),to=(f.dataset.whatsapp||'').replace(/\D/g,'');
    function v(k){return (d.get(k)||'').toString().trim()||'-'}
    var dt=v('date');if(dt!=='-'){var p=dt.split('-');if(p.length===3)dt=p[2]+'/'+p[1]+'/'+p[0]}
    var msg=['*New enquiry – Wedding Frames*','','*Name:* '+v('name'),'*Email:* '+v('email'),'*Phone:* '+v('phone'),'*Event date:* '+dt,'*Looking for:* '+(v('service')==='Other'&&v('other')!=='-'?'Other – '+v('other'):v('service')),'*Location:* '+v('location'),'','*Our story:*',v('message')].join('\n');
    var url='https://wa.me/'+to+'?text='+encodeURIComponent(msg);
    var s=document.querySelector('.sent');if(s)s.style.display='block';
    // window.open(..., 'noopener') always returns null, which used to trigger the fallback too and
    // navigate this tab away as well. Open normally, cut the opener link, and only fall back if blocked.
    var w=window.open(url,'_blank');
    if(w){try{w.opener=null}catch(_){}}else location.href=url;
  });
})();
