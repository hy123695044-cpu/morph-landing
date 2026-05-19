var C = window.CONTENT;

/* Shared placeholder avatars (Chinese surname initials) - replace with real photos later */
var _photos = [];
/* Generate nice avatar icons: 兵姐-themed */
var _avatarStyles = [
  {char:'兵',bg:'linear-gradient(145deg,#c4956a,#d4733e)'},
  {char:'姐',bg:'linear-gradient(145deg,#d4733e,#c4956a)'},
  {char:'战',bg:'linear-gradient(145deg,#7a9a5a,#5a8a4a)'},
  {char:'友',bg:'linear-gradient(145deg,#5a9a8a,#4a8a7a)'},
  {char:'家',bg:'linear-gradient(145deg,#6a9ac8,#5a8ab8)'},
  {char:'竹',bg:'linear-gradient(145deg,#5a8a4a,#7aba6a)'},
  {char:'康',bg:'linear-gradient(145deg,#d4a86a,#c08850)'},
  {char:'养',bg:'linear-gradient(145deg,#b88a6a,#a87a5a)'},
  {char:'乐',bg:'linear-gradient(145deg,#d48a8a,#c47a7a)'},
  {char:'安',bg:'linear-gradient(145deg,#8aaa70,#7a9a5a)'}
];
for(var _i=0;_i<30;_i++){
  var _s = _avatarStyles[_i%_avatarStyles.length];
  _photos.push('data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><defs><linearGradient id="g"><stop offset="0%" stop-color="' + _s.bg.split(',')[0].replace('linear-gradient(','').replace(')','').trim() + '"/><stop offset="100%" stop-color="' + _s.bg.split(',')[1].trim() + '"/></linearGradient></defs><rect width="80" height="80" rx="40" fill="url(#g)"/><text x="40" y="45" text-anchor="middle" fill="white" font-size="28" font-weight="600" font-family="sans-serif">' + _s.char + '</text></svg>'));
}

/* ===== 1. HERO PARTICLES (glowing dots) ===== */
(function(){
  var c = document.getElementById('particle-canvas');
  if(!c) return;
  var ctx = c.getContext('2d');
  var p = [], anim, mouse = {x:0, y:0, active:false};
  function resize(){c.width=window.innerWidth;c.height=window.innerHeight}
  resize(); window.addEventListener('resize', resize);
  c.addEventListener('mousemove', function(e){mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true});
  c.addEventListener('mouseleave', function(){mouse.active=false});
  var isMobile = window.innerWidth < 640;
  var n = isMobile ? 15 : Math.min(60, Math.floor(window.innerWidth/15));
  var cs = ['rgba(255,255,255,','rgba(255,220,180,','rgba(196,149,106,'];
  for(var i=0;i<n;i++) p.push({
    x:Math.random()*c.width,y:Math.random()*c.height,
    vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3-0.05,
    r:isMobile ? Math.random()*1.2+0.5 : Math.random()*2.5+0.8,
    op:Math.random()*0.35+0.15,
    baseOp:Math.random()*0.35+0.15,
    color:cs[Math.floor(Math.random()*3)],
    ph:Math.random()*Math.PI*2, speed:0.008+Math.random()*0.015,
    trail:[]
  });
  /* Pause when tab hidden for perf */
  document.addEventListener('visibilitychange',function(){
    if(document.hidden && anim){cancelAnimationFrame(anim);anim=null}
    else if(!document.hidden && !anim)loop();
  });
  function loop(){
    /* Mobile perf: reduce detail */
    var isMobile = c.width < 640;
    ctx.clearRect(0,0,c.width,c.height);
    p.forEach(function(d){
      if(mouse.active){
        var dx=mouse.x-d.x, dy=mouse.y-d.y, dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<300){
          var force=0.0008*(300-dist)/300;
          d.vx+=dx*force; d.vy+=dy*force;
        }
      }
      d.x+=d.vx;d.y+=d.vy;d.ph+=d.speed;
      d.vx*=0.995;d.vy*=0.995;
      d.vx+=(Math.random()-0.5)*0.008;d.vy+=(Math.random()-0.5)*0.008;
      if(d.x<-20)d.x=c.width+20;if(d.x>c.width+20)d.x=-20;
      if(d.y<-20)d.y=c.height+20;if(d.y>c.height+20)d.y=-20;
      var po=d.baseOp*(0.55+0.45*Math.sin(d.ph));
      if(!isMobile){ /* Desktop: full glow */
        ctx.beginPath();ctx.arc(d.x,d.y,d.r*4,0,Math.PI*2);
        ctx.fillStyle=d.color+(po*0.06)+')';ctx.fill();
        ctx.beginPath();ctx.arc(d.x,d.y,d.r*2,0,Math.PI*2);
        ctx.fillStyle=d.color+(po*0.15)+')';ctx.fill();
      }
      ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle=d.color+po+')';ctx.fill();
    });
    anim=requestAnimationFrame(loop);
  }
  loop();
})();

/* ===== 2. ORBITING DOTS ===== */
(function(){
  var c = document.getElementById('orbit-canvas');
  var hub = document.getElementById('s2');
  if(!c||!hub) return;
  var ctx = c.getContext('2d');
  var dots = [];
  var gravitating = false;
  var gravTarget = null;
  var gravProgress = 0;
  var scrollAfterGrav = null;
  var circleEls = [];
  var tick = 0;

  function resize(){
    var rect = hub.getBoundingClientRect();
    c.width = rect.width;
    c.height = rect.height;
    c.style.width = rect.width + 'px';
    c.style.height = rect.height + 'px';
    /* re-acquire circle positions */
    getCirclePositions();
  }

  function getCirclePositions(){
    var container = document.getElementById('s2-circles');
    if(!container) return;
    var hubRect = hub.getBoundingClientRect();
    var els = container.querySelectorAll('.s2c');
    circleEls = [];
    els.forEach(function(el){
      var r = el.getBoundingClientRect();
      circleEls.push({
        el: el,
        cx: r.left + r.width/2 - hubRect.left,
        cy: r.top + r.height/2 - hubRect.top,
        radius: r.width/2 + 40
      });
    });
    /* if dots not created yet, create them */
    if(dots.length === 0 && circleEls.length > 0){
      createDots();
    }
  }

  function createDots(){
    dots = [];
    var dotColors = ['rgba(196,149,106,','rgba(180,136,90,','rgba(154,186,122,','rgba(122,186,170,'];
    circleEls.forEach(function(circ, ci){
      var count = 8;
      for(var i=0;i<count;i++){
        var angle = (i/count)*Math.PI*2 + Math.random()*0.3;
        var rad = circ.radius + 8 + Math.random()*20;
        dots.push({
          circIdx: ci,
          baseAngle: angle,
          baseRadius: rad,
          speed: 0.008 + Math.random()*0.008,
          angle: angle,
          radius: rad,
          r: Math.random()*2.5+1.2,
          color: dotColors[ci % dotColors.length],
          op: Math.random()*0.4+0.25,
          origX: 0, origY: 0,
          x: 0, y: 0,
          targetX: 0, targetY: 0,
          gravX: 0, gravY: 0,
          isGrav: false,
          gravAngle: Math.random()*Math.PI*2,
          gravDist: 3 + Math.random()*8,
          returning: false,
          returnT: 0
        });
      }
    });
  }

  function updateDotPositions(){
    circleEls.forEach(function(circ, ci){
      var r = circ.el.getBoundingClientRect();
      var hubRect = hub.getBoundingClientRect();
      circ.cx = r.left + r.width/2 - hubRect.left;
      circ.cy = r.top + r.height/2 - hubRect.top;
    });
  }

  function animate(){
    tick++;
    if(tick % 30 === 0) updateDotPositions();
    ctx.clearRect(0,0,c.width,c.height);

    dots.forEach(function(d){
      var circ = circleEls[d.circIdx];
      if(!circ) return;
      var cx = circ.cx;
      var cy = circ.cy;

      if(d.isGrav){
        /* moving toward gravitation target */
        d.gravProgress = (d.gravProgress||0) + 0.035;
        if(d.gravProgress > 1) d.gravProgress = 1;
        var ease = 1 - Math.pow(1-d.gravProgress, 3);
        d.x = d.origX + (d.targetX - d.origX) * ease;
        d.y = d.origY + (d.targetY - d.origY) * ease;
        /* check if all reached target */
      } else if(d.returning){
        /* returning to orbit after gravitation */
        d.returnT += 0.03;
        if(d.returnT > 1) d.returnT = 1;
        var re = 1 - Math.pow(1-d.returnT, 3);
        d.x = d.gravX + (d.origX - d.gravX) * re;
        d.y = d.gravY + (d.origY - d.gravY) * re;
        if(d.returnT >= 1){
          d.returning = false;
          d.x = d.origX;
          d.y = d.origY;
        }
      } else {
        /* normal orbit */
        d.angle += d.speed;
        d.origX = cx + Math.cos(d.angle) * d.baseRadius;
        d.origY = cy + Math.sin(d.angle) * d.baseRadius;
        d.x = d.origX;
        d.y = d.origY;
      }

      /* draw dot */
      var po = d.op * (0.7 + 0.3 * Math.sin(tick*0.02 + d.angle));
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      /* outer glow */
      ctx.beginPath();ctx.arc(d.x,d.y,d.r*5,0,Math.PI*2);
      ctx.fillStyle = d.color + (po*0.04) + ')';ctx.fill();
      /* mid glow */
      ctx.beginPath();ctx.arc(d.x,d.y,d.r*2.5,0,Math.PI*2);
      ctx.fillStyle = d.color + (po*0.12) + ')';ctx.fill();
      ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle = d.color + po + ')';
      ctx.fill();
    });

    /* check if all gravitating dots have arrived */
    if(gravitating && dots.length > 0){
      var allArrived = dots.every(function(d){
        return !d.isGrav || d.gravProgress >= 1;
      });
      if(allArrived && scrollAfterGrav){
        var target = scrollAfterGrav;
        scrollAfterGrav = null;
        setTimeout(function(){
          window.scrollTo({top: target.getBoundingClientRect().top + window.scrollY - 50, behavior:'smooth'});
        }, 200);
        /* return dots to orbit */
        setTimeout(function(){
          dots.forEach(function(d){
            if(d.isGrav){
              d.returning = true;
              d.returnT = 0;
              d.gravX = d.x;
              d.gravY = d.y;
              d.isGrav = false;
              d.gravProgress = 0;
            }
          });
          gravitating = false;
        }, 600);
      }
    }

    requestAnimationFrame(animate);
  }

  /* start after a small delay to let DOM settle */
  setTimeout(function(){
    resize();
    animate();
  }, 400);

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', function(){
    if(dots.length > 0) updateDotPositions();
  }, {passive: true});

  /* expose gravitate function */
  window.gravitateTo = function(targetSectionId){
    var section = document.getElementById(targetSectionId);
    if(!section || dots.length === 0) {
      /* fallback: just scroll */
      if(section) window.scrollTo({top: section.getBoundingClientRect().top + window.scrollY - 50, behavior:'smooth'});
      return;
    }
    /* find nearest circle to the target section */
    var targetSection = document.getElementById(targetSectionId);
    if(!targetSection) return;
    gravitating = true;
    gravProgress = 0;
    scrollAfterGrav = targetSection;

    dots.forEach(function(d){
      d.isGrav = true;
      d.gravProgress = 0;
      d.origX = d.x;
      d.origY = d.y;
      /* spread dots around the section center */
      var centerX = c.width / 2;
      var centerY = c.height / 2;
      d.targetX = centerX + Math.cos(d.gravAngle) * d.gravDist;
      d.targetY = centerY + Math.sin(d.gravAngle) * d.gravDist;
    });
  };
})();

/* ===== 3. REVEAL ===== */
(function(){
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('revealed');obs.unobserve(e.target)}
    });
  },{threshold:0.1,rootMargin:'0px 0px -20px 0px'});
  document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el)})});
  window.observeReveal=function(p){(p||document).querySelectorAll('.reveal').forEach(function(el){obs.observe(el)})};
})();

/* ===== 4. NAV ===== */
(function(){
  function update(){
    var nav=document.getElementById('top-nav'),hero=document.getElementById('s1');
    if(!nav||!hero)return;
    nav.classList.toggle('scrolled',window.scrollY>hero.offsetHeight-60);
    var secs=document.querySelectorAll('.scr'),links=document.querySelectorAll('.nav-link'),cur='';
    secs.forEach(function(s){var t=s.offsetTop-120;if(window.scrollY>=t&&window.scrollY<t+s.offsetHeight)cur=s.id});
    links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+cur)});
  }
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('load',update);
})();

/* ===== 5. SMOOTH SCROLL ===== */
(function(){
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]');
    if(!a)return;
    var tid=a.getAttribute('href').slice(1);
    if(tid==='s2'){e.preventDefault();window.scrollTo({top:document.getElementById('s2').offsetTop-50,behavior:'smooth'});history.pushState(null,'','#s2');return}
    /* module sections now use subpage system via inline handlers */
    var t=document.getElementById(tid);
    if(!t)return;
    e.preventDefault();
    window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-50,behavior:'smooth'});
    history.pushState(null,'','#'+tid);
  });
})();

/* ===== 6. HAMBURGER ===== */
(function(){
  document.addEventListener('click',function(e){
    var b=e.target.closest('#nav-toggle');
    if(!b)return;document.getElementById('nav-menu').classList.toggle('open');b.classList.toggle('open')
  });
  document.addEventListener('click',function(e){
    var l=e.target.closest('.nav-link');
    if(!l)return;var m=document.getElementById('nav-menu'),b=document.getElementById('nav-toggle');
    if(m)m.classList.remove('open');if(b)b.classList.remove('open')
  });
})();

/* ===== 7. TICKER ===== */
(function(){
  var el=document.getElementById('ticker-tx');
  if(!el||!C.ticker||!C.ticker.length)return;
  var idx=0,freq=3500;
  function show(){
    var t=C.ticker[idx];
    var dot=t.type==='hot'?'<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#d4733e;box-shadow:0 0 6px #d4733e;margin-right:4px"></span>':(t.type==='new'?'<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#7a9a5a;box-shadow:0 0 6px #7a9a5a;margin-right:4px"></span>':'<span style="display:inline-block;width:3px;height:3px;border-radius:50%;background:#c4956a;margin-right:4px;margin-bottom:2px"></span>');
    el.innerHTML=dot+t.text;
    idx=(idx+1)%C.ticker.length;
  }
  show();setInterval(show,freq);
})();

/* ===== 8. RENDER ALL ===== */
document.addEventListener('DOMContentLoaded',function(){
  if(!C)return;

  
  /* S1.5: endorsements badges */
  var s15 = document.getElementById('s-15-badges');
  if(s15 && C.endorsements) {
    s15.innerHTML = C.endorsements.map(function(e){
      return '<div class="s15-badge reveal">' + e + '</div>';
    }).join('');
  }

  /* S2: endorsements */
  var e2=document.getElementById('s2-endorse');
  if(e2&&C.endorsements) e2.innerHTML=C.endorsements.map(function(e){return '<span class="reveal">'+e+'</span>'}).join('');

  /* S2: circles */
  var cg=document.getElementById('s2-circles');
  if(cg&&C.modules){
    var sizes=['xl','lg','md','md','sm'];
    var delays=[0,0.12,0.24,0.36,0.48];
    cg.innerHTML=C.modules.map(function(m,i){
      return '<div class="s2c s2c-'+sizes[i]+' s2c-'+m.color+'" onclick="handleCircleClick(\''+m.id+'\')" style="animation-delay:'+delays[i]+'s"><span class="s2c-l">'+m.name+'</span><span class="s2c-d">'+m.desc+'</span></div>';
    }).join('');
  }

  /* S2: 我的 + 全部服务 (简化版：点击直接跳转，无下拉) */
  var bl=document.getElementById('s2-links');
  if(bl){
    bl.innerHTML=
      '<div class="s2-row-3">'+
      '<div class="s2-btn-3" onclick="openSubpage(\'s-tickets\')"><span class="s2-ico-3" style="background:linear-gradient(145deg,#d4a86a,#c08850)">券</span><span class="s2-t-3">粮票中心</span></div>'+
      '<div class="s2-btn-3" onclick="openSubpage(\'s-community\')"><span class="s2-ico-3" style="background:linear-gradient(145deg,#e8935a,#d4733e)">赏</span><span class="s2-t-3">悬赏任务</span></div>'+
      '<div class="s2-btn-3" onclick="openSubpage(\'s-about\')"><span class="s2-ico-3" style="background:linear-gradient(145deg,#9aba7a,#7a9a5a)">人</span><span class="s2-t-3">关于兵姐</span></div></div>';
  }
  var sm = document.getElementById('s2-modules');
  if(sm) sm.innerHTML = '';

  /* Render old mod-acc-container (for standalone accordion if needed) */
  renderAccordion();

  /* Render new inline sections */
  renderStats();
  renderPromise();
  renderSignIn();
  renderPainPoints();
  renderStayAccordion();
  renderCommunityPreview();
  renderShopPreview();

  /* Observe all reveals */
  window.observeReveal();

  /* S1.5 observe badges */
  
  /* Inject ai-progress keyframe */
  var kfStyle = document.createElement('style');
  kfStyle.textContent = '@keyframes ai-progress{0%{width:0%}50%{width:70%}100%{width:100%}}';
  document.head.appendChild(kfStyle);
  
  window.observeReveal(document.getElementById('s-15'));

  /* Circle click handler - open subpage */
  window.handleCircleClick = function(modId){
    openSubpage(modId);
    history.pushState(null,'','#'+modId);
  };

  /* Hero entrance */
  setTimeout(function(){var h=document.getElementById('s1c');if(h)h.classList.add('loaded')},200);
});

/* ===== 9. SUBPAGE SYSTEM ===== */
var _subpageRendered = {};

function openSubpage(id) {
  var el = document.getElementById('sub-' + id);
  if (!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (!_subpageRendered[id]) {
    renderSubpage(id);
    _subpageRendered[id] = true;
  }
}

function closeSubpage() {
  document.querySelectorAll('.subpage.open').forEach(function(el) {
    el.classList.remove('open');
  });
  document.body.style.overflow = '';
}

/* Swipe left-to-right to close subpage (mobile) */
document.addEventListener('touchstart', function(e) {
  window._swipeX = e.touches[0].clientX;
  window._swipeY = e.touches[0].clientY;
}, {passive:true});
document.addEventListener('touchend', function(e) {
  if (!window._swipeX) return;
  var dx = e.changedTouches[0].clientX - window._swipeX;
  var dy = e.changedTouches[0].clientY - window._swipeY;
  /* Left-to-right swipe > 80px, not too vertical */
  if (dx > 80 && Math.abs(dy) < dx) {
    var openSub = document.querySelector('.subpage.open');
    if (openSub) closeSubpage();
  }
  window._swipeX = null;
}, {passive:true});

function closeCourseDetail() {
  document.getElementById('sub-course-detail').classList.remove('open');
  document.body.style.overflow = 'hidden';
}

function renderSubpage(id) {
  switch(id) {
    case 's-stay': renderStaySub(); break;
    case 's-courses': renderCoursesSub(); break;
    case 's-community': renderCommunitySub(); break;
    case 's-shop': renderShopSub(); break;
    case 's-ai': renderAISub(); break;
    case 's-tickets': renderTicketsSub(); break;
    case 's-about': renderAboutSub(); break;
  }
}

/* ---- S-民宿旅居 ---- */
function renderStaySub() {
  var body = document.getElementById('sub-body-s-stay');
  if (!body || !C.stay) return;
  var h = '<div class="sub1-hero"><div class="sub1-hero-t">住进安吉竹海</div><div class="sub1-hero-d">12间竹景房，藏在安吉竹海深处。</div></div>';
  h += '<div class="sub-tabs">';
  h += '<button class="sub-tab active" onclick="switchStayTab(\'rooms\')">房型展示</button>';
  h += '<button class="sub-tab" onclick="switchStayTab(\'book\')">预约住宿</button>';
  h += '<button class="sub-tab" onclick="switchStayTab(\'yard\')">合作院子</button>';
  h += '<button class="sub-tab" onclick="switchStayTab(\'trips\')">往期旅居</button>';
  h += '</div><div id="sub1-content">';
  h += renderStayRooms();
  h += '</div>';
  body.innerHTML = h;
}

function renderStayRooms() {
  if (!C.stay.rooms) return '<div class="sub-sec-d">暂无房型信息</div>';
  var h = '<div class="sub1-rooms">';
  C.stay.rooms.forEach(function(r) {
    h += '<div class="sub1-room">';
    h += '<div class="sub1-room-n">' + r.name + '</div>';
    h += '<div class="sub1-room-info">' + r.beds + ' · ' + r.capacity + ' · ' + r.area + '</div>';
    h += '<div class="sub1-room-desc">' + r.desc + '</div>';
    h += '<div class="sub1-room-pr">¥' + r.price + '<small>/</small></div>';
    h += '<button class="sub1-btn" onclick="switchStayTab(\'book\')">预约</button>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

function renderStayBook() {
  var h = '<div class="sub1-form">';
  h += '<div class="sub1-form-row"><div><label>入住日期</label><input type="date"></div><div><label>退房日期</label><input type="date"></div></div>';
  h += '<div class="sub1-form-row"><div><label>房型</label><select><option>竹景大床房</option><option>竹景双床房</option><option>全景套房</option></select></div><div><label>人数</label><select><option>1人</option><option>2人</option><option>3人</option><option>4人</option></select></div></div>';
  h += '<div><label>联系人</label><input type="text" placeholder="您的姓名"></div>';
  h += '<div style="margin-top:6px"><label>联系电话</label><input type="tel" placeholder="手机号"></div>';
  if(C.stay.booking) h += '<div style="margin-top:10px;font-size:0.38rem;color:rgba(255,255,255,0.4)">' + C.stay.booking.tips + '</div>';
  h += '<button class="sub1-submit" style="margin-top:8px">提交预约</button>';
  h += '</div>';
  return h;
}

function renderStayYard() {
  var h = '<div class="sub1-cta">';
  h += '<div class="sub1-cta-t">合作院子招募中</div>';
  h += '<div class="sub1-cta-d">在安吉竹林深处，有一个小村落正在寻找有缘人。如果你也想过「采菊东篱下」的生活，欢迎来坐坐。</div>';
  h += '<button class="sub1-btn" style="margin-top:10px">了解详情</button>';
  h += '</div>';
  return h;
}

function renderStayTrips() {
  if (!C.stay.pastTrips) return '';
  var h = '<div class="sub1-trips">';
  C.stay.pastTrips.forEach(function(t) {
    h += '<div class="sub1-trip"><div class="sub1-trip-s">' + t.season + '</div><div class="sub1-trip-p">' + t.place + ' · ' + t.people + '人</div><div class="sub1-trip-d">' + t.desc + '</div></div>';
  });
  h += '</div>';
  return h;
}

function switchStayTab(tab) {
  document.querySelectorAll('#sub-s-stay .sub-tab').forEach(function(t){t.classList.remove('active')});
  document.querySelectorAll('#sub-s-stay .sub-tab').forEach(function(t){
    if((t.getAttribute('onclick')||'').indexOf("'" + tab + "'") > -1) t.classList.add('active');
  });
  var c = document.getElementById('sub1-content');
  if (!c) return;
  switch(tab) {
    case 'rooms': c.innerHTML = renderStayRooms(); break;
    case 'book': c.innerHTML = renderStayBook(); break;
    case 'yard': c.innerHTML = renderStayYard(); break;
    case 'trips': c.innerHTML = renderStayTrips(); break;
  }
}

/* ---- S-兵姐精选 ---- */
var _courseFilter = 'all';

function renderCoursesSub() {
  var body = document.getElementById('sub-body-s-courses');
  if (!body || !C.courses) return;
  var h = '<div class="sub2-cats" id="sub2-cats">';
  C.courses.categories.forEach(function(c, i) {
    var cat = i === 0 ? 'all' : c;
    h += '<button class="sub2-cat' + (i===0?' active':'') + '" onclick="switchCourseCat(\'' + cat + '\')">' + c + '</button>';
  });
  h += '</div><div id="sub2-list"></div>';
  body.innerHTML = h;
  renderCourseList('all');
}

function switchCourseCat(cat) {
  _courseFilter = cat;
  document.querySelectorAll('#sub2-cats .sub2-cat').forEach(function(b){
    var o = b.getAttribute('onclick') || '';
    b.classList.toggle('active', o.indexOf("'" + cat + "'") > -1);
  });
  renderCourseList(cat);
}

function renderCourseList(cat) {
  var list = document.getElementById('sub2-list');
  if (!list || !C.courses) return;
  var filtered = cat === 'all' ? C.courses.list : C.courses.list.filter(function(c){return c.category === cat});
  if (filtered.length === 0) {
    list.innerHTML = '<div class="sub2-empty">暂无课程</div>';
    return;
  }
  var h = '<div class="sub2-grid">';
  filtered.forEach(function(c) {
    h += '<div class="sub2-card" onclick="openCourseDetail(' + c.id + ')">';
    h += '<div class="sub2-card-h"><div><div class="sub2-card-t">' + c.title + '</div><div class="sub2-card-auth">' + c.teacher + '</div></div>';
    h += c.price === 0 ? '<span class="sub2-card-pr free">免费</span>' : '<span class="sub2-card-pr">' + c.price + '粮票</span>';
    h += '</div><div class="sub2-card-d">' + c.desc + '</div>';
    h += '<div class="sub2-card-b"><span class="sub2-card-star">★ ' + c.rating + '</span><span>' + c.learners + '人已学</span></div>';
    h += '<div class="sub2-card-tags">' + c.tags.map(function(t){return '<span class="sub2-tag">' + t + '</span>'}).join('') + '</div></div>';
  });
  h += '</div>';
  list.innerHTML = h;
}

/* Course detail (三级页面) */
function openCourseDetail(id) {
  var course = null;
  if (C.courses && C.courses.list) {
    C.courses.list.forEach(function(c){if(c.id === id) course = c});
  }
  if (!course) return;
  var body = document.getElementById('sub-body-course');
  var title = document.getElementById('cd-title');
  if (!body || !title) return;
  title.textContent = course.title;
  var h = '<div class="cd-cover" style="background-image:url(' + course.cover + ')"></div>';
  /* Video/Audio player area */
  h += '<div class="cd-player" id="cd-player-' + course.id + '" style="' + (course.video ? '' : 'display:none') + '">';
  h += '<div class="cd-player-bar"><span id="cd-player-label">播放：第1课</span><span id="cd-player-status">点击下方课程开始学习</span></div>';
  h += '<div class="cd-player-inner">';
  if (course.video) {
    if (course.video.indexOf('bilibili') > -1) {
      h += '<iframe src="' + course.video + '" style="width:100%;height:200px;border:none;border-radius:8px" allowfullscreen></iframe>';
    } else {
      h += '<video style="width:100%;border-radius:8px" controls><source src="' + course.video + '" type="video/mp4"></video>';
    }
  } else if (course.audio) {
    h += '<audio style="width:100%" controls><source src="' + course.audio + '" type="audio/mpeg"></audio>';
  } else {
    h += '<div style="text-align:center;padding:20px;color:#8a7a6a;font-size:0.45rem">🎬 暂无视频，讲师上传后将自动显示</div>';
  }
  h += '</div></div>';
  h += '<div class="cd-body">';
  h += '<div class="cd-h"><div class="cd-t">' + course.title + '</div>';
  h += course.price === 0 ? '<span class="cd-pr free">免费</span>' : '<span class="cd-pr">' + course.price + '粮票</span>';
  h += '</div><div class="cd-meta">';
  h += '<span style="color:rgba(255,255,255,0.5)">' + course.teacher + '</span><span class="star" style="color:#d4b88a">★ ' + course.rating + '</span><span style="color:rgba(255,255,255,0.5)">' + course.lessons + '节课</span><span style="color:rgba(255,255,255,0.5)">' + course.duration + '</span>';
  h += '</div><div class="cd-desc">' + course.full + '</div>';
  /* Course lessons list */
  var lessons = [
    '第1课 · ' + course.title + '：入门导学',
    '第2课 · ' + (course.teacher||'兵姐') + '手把手教学：基础操作',
    '第3课 · 实战演练：案例讲解',
    '第4课 · 进阶技巧与应用',
    '第5课 · 综合实操与答疑',
    '第6课 · 结业项目与成果展示'
  ];
  if (course.lessons > 6) lessons.push('第7课 · 拓展提高', '第8课 · 学员作品点评');
  h += '<div class="cd-inc-h">课程目录 · ' + course.lessons + '节课</div><div class="cd-inc">';
  lessons.forEach(function(lesson, li) {
    var isFree = course.price === 0 || li < 2;
    h += '<div class="cd-lesson' + (isFree?' cd-lesson-free':'') + '" onclick="playCourseLesson(' + course.id + ',' + (li+1) + ',\'' + lesson.replace(/'/g,"\\'") + '\')"><span class="cd-lesson-n">' + (li+1) + '</span><span class="cd-lesson-t">' + lesson + '</span><span class="cd-lesson-tag">' + (isFree?'免费':'🔒') + '</span></div>';
  });
  h += '</div>';
  /* Course includes */
  h += '<div class="cd-inc-h">课程包含</div><div class="cd-inc">';
  if (course.includes) course.includes.forEach(function(item) {
    h += '<div class="cd-inc-item">' + item + '</div>';
  });
  h += '</div>';
  h += '<button class="cd-buy' + (course.price===0?' free':'') + '" onclick="document.getElementById(\'sub-course-detail\').classList.remove(\'open\');document.body.style.overflow=\'\';alert(\'' + (course.price===0?'🎉 报名成功！立即开始学习吧':'🎉 购买成功！消耗' + course.price + '粮票') + '\')">' + (course.price===0?'免费报名学习':'💰 ' + course.price + '粮票购买') + '</button>';
  h += '<div style="text-align:center;margin-top:8px;font-size:0.36rem;color:#8a7a6a">' + course.learners + '人已报名 · ' + (course.price===0?'永久免费':'永久有效') + '</div></div>';
  body.innerHTML = h;
  document.getElementById('sub-course-detail').classList.add('open');
}

/* ---- S-大伙在聊啥 — Discord风格双栏 ---- */
function renderCommunitySub() {
  var body = document.getElementById('sub-body-s-community');
  if (!body || !C.community) return;
  var cm = C.community;
  var h = '';

  /* Hero */
  h += '<div class="com-hero"><div class="com-hero-t">战友俱乐部</div><div class="com-hero-d">找同好 · 聊心事 · 约活动 — 这里是大家的线上小院</div></div>';

  /* Dynamic online count */
  var onlineBase = cm.onlineUsers ? cm.onlineUsers.length * 3 + 18 : 28;
  h += '<div class="com-online"><div class="com-online-dot"></div><span class="com-online-n" id="com-online-n">' + onlineBase + '</span><span class="com-online-l">位战友在线</span></div>';
  /* Fluctuate online count */
  (function(base){
    var el = document.getElementById('com-online-n');
    if (!el) return;
    var val = base;
    setInterval(function(){
      val += (Math.random() - 0.5) * 4;
      val = Math.max(base - 5, Math.min(base + 10, val));
      el.textContent = Math.round(val);
    }, 3000);
  })(onlineBase);

  /* Online avatars row */
  if (cm.onlineUsers) {
    h += '<div class="com-avatars">';
    cm.onlineUsers.forEach(function(u) {
      h += '<div class="com-avatar" style="background:' + u.color + '" title="' + u.name + '">' + u.initial + '</div>';
    });
    h += '<div class="com-avatar com-avatar-more">+</div>';
    h += '</div>';
  }

  /* Category lobby - like a game hall */
  h += '<div class="com-lobby">';
  if (cm.categories) {
    cm.categories.forEach(function(cat) {
      h += '<div class="com-cat" style="--cat-color:' + cat.color + '" onclick="alert(\'进入「' + cat.name.replace(/["']/g, '') + '」\')">';
      h += '<div class="com-cat-h">';
      h += '<span class="com-cat-n">' + cat.name + '</span>';
      h += '<span class="com-cat-online"><span class="com-cat-dot"></span>' + cat.online + '</span>';
      h += '</div>';
      h += '<div class="com-cat-d">' + cat.desc + '</div>';
      h += '<div class="com-cat-footer"><span class="com-cat-enter">进去看看 →</span></div>';
      h += '</div>';
    });
  }
  h += '</div>';

  /* Hot posts feed (shorter) */
  h += '<div class="com-hot-h"><span>🔥 热门动态</span><span class="com-hot-more">更多→</span></div>';
  h += '<div class="com-feed">';
  var colors = ['#d4733e','#7a9a5a','#c4956a','#6a9ac8','#d48a8a'];
  if (cm.posts) cm.posts.slice(0, 3).forEach(function(p, i) {
    h += '<div class="com-post"><div class="com-post-av" style="background:' + colors[i%5] + '">' + p.author.charAt(0) + '</div><div class="com-post-body"><div class="com-post-h"><span class="com-post-auth">' + p.author + '</span><span class="com-post-tm">' + p.time + '</span></div><div class="com-post-c">' + p.content + '</div><div class="com-post-f"><span>❤ ' + p.likes + '</span><span>💬 ' + p.comments + '</span></div></div></div>';
  });
  h += '</div>';

  body.innerHTML = h;
}
function renderShopSub() {
  var body = document.getElementById('sub-body-s-shop');
  if (!body || !C.marketplace) return;
  var items = C.marketplace.shopItems || [];
  var h = '';

  /* Hero - diamond booth */
  h += '<div class="shop-hero"><div class="shop-hero-t">钻石展位</div><div class="shop-hero-d">战友精选 · 粮票就能换</div></div>';

  /* Official products grid */
  var official = items.filter(function(i){return i.type==='official'});
  h += '<div class="shop-sec-h">官方出品</div>';
  h += '<div class="shop-grid">';
  official.forEach(function(item) {
    var hasDiscount = item.original && item.original > item.price;
    h += '<div class="shop-card" onclick="alert(\'' + item.name + ' - 详情页\')">';
    h += '<div class="shop-card-badge">' + (item.tag ? item.tag.replace(/[^\w一-鿿]/g,'') : '') + '</div>';
    h += '<div class="shop-card-name">' + item.name + '</div>';
    h += '<div class="shop-card-desc">' + (item.desc || '') + '</div>';
    h += '<div class="shop-card-row">';
    h += '<span class="shop-card-price"><span class="shop-card-price-v">' + item.price + '</span> 粮票</span>';
    if (hasDiscount) h += '<span class="shop-card-original">' + item.original + '粮票</span>';
    h += '</div>';
    h += '<div class="shop-card-row">';
    h += '<span class="shop-card-sales">已售 ' + (item.sales || 0) + '</span>';
    h += '<span class="shop-card-rating">★ ' + (item.rating || 0).toFixed(1) + '</span>';
    h += '</div>';
    h += '<div class="shop-card-bar"><div class="shop-card-bar-fill" style="width:' + Math.min(100, ((item.sales||0)/15)) + '%"></div></div>';
    h += '<button class="shop-card-btn" onclick="event.stopPropagation();alert(\'已加入粮票购物车\')">加入购物车</button>';
    h += '</div>';
  });
  h += '</div>';

  /* Stalls section */
  var stalls = items.filter(function(i){return i.type==='stall'});
  h += '<div class="shop-sec-h" style="margin-top:16px">战友摊位 <span style="font-weight:400;font-size:0.45rem;color:#8a7a6a">邻居家的好东西</span></div>';
  h += '<div class="shop-stalls">';
  stalls.forEach(function(s) {
    if (s.status === 'open') {
      h += '<div class="shop-stall shop-stall-open" onclick="alert(\'申请入驻\')"><div class="shop-stall-name">+ 招募中</div><div class="shop-stall-desc">等你来入驻</div></div>';
    } else {
      h += '<div class="shop-stall" onclick="alert(\'' + (s.owner||'') + ' - ' + s.name + '\')">';
      h += '<div class="shop-stall-img"><span style="display:inline-flex;width:32px;height:32px;border-radius:50%;background:linear-gradient(145deg,#c4956a,#d4733e);color:#fff;align-items:center;justify-content:center;font-size:0.5rem;font-weight:600">摊</span></div>';
      h += '<div class="shop-stall-info"><div class="shop-stall-name">' + s.name + '</div><div class="shop-stall-owner">' + (s.owner||'') + '</div><div class="shop-stall-desc">' + (s.desc||'') + '</div></div>';
      h += '<div class="shop-stall-right"><div class="shop-stall-price">' + s.price + '</div><div class="shop-stall-unit">粮票</div><div class="shop-stall-sales">已售' + (s.sales||0) + '</div></div>';
      h += '</div>';
    }
  });
  h += '</div>';

  body.innerHTML = h;
}

/* Shop detail overlay */
function openShopDetail(idx) {
  var items = C.marketplace && C.marketplace.shopItems;
  if (!items || !items[idx]) return;
  var item = items[idx];
  var h = '<div class="shop-detail-overlay" onclick="this.remove()">';
  h += '<div class="shop-detail" onclick="event.stopPropagation()">';
  h += '<div class="shop-detail-close" onclick="this.closest(\'.shop-detail-overlay\').remove()">x</div>';
  h += '<div class="shop-detail-name">' + item.name + '</div>';
  if (item.desc) h += '<div class="shop-detail-desc">' + item.desc + '</div>';
  if (item.owner) h += '<div class="shop-detail-row"><span class="shop-detail-lb">摊主</span><span>' + item.owner + '</span></div>';
  h += '<div class="shop-detail-row"><span class="shop-detail-lb">价格</span><span style="color:#d4733e;font-weight:600">' + item.price + ' 粮票</span></div>';
  if (item.original) h += '<div class="shop-detail-row"><span class="shop-detail-lb">原价</span><span style="text-decoration:line-through;color:#8a7a6a">' + item.original + ' 粮票</span></div>';
  h += '<div class="shop-detail-row"><span class="shop-detail-lb">已售</span><span>' + (item.sales||0) + '件</span></div>';
  if (item.rating) h += '<div class="shop-detail-row"><span class="shop-detail-lb">评分</span><span>★ ' + item.rating.toFixed(1) + ' (' + (item.reviews||0) + '条评价)</span></div>';
  h += '<div style="margin-top:12px;display:flex;gap:8px">';
  h += '<button class="cd-buy free" style="flex:1" onclick="alert(\'已加入购物车！\')">加入购物车</button>';
  h += '<button class="cd-buy" style="flex:1" onclick="alert(\'购买成功！消耗' + item.price + '粮票\')">立即购买</button>';
  h += '</div></div></div>';
  document.body.appendChild(document.createElement('div'));
  var last = document.body.lastElementChild;
  last.outerHTML = h;
}

function renderAISub() {
  var body = document.getElementById('sub-body-s-ai');
  if (!body || !C.aiServices) return;
  var services = C.aiServices;
  var h = '';

  /* Header */
  h += '<div class="ai-hero"><div class="ai-hero-t"><span style="display:inline-flex;width:32px;height:32px;border-radius:50%;background:linear-gradient(145deg,#7abaaa,#5a9a8a);align-items:center;justify-content:center;color:#fff;font-size:0.6rem;margin-right:6px">AI</span>AI百宝箱</div><div class="ai-hero-d">AI让生活更简单，让晚年更精彩</div></div>';
  h += '<div class="ai-balance">我的粮票: <span class="v">128</span> <span class="l">· 做任务赚更多 →</span></div>';

  /* Service cards */
  h += '<div class="ai-grid">';
  services.forEach(function(s, i) {
    var colors = ['#c4956a','#d4733e','#7a9a5a','#5a9a8a','#6a9ac8','#b88a6a'];
    var aiChars = ['写','装','复','唱','文','拍'];
    h += '<div class="ai-card">';
    h += '<div class="ai-card-header" style="background:' + colors[i%6] + '"><span style="display:inline-flex;width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.2);align-items:center;justify-content:center;font-size:0.5rem;font-weight:600;margin-right:4px">' + aiChars[i] + '</span>' + s.name + '</div>';
    h += '<div class="ai-card-body">';
    h += '<div class="ai-card-desc">' + s.desc + '</div>';
    h += '<div class="ai-card-stats"><span>' + s.price + '粮票/次</span><span>' + s.done + '人已体验</span></div>';
    h += '<div class="ai-card-stars">★★★★★ <span style="font-size:0.4rem;color:#8a7a6a">(' + s.done + '人评价)</span></div>';
    h += '<button class="ai-card-btn" onclick="openAIDemo(\'' + s.demo + '\',\'' + s.name + '\')">立即体验</button>';
    h += '</div></div>';
  });
  h += '</div>';

  /* Interactive demo area */
  h += '<div id="ai-demo-area" style="display:none;margin-top:14px;background:rgba(255,255,255,0.7);backdrop-filter:blur(12px);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.85)"></div>';

  body.innerHTML = h;
}

/* AI Demo interactive functions */
function openAIDemo(demo, name) {
  var area = document.getElementById('ai-demo-area');
  if (!area) return;
  area.style.display = 'block';

  if (demo === 'portrait') {
    /* AI写真 demo - photo upload + filter preview */
    area.innerHTML = '<div style="font-size:0.55rem;font-weight:600;color:#2d2a24;margin-bottom:8px">📸 ' + name + '</div>' +
      '<div style="font-size:0.5rem;color:#8a7a6a;margin-bottom:10px">上传一张照片，AI自动生成古风艺术照</div>' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
      '<div style="width:80px;height:80px;border-radius:8px;background:linear-gradient(135deg,#f0ece4,#e8e0d4);display:flex;align-items:center;justify-content:center;font-size:2rem;color:#c4956a;border:2px dashed #d4c8b8;cursor:pointer" onclick="simulatePhotoUpload(this)">📤</div>' +
      '<div style="flex:1;min-width:120px"><div style="font-size:0.48rem;color:#8a7a6a">点击上传照片</div><div style="font-size:0.42rem;color:#b8a898;margin-top:2px">支持jpg/png · 自动裁剪</div></div>' +
      '<button style="padding:6px 16px;background:linear-gradient(135deg,#c4956a,#d4733e);border:none;border-radius:6px;color:#fff;font-size:0.48rem;cursor:pointer;font-family:inherit" onclick="simulateAI(this)">✨ AI生成</button>' +
      '</div>' +
      '<div id="ai-result" style="margin-top:10px;padding:10px;background:rgba(196,149,106,0.06);border-radius:8px;text-align:center;font-size:0.48rem;color:#8a7a6a;display:none">⏳ AI正在生成...</div>';
  } else if (demo === 'dressup') {
    area.innerHTML = '<div style="font-size:0.55rem;font-weight:600;color:#2d2a24;margin-bottom:8px">👗 ' + name + '</div>' +
      '<div style="font-size:0.5rem;color:#8a7a6a;margin-bottom:10px">选择你喜欢的风格，看看效果</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' +
      '  <span style="padding:4px 10px;background:rgba(196,149,106,0.1);border:1px solid rgba(196,149,106,0.2);border-radius:14px;font-size:0.45rem;color:#c4956a;cursor:pointer" onclick="selectStyle(this)">👘 旗袍</span>' +
      '  <span style="padding:4px 10px;background:rgba(211,115,62,0.1);border:1px solid rgba(211,115,62,0.2);border-radius:14px;font-size:0.45rem;color:#d4733e;cursor:pointer" onclick="selectStyle(this)">🧥 大衣</span>' +
      '  <span style="padding:4px 10px;background:rgba(122,154,90,0.1);border:1px solid rgba(122,154,90,0.2);border-radius:14px;font-size:0.45rem;color:#7a9a5a;cursor:pointer" onclick="selectStyle(this)">🧣 围巾</span>' +
      '  <span style="padding:4px 10px;background:rgba(90,154,138,0.1);border:1px solid rgba(90,154,138,0.2);border-radius:14px;font-size:0.45rem;color:#5a9a8a;cursor:pointer" onclick="selectStyle(this)">👒 度假</span>' +
      '</div>' +
      '<button style="padding:6px 16px;background:linear-gradient(135deg,#c4956a,#d4733e);border:none;border-radius:6px;color:#fff;font-size:0.48rem;cursor:pointer;font-family:inherit" onclick="simulateAI(this)">✨ 开始换装</button>' +
      '<div id="ai-result" style="margin-top:10px;padding:12px;background:rgba(196,149,106,0.06);border-radius:8px;text-align:center;font-size:0.48rem;color:#8a7a6a;display:none">⏳ AI正在生成...</div>';
  } else {
    /* Generic demo */
    area.innerHTML = '<div style="font-size:0.55rem;font-weight:600;color:#2d2a24;margin-bottom:8px">🤖 ' + name + '</div>' +
      '<div style="font-size:0.5rem;color:#8a7a6a;margin-bottom:10px">功能即将开放，敬请期待！</div>' +
      '<button style="padding:6px 16px;background:linear-gradient(135deg,#c4956a,#d4733e);border:none;border-radius:6px;color:#fff;font-size:0.48rem;cursor:pointer;font-family:inherit" onclick="document.getElementById(\'ai-demo-area\').style.display=\'none\'">关闭</button>';
  }
}

function simulatePhotoUpload(el) {
  el.innerHTML = '👩';
  el.style.fontSize = '2.5rem';
  el.style.background = 'linear-gradient(135deg,#f5e6d0,#e8d5b8)';
  el.style.border = '2px solid #c4956a';
}

function selectStyle(el) {
  document.querySelectorAll('#ai-demo-area span').forEach(function(s){s.style.opacity='0.5'});
  el.style.opacity = '1';
  el.style.transform = 'scale(1.05)';
}

function simulateAI(btn) {
  var result = document.getElementById('ai-result');
  if (!result) return;
  result.style.display = 'block';
  result.innerHTML = '⏳ AI正在生成中...<div style="width:100%;height:3px;background:#f0ece4;border-radius:2px;margin-top:6px;overflow:hidden"><div style="width:0%;height:100%;background:linear-gradient(90deg,#c4956a,#d4733e);border-radius:2px;animation:ai-progress 2s ease-in-out forwards"></div></div>';
  setTimeout(function() {
    result.innerHTML = '✅ 生成完成！<div style="margin-top:6px;font-size:0.55rem;color:#2d2a24">太棒了！效果很不错 👏</div><div style="margin-top:6px;display:flex;gap:6px;justify-content:center"><span style="padding:3px 10px;background:#c4956a;border-radius:4px;color:#fff;font-size:0.42rem;cursor:pointer">💾 保存</span><span style="padding:3px 10px;background:rgba(196,149,106,0.1);border-radius:4px;color:#c4956a;font-size:0.42rem;cursor:pointer">📤 分享</span><span style="padding:3px 10px;background:rgba(196,149,106,0.1);border-radius:4px;color:#c4956a;font-size:0.42rem;cursor:pointer" onclick="document.getElementById(\'ai-demo-area\').style.display=\'none\'">✕ 关闭</span></div>';
  }, 2200);
}
/* ---- S-粮票中心 ---- */
function renderTicketsSub() {
  var body = document.getElementById('sub-body-s-tickets');
  if (!body) return;
  var h = '<div class="about-hero" style="padding:14px 0 10px">';
  h += '<div class="about-hero-name">粮票中心</div>';
  h += '<div class="about-hero-role">赚粮票 · 看等级 · 换好物</div>';
  h += '</div>';
  
  /* Current rank */
  var rankIdx = 3; // 班长
  var ranks = C.ranks || [];
  if (ranks.length > 0) {
    h += '<div class="ticket-current-rank"><span class="v">🏅 ' + (ranks[rankIdx] ? ranks[rankIdx].name : '班长') + '</span><span class="l">' + (ranks[rankIdx] ? ranks[rankIdx].need : '') + '</span></div>';
  }
  
  /* Exchange rate */
  var tg = C.ticketGuide || {};
  h += '<div class="ticket-rate">';
  h += '<div class="ticket-rate-item"><span class="v">100</span><span class="l">工分</span></div>';
  h += '<div class="ticket-rate-arrow">⇄</div>';
  h += '<div class="ticket-rate-item"><span class="v">1</span><span class="l">粮票</span></div>';
  h += '<div class="ticket-rate-arrow">≈</div>';
  h += '<div class="ticket-rate-item"><span class="v">1元</span><span class="l">价值</span></div>';
  h += '</div>';
  
  h += '<div class="tickets-grid">';
  
  /* Left column: 赚粮票 */
  h += '<div class="ticket-card"><div class="ticket-card-h">每日任务 · 赚粮票</div>';
  if (tg.earn) {
    h += '<ul class="ticket-earn-list">';
    tg.earn.forEach(function(e) {
      // extract number after + sign
      var match = e.match(/\+(\d+)/);
      var reward = match ? '+' + match[1] : '';
      var text = e.replace(/\+\d+.*$/, '');
      h += '<li><span>' + e + '</span></li>';
    });
    h += '</ul>';
  }
  h += '<div style="font-size:0.5rem;color:#8a7a6a;margin-top:6px;padding:6px 8px;background:rgba(196,149,106,0.06);border-radius:4px">每日最多可赚 ≈ ' + (10+20+2+15) + '工分</div>';
  h += '</div>';
  
  /* Right column: 能干嘛 */
  h += '<div class="ticket-card"><div class="ticket-card-h">粮票能干嘛</div>';
  if (tg.spend) {
    h += '<ul class="ticket-spend-list">';
    tg.spend.forEach(function(s) {
      h += '<li><span>' + s + '</span></li>';
    });
    h += '</ul>';
  }
  h += '</div>';
  
  h += '</div>'; /* close grid */
  
  /* Rank list */
  if (ranks.length > 0) {
    h += '<div class="ticket-card" style="margin-top:10px"><div class="ticket-card-h">成长等级</div>';
    h += '<div class="ticket-ranks">';
    ranks.forEach(function(r, i) {
      var done = r.done;
      h += '<div class="ticket-rank"><div class="s ' + (done ? 'done' : 'pending') + '">' + (done ? '✓' : (i+1)) + '</div><div class="ri"><span class="rn">' + r.name + '</span><span class="rd">' + r.need + '</span></div><span class="rv">' + (done ? '已达成' : '未达成') + '</span></div>';
    });
    h += '</div></div>';
  }
  
  /* promise details */
  var pd = C.promise && C.promise.details;
  if (pd && pd.length > 0) {
    h += '<div class="ticket-card" style="margin-top:10px"><div class="ticket-card-h">兵姐的承诺 · 详细说明</div>';
    h += '<ul class="ticket-earn-list">';
    pd.forEach(function(d) {
      h += '<li>' + d + '</li>';
    });
    h += '</ul></div>';
  }
  
  body.innerHTML = h;
}

/* ---- S-关于兵姐 ---- */
function renderAboutSub() {
  var body = document.getElementById('sub-body-s-about');
  if (!body || !C.bingjie) return;
  var bj = C.bingjie;
  var h = '';
  
  /* Hero */
  h += '<div class="about-hero"><div class="about-hero-name">' + bj.name + '</div><div class="about-hero-role">' + bj.identity + '</div><div class="about-hero-intro">' + bj.intro + '</div></div>';
  
  /* Belief */
  h += '<div class="about-belief">「 ' + bj.belief + ' 」</div>';

  /* Journey footprint - locations visited and planned */
  h += '<div class="about-ft-h">兵姐的足迹</div>';
  h += '<div class="about-ft-grid">';
  /* Visited locations */
  var visitedPlaces = [
    {place:'绍兴', season:'第1-4期', count:37},
    {place:'柯桥', season:'第1期', count:7},
    {place:'杭州', season:'第5-6期', count:30},
    {place:'安吉', season:'第14-16期', count:45},
    {place:'上海', season:'第7-9期', count:28},
    {place:'崇明岛', season:'第7-9期', count:20},
    {place:'海南', season:'第10-13期', count:40},
    {place:'三亚', season:'第10-13期', count:35}
  ];
  var ftPhotos = _photos;
  visitedPlaces.forEach(function(v) {
    h += '<div class="about-ft-card">';
    h += '<div class="about-ft-top"><span class="about-ft-place">' + v.place + '</span><span class="about-ft-season">' + v.season + '</span></div>';
    h += '<div class="about-ft-avs">';
    for (var a = 0; a < Math.min(5, v.count); a++) {
      h += '<div class="about-ft-av" style="background:url(' + ftPhotos[a % ftPhotos.length] + ') center/cover"></div>';
    }
    h += '</div>';
    h += '<div class="about-ft-count">' + v.count + '位战友同行</div>';
    h += '</div>';
  });
  h += '</div>';

  /* Future destinations */
  h += '<div class="about-ft-h" style="margin-top:10px">即将出发</div>';
  h += '<div class="about-ft-grid">';
  var futurePlaces = ['威海','青岛','云南','大理','成都','重庆','桂林','西安','洛阳','哈尔滨','厦门','武夷山','武汉','南京','太原'];
  futurePlaces.forEach(function(p) {
    h += '<div class="about-ft-card about-ft-future"><div class="about-ft-place">' + p + '</div><div class="about-ft-season" style="color:rgba(255,255,255,0.4)">计划中</div></div>';
  });
  h += '</div>';

  /* Photo wall */
  h += '<div class="about-photo-h" style="margin-top:14px">战友风采 · 已累计接待5000+人</div>';
  h += '<div id="photo-wall-canvas"></div>';
  
  /* Story */
  if (bj.story) {
    h += '<div class="about-story"><div class="ticket-card-h" style="margin-bottom:4px">兵姐的故事</div>';
    bj.story.forEach(function(s) {
      h += '<div class="about-story-p">' + s + '</div>';
    });
    h += '</div>';
  }
  
  /* Credentials */
  if (bj.credentials) {
    h += '<div class="about-creds">';
    bj.credentials.forEach(function(c) {
      h += '<span>' + c + '</span>';
    });
    h += '</div>';
  }
  
  body.innerHTML = h;
  
  /* Generate photo wall */
  setTimeout(generatePhotoWall, 100);
}

/* Photo wall canvas generator */
function generatePhotoWall() {
  var container = document.getElementById('photo-wall-canvas');
  if (!container) return;
  var rect = container.parentElement.getBoundingClientRect();
  var w = Math.min(rect.width - 0, 700);
  container.style.width = w + 'px';
  container.style.height = '220px';
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.borderRadius = '10px';
  container.style.background = '#f5f2ec';
  
  // Real photo grid - Chinese elderly portraits
      var photos = _photos;
  
  var h = '';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:1px;position:absolute;inset:0;overflow:hidden;padding:2px">';
  for (var i = 0; i < 60; i++) {
    var url = photos[i % photos.length];
    var size = 42 + Math.floor(Math.random() * 16);
    h += '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:url(' + url + ') center/cover;opacity:0.75;border:1.5px solid rgba(255,255,255,0.3);margin:auto"></div>';
  }
  h += '</div>';
  // Gradient overlay at bottom
  h += '<div style="position:absolute;inset:0;background:linear-gradient(transparent 30%,rgba(250,248,245,0.9) 75%);pointer-events:none"></div>';
  // Caption
  h += '<div style="position:absolute;bottom:10px;left:0;right:0;text-align:center;font-size:0.55rem;color:#2d2a24;font-weight:600;letter-spacing:2px">\u2764 5000+ \u6218\u53cb\u7684\u9009\u62e9</div>';
  container.innerHTML = h;
}

var _accIcons = ['宿','AI','课','聊','铺'];
var _accLinks = {
  's-stay':    ['房型展示','预约住宿','合作院子','往期旅居'],
  's-ai':      ['AI写真','AI换装','老照片修复','语音克隆','AI写文案','旅游AI拍照'],
  's-courses': ['AI类','工具类','生活类','康养类','娱乐类','直播类'],
  's-community':['热门动态','悬赏任务','找旅伴'],
  's-shop':    ['官方出品','战友摊位']
};

function renderAccordion() {
  var container = document.getElementById('mod-acc-container');
  if (!container || !C.modules) return;
  var h = '<div class="mod-grid">';
  C.modules.forEach(function(m, i) {
    var links = _accLinks[m.id] || [];
    var isLast = i === C.modules.length - 1;
    h += '<div class="mod-acc' + (isLast ? ' mod-grid-5' : '') + '" id="mod-acc-' + i + '">';
    h += '<div class="mod-acc-h" onclick="toggleModAcc(' + i + ')">';
    h += '<div class="mod-acc-l"><span class="mod-acc-ico">' + (_accIcons[i]||'·') + '</span>';
    h += '<div class="mod-acc-info"><span class="mod-acc-n">' + m.name + '</span><span class="mod-acc-sub">' + m.desc + '</span></div></div>';
    h += '<span class="mod-acc-a">›</span>';
    h += '</div>';
    h += '<div class="mod-acc-b"><div class="mod-acc-links">';
    links.forEach(function(l) {
      h += '<span class="mod-acc-link" onclick="openSubpage(\'' + m.id + '\')">' + l + '</span>';
    });
    h += '</div></div></div>';
  });
  h += '</div>';
  container.innerHTML = h;
}

function toggleModAcc(idx) {
  var acc = document.getElementById('mod-acc-' + idx);
  if (!acc) return;
  var isOpen = acc.classList.contains('open');
  document.querySelectorAll('.mod-acc').forEach(function(el) { el.classList.remove('open'); });
  if (!isOpen) acc.classList.add('open');
}

/* ===== 11. INLINE SECTION RENDERERS ===== */

function renderStats() {
  var el = document.getElementById('s-15-stats');
  if (!el || !C.stats) return;
  var s = C.stats;
  el.innerHTML =
    '<div class="s15-stat-item"><div class="s15-stat-n">' + s.people + '</div><div class="s15-stat-l">' + s.peopleLabel + '</div></div>' +
    '<div class="s15-stat-dot"></div>' +
    '<div class="s15-stat-item"><div class="s15-stat-n">' + s.events + '</div><div class="s15-stat-l">' + s.eventsLabel + '</div></div>' +
    '<div class="s15-stat-dot"></div>' +
    '<div class="s15-stat-item"><div class="s15-stat-n">' + s.members + '</div><div class="s15-stat-l">' + s.membersLabel + '</div></div>' +
    '<div class="s15-stat-dot"></div>' +
    '<div class="s15-stat-item"><div class="s15-stat-n">' + s.satisfaction + '</div><div class="s15-stat-l">' + s.satisfactionLabel + '</div></div>';
}
function renderPainPoints() {
  var el = document.getElementById('s3-grid');
  if (!el || !C.painPoints) return;
  var palettes = [
    {bg:'rgba(196,149,106,0.1)',fg:'#c4956a'},
    {bg:'rgba(212,115,62,0.1)',fg:'#d4733e'},
    {bg:'rgba(122,154,90,0.1)',fg:'#7a9a5a'},
    {bg:'rgba(90,154,138,0.1)',fg:'#5a9a8a'},
    {bg:'rgba(212,138,138,0.1)',fg:'#d48a8a'},
    {bg:'rgba(106,154,200,0.1)',fg:'#6a9ac8'},
    {bg:'rgba(184,138,106,0.1)',fg:'#b88a6a'},
    {bg:'rgba(138,122,154,0.1)',fg:'#8a7a9a'}
  ];
  var h = '';
  C.painPoints.forEach(function(p, i) {
    var pa = palettes[i % 8];
    h += '<div class="pp-card reveal">';
    h += '<div class="pp-ico"><span class="pp-c" style="background:' + pa.bg + ';color:' + pa.fg + '">' + p.icon + '</span></div>';
    h += '<div class="pp-body"><div class="pp-t">' + p.title + '</div><div class="pp-d">' + p.desc + '</div><div class="pp-s">' + p.solution + '</div></div>';
    h += '</div>';
  });
  el.innerHTML = h;
  window.observeReveal(el);
}

function renderPromise() {
  var el = document.getElementById('s2-promise');
  if (!el || !C.promise) return;
  var p = C.promise;
  var h = '<div class="prom-badge">兵姐的承诺</div>';
  h += '<div class="prom-h">' + p.headline + '</div>';
  h += '<div class="prom-sub">' + p.subhead + '</div>';
  el.innerHTML = h;
}

/* Sign-in / check-in for Screen 2 */
function renderSignIn() {
  var el = document.getElementById('s2-signin');
  if (!el) return;
  var checked = localStorage.getItem('signin_today') === new Date().toDateString();
  el.innerHTML =
    '<div class="si-icon">✓</div>' +
    '<div class="si-info"><div class="si-t">每日签到' + (checked ? ' · 已签到' : '') + '</div><div class="si-d">' + (checked ? '明天再来，保持连胜！' : '签到赚粮票，连续签到奖励更多') + '</div></div>' +
    '<button class="si-btn' + (checked ? ' done' : '') + '" onclick="doSignIn(this)">' + (checked ? '已签到' : '签到') + '</button>' +
    '<span class="si-strk">🔥 连续' + (parseInt(localStorage.getItem('signin_streak')||'0')) + '天</span>';
}

function doSignIn(btn) {
  var today = new Date().toDateString();
  if (localStorage.getItem('signin_today') === today) return;
  localStorage.setItem('signin_today', today);
  var streak = parseInt(localStorage.getItem('signin_streak')||'0') + 1;
  localStorage.setItem('signin_streak', streak);
  renderSignIn();
  alert('🎉 签到成功！已连续签到' + streak + '天，获得' + (10 + streak) + '工分');
}

function renderStayAccordion() {
  var el = document.getElementById('s4-tabs');
  if (!el || !C.stay) return;
  var tabs = [
    { id: 'rooms', label: '房型展示', content: renderStayRoomsInline },
    { id: 'book', label: '预约住宿', content: renderStayBookInline },
    { id: 'trips', label: '往期旅居', content: renderStayTripsInline },
    { id: 'yard', label: '合作院子', content: renderStayYardInline }
  ];
  var h = '<div class="s4-tab-h">';
  tabs.forEach(function(t, i) {
    h += '<button class="s4-tab-btn' + (i===0?' active':'') + '" onclick="switchS4Tab(\'' + t.id + '\')">' + t.label + '</button>';
  });
  h += '</div><div id="s4-tab-body">';
  h += renderStayRoomsInline();
  h += '</div>';
  el.innerHTML = h;
}

function renderStayRoomsInline() {
  if (!C.stay.rooms) return '<div class="s4-empty">暂无房型信息</div>';
  var h = '<div class="s4-rooms">';
  C.stay.rooms.forEach(function(r) {
    h += '<div class="s4-room"><div class="s4-room-img" style="background-image:url(' + (r.img||'') + ')"></div><div class="s4-room-n">' + r.name + '</div><div class="s4-room-info">' + r.beds + ' · ' + r.capacity + ' · ' + r.area + '</div><div class="s4-room-d">' + r.desc + '</div><div class="s4-room-pr">¥' + r.price + '<small>/晚</small></div></div>';
  });
  h += '</div>';
  return h;
}

function renderStayBookInline() {
  var h = '<div class="s4-book"><div class="s4-book-row"><div><label>入住</label><input type="date" id="b-date-in"></div><div><label>退房</label><input type="date" id="b-date-out"></div></div><div class="s4-book-row"><div><label>房型</label><select id="b-room"><option>竹景大床房</option><option>竹景双床房</option><option>全景套房</option></select></div><div><label>人数</label><select id="b-guests"><option>1人</option><option>2人</option><option>3人</option><option>4人</option></select></div></div><div><label>联系人</label><input type="text" id="b-name" placeholder="姓名"></div><div style="margin-top:6px"><label>电话</label><input type="tel" id="b-phone" placeholder="手机号"></div><button class="s4-submit" onclick="submitBooking()">提交预约</button></div>';
  window.submitBooking = function() {
    var name = document.getElementById('b-name').value;
    var phone = document.getElementById('b-phone').value;
    if (!name || !phone) { alert('请填写联系人和电话'); return; }
    var data = {dateIn:document.getElementById("b-date-in").value,dateOut:document.getElementById("b-date-out").value,room:document.getElementById("b-room").value,guests:document.getElementById("b-guests").value,name:name,phone:phone};
    var list = JSON.parse(localStorage.getItem('bookings')||'[]');
    list.push(data);
    localStorage.setItem('bookings', JSON.stringify(list));
    var btn = document.querySelector(".s4-submit");
    if(btn)btn.textContent="提交中...";
    fetch("http://YOUR_SERVER_IP:3000/api/booking",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
      .then(function(r){return r.json()}).then(function(d){alert(d.msg);if(btn)btn.textContent="提交预约"})
      .catch(function(){alert("✅ 预约成功！已保存本地");if(btn)btn.textContent="提交预约"});
    alert('✅ 预约成功！兵姐会尽快联系您确认。');
  };
  return h;
}

function renderStayYardInline() {
  return '<div class="s4-yard"><div class="s4-yard-t">合作院子招募中</div><div class="s4-yard-d">在安吉竹林深处，有一个小村落正在寻找有缘人。如果你也想过「采菊东篱下」的生活，欢迎来坐坐。</div><button class="s4-yard-btn">了解详情</button></div>';
}

function renderStayTripsInline() {
  if (!C.stay.pastTrips) return '';
  var h = '<div class="s4-trips">';
  C.stay.pastTrips.forEach(function(t) {
    h += '<div class="s4-trip"><span class="s4-trip-s">' + t.season + '</span><span class="s4-trip-p">' + t.place + ' · ' + t.people + '人</span><span class="s4-trip-d">' + t.desc + '</span></div>';
  });
  h += '</div>';
  return h;
}

/* S4 tab switching */
function switchS4Tab(tab) {
  document.querySelectorAll('.s4-tab-btn').forEach(function(b){b.classList.remove('active')});
  document.querySelectorAll('.s4-tab-btn').forEach(function(b){
    if ((b.getAttribute('onclick')||'').indexOf("'" + tab + "'") > -1) b.classList.add('active');
  });
  var body = document.getElementById('s4-tab-body');
  if (!body) return;
  switch(tab) {
    case 'rooms': body.innerHTML = renderStayRoomsInline(); break;
    case 'book': body.innerHTML = renderStayBookInline(); break;
    case 'yard': body.innerHTML = renderStayYardInline(); break;
    case 'trips': body.innerHTML = renderStayTripsInline(); break;
  }
}

function renderCommunityPreview() {
  var el = document.getElementById('s5-feed');
  if (!el || !C.community || !C.community.posts) return;
  var h = '';
  var posts = C.community.posts.slice(0, 3);
  var ac = ['#c4956a','#d4733e','#7a9a5a'];
  posts.forEach(function(p, i) {
    h += '<div class="s5-post-p reveal"><div class="s5-post-ph"><div class="s5-post-pa" style="background:' + ac[i%3] + '">' + p.author.charAt(0) + '</div><span class="s5-post-pn">' + p.author + '</span><span class="s5-post-pt">' + p.time + '</span></div><div class="s5-post-pc">' + p.content + '</div><div class="s5-post-pf"><span>♥ ' + p.likes + '</span><span>' + p.comments + '评</span></div></div>';
  });
  h += '<div class="s5-more" onclick="openSubpage(\'s-community\')">去社区看看 →</div>';
  el.innerHTML = h;
  window.observeReveal(el);
}

function renderShopPreview() {
  var el = document.getElementById('s6-grid');
  if (!el || !C.marketplace) return;
  var h = '<div class="s6-preview">';
  if (C.marketplace.shopItems) {
    var items = C.marketplace.shopItems.filter(function(i){return i.type==='official'}).slice(0, 3);
    var shopIcos = ['茶','写','声'];
    items.forEach(function(i, idx) {
      h += '<div class="s6-p-item reveal"><div class="s6-p-ico"><span class="s6-p-c" style="background:rgba(196,149,106,0.1);color:#c4956a">' + (shopIcos[idx]||'品') + '</span></div><div class="s6-p-n">' + i.name + '</div><div class="s6-p-p">' + i.price + ' ' + (i.unit||'') + '</div></div>';
    });
    h += '<div class="s6-stall-s">';
    C.marketplace.shopItems.filter(function(i){return i.type==='stall' && i.status!=='open'}).forEach(function(s) {
      h += '<div class="s6-p-stall"><span class="s6-ps-n">' + s.name + '</span><span class="s6-ps-o">' + (s.owner||'') + '</span></div>';
    });
    h += '</div>';
  }
  h += '<div class="s5-more" onclick="openSubpage(\'s-shop\')">去小铺逛逛 →</div>';
  h += '</div>';
  el.innerHTML = h;
  window.observeReveal(el);
}

/* ESC key to close */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (document.getElementById('sub-course-detail').classList.contains('open')) {
      closeCourseDetail();
    } else {
      closeSubpage();
    }
  }
});


/* ===== AI客服 ===== */
function toggleKF() {
  document.getElementById('kf-panel').classList.toggle('open');
}
function kfAnswer(el) {
  var q = el.textContent.trim();
  var answers = {
    '怎么报名课程':'点击首页的「兵姐精选」或「大伙在聊啥」下方的模块，进入课程列表。选择你感兴趣的课程，点进去可以看到详细介绍。免费课程直接点击「免费报名学习」即可。付费课程需要消耗粮票。',
    '粮票怎么获得':'每天签到获得10+工分；发一篇帖子获得20工分；收到一个赞获得2工分；回答被采纳获得15工分；推荐好友注册获得100工分。100工分自动转为1粮票。',
    '民宿怎么预约':'点击「民宿旅居」模块 → 「预约住宿」→ 选择房型和日期 → 提交预约信息。也可以直接联系兵姐微信：bingjie_anji。',
    '有什么免费课程':'目前有5门免费课程：1️⃣ 八段锦晨间唤醒 2️⃣ 春季养生食疗 3️⃣ 剪映剪辑入门 4️⃣ 中老年穿搭指南 5️⃣ 高血压居家调理。全部免费报名学习。',
    '怎么联系兵姐':'微信：bingjie_anji（备注"战友"）\n电话：138-xxxx-xxxx\n地址：浙江·安吉·天荒坪镇\n也可以直接在聊天室找在线战友帮忙。',
    'AI工具怎么用':'在「AI百宝箱」模块中，有AI写真、AI换装、老照片修复、语音克隆、AI写文案、旅游AI拍照等工具。每个工具都有详细的引导，按步骤操作即可。'
  };
  document.getElementById('kf-qs').style.display = 'none';
  var ans = document.getElementById('kf-ans');
  ans.style.display = 'block';
  ans.innerHTML = '<div style="font-weight:600;color:#2d2a24;margin-bottom:4px">' + q + '</div><div style="color:#5a4a3a">' + (answers[q]||'正在为您查询，请稍候...') + '</div><div style="text-align:right;margin-top:6px"><span style="font-size:0.38rem;color:#c4956a;cursor:pointer" onclick="kfBack()">← 返回问题列表</span></div>';
}
function kfBack() {
  document.getElementById('kf-qs').style.display = 'flex';
  document.getElementById('kf-ans').style.display = 'none';
}

/* Play course lesson (video/audio) */
function playCourseLesson(courseId, lessonNum, lessonName) {
  var player = document.getElementById('cd-player-' + courseId);
  var label = document.getElementById('cd-player-label');
  if (player) player.style.display = 'block';
  if (label) label.textContent = '播放：' + lessonName;
}

/* Share button */
function shareSite() {
  var url = window.location.href;
  var text = '兵姐康养旅居 - 后半生的另一种活法';
  /* Try Web Share API first */
  if (navigator.share) {
    navigator.share({title: text, text: text, url: url}).catch(function(e){});
    return;
  }
  /* Fallback: copy link */
  try {
    navigator.clipboard.writeText(url).then(function() {
      alert('✅ 链接已复制！分享给好友，TA注册后双方都得粮票奖励！');
    }).catch(function() {
      /* Final fallback */
      var ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('✅ 链接已复制！分享给好友，TA注册后双方都得粮票奖励！');
    });
  } catch(e) {
    prompt('复制链接分享给好友：', url);
  }
}
/* Check referral */
if (window.location.search.indexOf('ref=') > -1) {
  localStorage.setItem('referral', window.location.search.split('ref=')[1].split('&')[0]);
}

/* ===== CHAT & AUTH ===== */
var _chatUser = null;
var _chatMsgs = [];
var _authMode = 'login';

/* FAB menu toggle */
function toggleFabMenu() {
  var m = document.getElementById('fab-menu');
  var b = document.getElementById('fab-main');
  if (!m || !b) return;
  m.classList.toggle('open');
  b.classList.toggle('open');
  /* Stagger animation delay for items */
  var items = m.querySelectorAll('.fab-item');
  items.forEach(function(el, i) { el.style.animationDelay = (i*0.04) + 's'; });
}

function toggleChat() {
  var p = document.getElementById('chat-panel');
  if (!p) return;
  p.classList.toggle('open');
  if (p.classList.contains('open') && _chatMsgs.length === 0 && _chatUser) {
    loadChatHistory();
  }
  if (p.classList.contains('open') && !_chatUser) {
    openAuth();
  }
}

function openAuth() { var o = document.getElementById('auth-overlay'); if(o) o.classList.add('open'); }
function closeAuth() { var o = document.getElementById('auth-overlay'); if(o) o.classList.remove('open'); }

function switchAuthTab(mode) {
  _authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(function(t){t.classList.remove('active')});
  var tabs = document.querySelectorAll('.auth-tab');
  if (mode === 'login' && tabs[0]) tabs[0].classList.add('active');
  if (mode === 'register' && tabs[1]) tabs[1].classList.add('active');
  document.getElementById('auth-btn').textContent = mode === 'login' ? '登录' : '注册';
  document.getElementById('auth-nick').style.display = mode === 'register' ? 'block' : 'none';
}

function doAuth() {
  var email = document.getElementById('auth-email').value.trim();
  var pass = document.getElementById('auth-pass').value;
  var nick = document.getElementById('auth-nick').value.trim() || email.split('@')[0];
  if (!email || pass.length < 3) { document.getElementById('auth-err').textContent='请填写完整'; return; }
  if (_firebaseReady) {
    if (_authMode === 'login') {
      firebase.auth().signInWithEmailAndPassword(email, pass)
        .then(function(r){ _chatUser = r.user; _chatUser._nick = nick; afterAuth(); })
        .catch(function(e){ document.getElementById('auth-err').textContent=e.message; });
    } else {
      firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then(function(r){
          _chatUser = r.user;
          _chatUser._nick = nick;
          r.user.updateProfile({displayName: nick});
          afterAuth();
        })
        .catch(function(e){ document.getElementById('auth-err').textContent=e.message; });
    }
  } else {
    _chatUser = { email: email, _nick: nick, uid: 'demo_' + Date.now() };
    afterAuth();
  }
}

function afterAuth() {
  closeAuth();
  toggleChat();
  addChatMsg({ name: '系统', text: '欢迎 ' + (_chatUser._nick||_chatUser.displayName||_chatUser.email) + '！', time: new Date().toLocaleTimeString() });
  /* Update nav login button */
  var navLogin = document.getElementById('nav-login');
  if (navLogin) navLogin.textContent = (_chatUser._nick||'我') + '✓';
}

function addChatMsg(msg, isMe) {
  var container = document.getElementById('chat-msgs');
  var empty = document.getElementById('chat-empty');
  if (!container) return;
  if (empty) empty.style.display = 'none';
  var d = document.createElement('div');
  d.className = 'chat-msg ' + (isMe ? 'me' : 'other');
  d.innerHTML = (!isMe ? '<span class="chat-name">' + (msg.name||'匿名') + '</span>' : '') + msg.text + '<span class="chat-time">' + (msg.time||'刚刚') + '</span>';
  container.appendChild(d);
  document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;
}

function sendChatMsg() {
  var input = document.getElementById('chat-input');
  var text = input.value.trim();
  if (!text) return;
  input.value = '';
  if (!_chatUser) { openAuth(); return; }
  var name = _chatUser._nick || _chatUser.displayName || _chatUser.email || '战友';
  addChatMsg({ name: name, text: text, time: new Date().toLocaleTimeString() }, true);
  if (_firebaseReady) {
    try { firebase.firestore().collection('chats').add({ name: name, text: text, time: firebase.firestore.FieldValue.serverTimestamp(), uid: _chatUser.uid }); } catch(e) {}
  } else {
    _chatMsgs.push({ name: name, text: text, time: Date.now() });
    /* Demo: random reply */
    if (Math.random() > 0.4) {
      var replies = ['说得对！👍','哈哈是的','我也这么觉得😊','收到收到！','有道理有道理','你说得太好了','同意+1','原来如此！','学到了','好主意！'];
      setTimeout(function(){
        addChatMsg({ name: '战友' + Math.floor(Math.random()*100), text: replies[Math.floor(Math.random()*replies.length)], time: new Date().toLocaleTimeString() });
      }, 1000 + Math.random() * 2000);
    }
  }
}

function loadChatHistory() {
  var container = document.getElementById('chat-msgs');
  var empty = document.getElementById('chat-empty');
  if (!container) return;
  if (_firebaseReady) {
    /* Real-time listener */
    if (!window._chatListener) {
      window._chatListener = firebase.firestore().collection('chats').orderBy('time','asc').limit(50).onSnapshot(function(snap){
        container.innerHTML = '';
        if (empty) empty.style.display = 'none';
        snap.forEach(function(doc){ var d=doc.data(); addChatMsg({name:d.name,text:d.text,time:d.time?d.time.toDate().toLocaleTimeString():''}); });
      });
    }
  } else {
    var demos = [
      {name:'王阿姨',text:'今天去安吉竹海走了走，空气真好！'},
      {name:'张建国',text:'发一张我拍的照片🌄',time:'14:23'},
      {name:'李老师',text:'明天晨练八段锦，有人一起吗？'},
      {name:'刘姐',text:'周末想去杭州逛逛，有组团的吗？'},
      {name:'兵姐',text:'@所有人 下周有新活动，敬请期待！'},
    ];
    demos.forEach(function(m){ addChatMsg(m); });
    if (empty) empty.style.display = 'none';
  }
}

/* Swipe back gesture for subpages */
(function(){
  var sx = 0;
  document.addEventListener('touchstart', function(e) {
    sx = e.touches[0].clientX;
  });
  document.addEventListener('touchmove', function(e) {
    var dx = e.touches[0].clientX - sx;
    if (dx > 80 && document.querySelector('.subpage.open')) {
      sx = 0;
      closeSubpage();
    }
  });
})();

/* Online count fluctuation for chat */
setInterval(function(){
  var el = document.getElementById('chat-online-n');
  if (el) {
    var base = parseInt(el.textContent) || 8;
    var n = base + (Math.random()-0.5)*3;
    el.textContent = Math.max(3, Math.round(n));
  }
}, 5000);

/* ===== SUB-PARTICLES (for subpages) ===== */
(function(){
  var c = document.getElementById('sub-particle-canvas');
  if(!c) return;
  var ctx = c.getContext('2d');
  var p = [], anim;
  function resize(){c.width=window.innerWidth;c.height=window.innerHeight}
  resize(); window.addEventListener('resize', resize);
  var n = window.innerWidth < 640 ? 8 : 25;
  var cs = ['rgba(196,149,106,','rgba(255,220,180,','rgba(255,255,255,'];
  for(var i=0;i<n;i++) p.push({
    x:Math.random()*c.width,y:Math.random()*c.height,
    vx:(Math.random()-0.5)*0.15,vy:(Math.random()-0.5)*0.15,
    r:Math.random()*2+0.5,baseOp:Math.random()*0.25+0.08,
    color:cs[Math.floor(Math.random()*3)],ph:Math.random()*Math.PI*2,speed:0.005+Math.random()*0.01
  });
  function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    p.forEach(function(d){
      d.x+=d.vx;d.y+=d.vy;d.ph+=d.speed;
      if(d.x<-20)d.x=c.width+20;if(d.x>c.width+20)d.x=-20;
      if(d.y<-20)d.y=c.height+20;if(d.y>c.height+20)d.y=-20;
      var po=d.baseOp*(0.5+0.5*Math.sin(d.ph));
      ctx.beginPath();ctx.arc(d.x,d.y,d.r*3,0,Math.PI*2);
      ctx.fillStyle=d.color+(po*0.05)+')';ctx.fill();
      ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle=d.color+po+')';ctx.fill();
    });
    anim=requestAnimationFrame(loop);
  }
  loop();
})();

/* ===== DARK MODE ===== */
function toggleDark() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark') ? '1' : '0');
}
/* Dark mode disabled by default */

/* ===== SEARCH ===== */
function openSearch() {
  var el = document.getElementById('search-overlay');
  if (!el) return;
  el.classList.add('open');
  document.getElementById('search-input').focus();
}
function closeSearch() {
  document.getElementById('search-overlay').classList.remove('open');
}
function doSearch() {
  var q = document.getElementById('search-input').value.trim().toLowerCase();
  if (!q) return;
  var results = [];
  if (C.courses && C.courses.list) C.courses.list.forEach(function(c){
    if (c.title.toLowerCase().indexOf(q) > -1 || c.desc.toLowerCase().indexOf(q) > -1 || c.teacher.toLowerCase().indexOf(q) > -1) results.push({type:'课程',name:c.title,sub:c.desc,onclick:"openCourseDetail("+c.id+")"});
  });
  if (C.community && C.community.posts) C.community.posts.forEach(function(p){
    if (p.content.toLowerCase().indexOf(q) > -1 || p.author.indexOf(q) > -1) results.push({type:'帖子',name:p.author,sub:p.content.slice(0,30)+'...'});
  });
  var h = '<div style="font-size:0.45rem;color:#8a7a6a;margin-bottom:6px">找到 ' + results.length + ' 个结果</div>';
  results.forEach(function(r, i) {
    h += '<div class="search-result" onclick="closeSearch();' + (r.onclick||'') + '"><div class="search-rt">' + r.type + '</div><div class="search-rn">' + r.name + '</div><div class="search-rd">' + r.sub + '</div></div>';
  });
  document.getElementById('search-results').innerHTML = h || '<div style="text-align:center;color:#8a7a6a;padding:20px;font-size:0.45rem">没找到相关内容</div>';
}

/* ===== SCROLL TO TOP ===== */
window.addEventListener('scroll', function() {
  var btn = document.getElementById('top-btn');
  if (!btn) return;
  btn.classList.toggle('show', window.scrollY > 400);
});
function scrollTop() {
  window.scrollTo({top:0,behavior:'smooth'});
}

/* Page load animation */
});