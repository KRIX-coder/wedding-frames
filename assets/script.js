(function(){
  var b=document.querySelector('.menu-btn'),m=document.getElementById('mnav');
  function setMenu(o){if(!m)return;if(o){m.hidden=false;m.classList.add('open');requestAnimationFrame(function(){m.classList.add('show')})}else{m.classList.remove('show');setTimeout(function(){if(!m.classList.contains('show')){m.classList.remove('open');m.hidden=true}},350)}
    document.body.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o);if(o){var c=m.querySelector('.mclose');c&&c.focus()}else b.focus()}
  if(b&&m){b.addEventListener('click',function(){setMenu(true)});
    m.querySelector('.mclose').addEventListener('click',function(){setMenu(false)});
    m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){if(a.getAttribute('href').charAt(0)==='#')return;setMenu(false)})});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.classList.contains('show'))setMenu(false)});
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
    var auto=t.hasAttribute('data-auto')&&!reduce,half=0,pos=0,paused=false,idle=null,last=null,SPEED=28;
    function step(){var c=t.querySelector('.cat');return c?c.offsetWidth+20:300}
    if(auto){
      var kids=[].slice.call(t.children);
      kids.forEach(function(c){var d=c.cloneNode(true);d.setAttribute('aria-hidden','true');d.tabIndex=-1;t.appendChild(d)});
      t.classList.add('auto');
    }
    function measure(){var c=t.children;if(auto&&c.length)half=c[c.length/2].offsetLeft-c[0].offsetLeft}
    function upd(){if(auto)return;p.disabled=t.scrollLeft<4;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-4}
    function hold(ms){paused=true;clearTimeout(idle);if(ms)idle=setTimeout(function(){pos=t.scrollLeft;paused=false},ms)}
    p.addEventListener('click',function(){t.scrollBy({left:-step(),behavior:'smooth'});if(auto)hold(2500)});
    n.addEventListener('click',function(){t.scrollBy({left:step(),behavior:'smooth'});if(auto)hold(2500)});
    t.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',function(){measure();upd()});
    t.addEventListener('keydown',function(e){if(e.key==='ArrowRight')t.scrollBy({left:step(),behavior:'smooth'});if(e.key==='ArrowLeft')t.scrollBy({left:-step(),behavior:'smooth'})});
    measure();upd();
    if(!auto)return;
    ['mouseenter','focusin'].forEach(function(ev){w.addEventListener(ev,function(){hold(0)})});
    ['mouseleave','focusout'].forEach(function(ev){w.addEventListener(ev,function(){hold(800)})});
    ['touchstart','pointerdown','wheel'].forEach(function(ev){t.addEventListener(ev,function(){hold(2500)},{passive:true})});
    var visible=true;if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting}).observe(w);
    function tick(ts){
      if(last===null)last=ts;var dt=Math.min(ts-last,64)/1000;last=ts;
      if(!paused&&visible&&half){pos+=SPEED*dt;if(pos>=half)pos-=half;t.scrollLeft=pos}
      else if(paused)pos=t.scrollLeft;
      if(half&&t.scrollLeft>=half){t.scrollLeft-=half;pos=t.scrollLeft}
      requestAnimationFrame(tick);
    }
    window.addEventListener('load',measure);requestAnimationFrame(tick);
  });
  // Photo slots: show image only if the file exists
  document.querySelectorAll('.slot img').forEach(function(i){i.hidden=true;i.addEventListener('load',function(){i.hidden=false});i.addEventListener('error',function(){i.remove()});if(i.complete&&i.naturalWidth)i.hidden=false});
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
    dd.addEventListener('keydown',function(e){var isOpen=dd.classList.contains('open');
      if(e.key==='Escape'&&isOpen){open(false);btn.focus()}
      else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!isOpen)open(true);else{cur=(cur+(e.key==='ArrowDown'?1:-1)+opts.length)%opts.length;hl()}}
      else if((e.key==='Enter'||e.key===' ')&&isOpen&&e.target===btn&&cur>-1){e.preventDefault();pick(cur)}});
  }
  // Contact form -> opens WhatsApp with the enquiry prefilled (number set in data-whatsapp on the form)
  var f=document.getElementById('enquiry');
  if(f)f.addEventListener('submit',function(e){
    e.preventDefault();
    var d=new FormData(f),to=(f.dataset.whatsapp||'').replace(/\D/g,'');
    function v(k){return (d.get(k)||'').toString().trim()||'-'}
    var dt=v('date');if(dt!=='-'){var p=dt.split('-');if(p.length===3)dt=p[2]+'/'+p[1]+'/'+p[0]}
    var msg=['*New enquiry – Wedding Frames*','','*Name:* '+v('name'),'*Email:* '+v('email'),'*Phone:* '+v('phone'),'*Event date:* '+dt,'*Looking for:* '+(v('service')==='Other'&&v('other')!=='-'?'Other – '+v('other'):v('service')),'*Location:* '+v('location'),'','*Our story:*',v('message')].join('\n');
    var url='https://wa.me/'+to+'?text='+encodeURIComponent(msg);
    var s=document.querySelector('.sent');if(s)s.style.display='block';
    window.open(url,'_blank','noopener')||(location.href=url);
  });
})();
