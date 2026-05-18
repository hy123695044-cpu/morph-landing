var C = window.CONTENT;

/* Shared placeholder avatars (Chinese surname initials) - replace with real photos later */
var _avatarColors = ['#d4733e','#7a9a5a','#c4956a','#6a9ac8','#b88a6a','#5a9a8a','#d48a8a','#8a7a9a'];
var _avatarNames = ['王','张','李','刘','陈','赵','吴','周','孙','钱','郑','冯','蒋','沈','韩','杨','朱','秦','许','何','吕','施','孔','曹','严','华','金','魏','陶','姜'];
var _photos = [];
for(var _i=0;_i<_avatarNames.length;_i++){
  var _c = _avatarColors[_i%_avatarColors.length];
  var _n = _avatarNames[_i];
  _photos.push('data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="' + _c + '"/><text x="40" y="45" text-anchor="middle" fill="white" font-size="28" font-weight="600" font-family="sans-serif">' + _n + '</text></svg>'));
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
  var n = Math.min(80, Math.floor(window.innerWidth/12));
  var cs = ['rgba(255,255,255,','rgba(255,220,180,','rgba(196,149,106,'];
  for(var i=0;i<n;i++) p.push({
    x:Math.random()*c.width,y:Math.random()*c.height,
    vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3-0.05,
    r:Math.random()*2.5+0.8,op:Math.random()*0.35+0.15,
    baseOp:Math.random()*0.35+0.15,
    color:cs[Math.floor(Math.random()*3)],
    ph:Math.random()*Math.PI*2, speed:0.008+Math.random()*0.015,
    trail:[]
  });
  function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    p.forEach(function(d){
      /* Mouse tracking attraction */
      if(mouse.active){
        var dx=mouse.x-d.x, dy=mouse.y-d.y, dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<300){
          var force=0.0008*(300-dist)/300;
          d.vx+=dx*force; d.vy+=dy*force;
        }
      }
      d.x+=d.vx;d.y+=d.vy;d.ph+=d.speed;
      /* Friction to keep movement smooth */
      d.vx*=0.995;d.vy*=0.995;
      /* Random drift */
      d.vx+=(Math.random()-0.5)*0.008;d.vy+=(Math.random()-0.5)*0.008;
      /* Boundary wrap with padding */
      if(d.x<-20)d.x=c.width+20;if(d.x>c.width+20)d.x=-20;
      if(d.y<-20)d.y=c.height+20;if(d.y>c.height+20)d.y=-20;
      /* Opacity pulse */
      var po=d.baseOp*(0.55+0.45*Math.sin(d.ph));
      /* Glow: outer halo */
      ctx.beginPath();ctx.arc(d.x,d.y,d.r*4,0,Math.PI*2);
      ctx.fillStyle=d.color+(po*0.06)+')';ctx.fill();
      /* Glow: mid halo */
      ctx.beginPath();ctx.arc(d.x,d.y,d.r*2,0,Math.PI*2);
      ctx.fillStyle=d.color+(po*0.15)+')';ctx.fill();
      /* Core dot */
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

  /* S2: bottom links */
  var bl=document.getElementById('s2-links');
  if(bl){
    bl.innerHTML=
      '<button class="s2-link-btn" onclick="openSubpage(\'s-tickets\')"><span class="s2-link-icon"><span style="display:inline-flex;width:28px;height:28px;border-radius:50%;background:linear-gradient(145deg,#d4a86a,#c08850);align-items:center;justify-content:center;color:#fff;font-size:0.6rem">券</span></span><div><div class="ln">粮票中心</div><div class="ld">等级 · 赚粮票 · 消费指南</div></div></button>'+
      '<button class="s2-link-btn" onclick="openSubpage(\'s-community\')"><span class="s2-link-icon"><span style="display:inline-flex;width:28px;height:28px;border-radius:50%;background:linear-gradient(145deg,#e8935a,#d4733e);align-items:center;justify-content:center;color:#fff;font-size:0.6rem">赏</span></span><div><div class="ln">悬赏任务</div><div class="ld">帮个小忙赚粮票</div></div></button>'+
      '<button class="s2-link-btn" onclick="openSubpage(\'s-about\')"><span class="s2-link-icon"><span style="display:inline-flex;width:28px;height:28px;border-radius:50%;background:linear-gradient(145deg,#9aba7a,#7a9a5a);align-items:center;justify-content:center;color:#fff;font-size:0.6rem">人</span></span><div><div class="ln">关于兵姐</div><div class="ld">退伍老兵 · 足迹遍布全国</div></div></button>';
  }

  /* Render accordion modules */
  renderAccordion();

  /* Render new inline sections */
  renderStats();
  renderPromise();
  renderPainPoints();
  renderStayAccordion();
  renderCommunityPreview();
  renderShopPreview();

  /* Observe all reveals */
  window.observeReveal();

  /* S1.5 observe badges */
  
  /* Inject animation keyframes for map */
  var mapStyle = document.createElement('style');
  mapStyle.textContent = '@keyframes map-pop{0%{opacity:0;transform:translate(-50%,-50%) scale(0)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}@keyframes map-pulse{0%,100%{opacity:0.3;transform:translate(-50%,-50%) scale(1)}50%{opacity:0.6;transform:translate(-50%,-50%) scale(1.5)}}@keyframes ai-progress{0%{width:0%}50%{width:70%}100%{width:100%}}';
  document.head.appendChild(mapStyle);
  
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
  h += '<div class="sub1-cta-t">小隐村 · 合作院子招募中</div>';
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
  h += '<div class="cd-body">';
  h += '<div class="cd-h"><div class="cd-t">' + course.title + '</div>';
  h += course.price === 0 ? '<span class="cd-pr free">免费</span>' : '<span class="cd-pr">' + course.price + '粮票</span>';
  h += '</div><div class="cd-meta">';
  h += '<span style="color:rgba(255,255,255,0.5)">' + course.teacher + '</span><span class="star" style="color:#d4b88a">★ ' + course.rating + '</span><span style="color:rgba(255,255,255,0.5)">' + course.lessons + '节课</span><span style="color:rgba(255,255,255,0.5)">' + course.duration + '</span>';
  h += '</div><div class="cd-desc">' + course.full + '</div>';
  h += '<div class="cd-inc-h">📦 课程包含</div><div class="cd-inc">';
  if (course.includes) course.includes.forEach(function(item) {
    h += '<div class="cd-inc-item">' + item + '</div>';
  });
  h += '</div>';
  h += '<button class="cd-buy' + (course.price===0?' free':'') + '" onclick="alert(\'' + (course.price===0?'报名成功！':'购买成功！消耗' + course.price + '粮票') + '\')">' + (course.price===0?'免费报名':'💰 ' + course.price + '粮票购买') + '</button>';
  h += '<div style="text-align:center;margin-top:8px;font-size:0.36rem;color:#8a7a6a">' + course.learners + '人已报名</div></div>';
  body.innerHTML = h;
  document.getElementById('sub-course-detail').classList.add('open');
}

/* ---- S-大伙在聊啥 — Discord风格双栏 ---- */
function renderCommunitySub() {
  var body = document.getElementById('sub-body-s-community');
  if (!body || !C.community) return;
  var cm = C.community;
  var h = '';

  /* Hero - subtle交友 theme */
  h += '<div class="com-hero"><div class="com-hero-t">🌅 战友俱乐部</div><div class="com-hero-d">找同好 · 聊心事 · 约活动 — 这里是大家的线上小院</div></div>';

  /* Online count */
  h += '<div class="com-online"><div class="com-online-dot"></div><span class="com-online-n">' + (cm.onlineUsers ? cm.onlineUsers.length * 3 + 18 : 28) + '</span><span class="com-online-l">位战友在线</span></div>';

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
  h += '<div class="shop-hero"><div class="shop-hero-t">💎 钻石展位</div><div class="shop-hero-d">战友精选 · 粮票就能换</div></div>';

  /* Official products grid */
  var official = items.filter(function(i){return i.type==='official'});
  h += '<div class="shop-sec-h">官方出品</div>';
  h += '<div class="shop-grid">';
  official.forEach(function(item) {
    var hasDiscount = item.original && item.original > item.price;
    h += '<div class="shop-card" onclick="alert(\'' + item.name + ' - 详情页\')">';
    h += '<div class="shop-card-badge">' + (item.tag || '🛒') + '</div>';
    h += '<div class="shop-card-img">' + (item.img || '📦') + '</div>';
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
  h += '<div class="shop-sec-h" style="margin-top:16px">👥 战友摊位 <span style="font-weight:400;font-size:0.45rem;color:#8a7a6a">邻居家的好东西</span></div>';
  h += '<div class="shop-stalls">';
  stalls.forEach(function(s) {
    if (s.status === 'open') {
      h += '<div class="shop-stall shop-stall-open" onclick="alert(\'申请入驻\')"><div class="shop-stall-name">+ 招募中</div><div class="shop-stall-desc">等你来入驻</div></div>';
    } else {
      h += '<div class="shop-stall" onclick="alert(\'' + (s.owner||'') + ' - ' + s.name + '\')">';
      h += '<div class="shop-stall-img">' + (s.img || '🛍️') + '</div>';
      h += '<div class="shop-stall-info"><div class="shop-stall-name">' + s.name + '</div><div class="shop-stall-owner">' + (s.owner||'') + '</div><div class="shop-stall-desc">' + (s.desc||'') + '</div></div>';
      h += '<div class="shop-stall-right"><div class="shop-stall-price">' + s.price + '</div><div class="shop-stall-unit">粮票</div><div class="shop-stall-sales">已售' + (s.sales||0) + '</div></div>';
      h += '</div>';
    }
  });
  h += '</div>';

  body.innerHTML = h;
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

var _accIcons = ['宿','课','聊','铺','AI'];
var _accLinks = {
  's-stay':    ['房型展示','预约住宿','合作院子','往期旅居'],
  's-courses': ['AI类','工具类','生活类','康养类','娱乐类','直播类'],
  's-community':['热门动态','悬赏任务','找旅伴'],
  's-shop':    ['官方出品','战友摊位'],
  's-ai':      ['AI写真','AI换装','老照片修复','语音克隆','AI写文案','旅游AI拍照']
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

function renderStayAccordion() {
  var el = document.getElementById('s4-tabs');
  if (!el || !C.stay) return;
  var tabs = [
    { id: 'rooms', label: '房型展示', content: renderStayRoomsInline },
    { id: 'book', label: '预约住宿', content: renderStayBookInline },
    { id: 'yard', label: '合作院子', content: renderStayYardInline },
    { id: 'trips', label: '往期旅居', content: renderStayTripsInline }
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
    h += '<div class="s4-room"><div class="s4-room-n">' + r.name + '</div><div class="s4-room-info">' + r.beds + ' · ' + r.capacity + ' · ' + r.area + '</div><div class="s4-room-d">' + r.desc + '</div><div class="s4-room-pr">¥' + r.price + '<small>/晚</small></div></div>';
  });
  h += '</div>';
  return h;
}

function renderStayBookInline() {
  var h = '<div class="s4-book"><div class="s4-book-row"><div><label>入住</label><input type="date"></div><div><label>退房</label><input type="date"></div></div><div class="s4-book-row"><div><label>房型</label><select><option>竹景大床房</option><option>竹景双床房</option><option>全景套房</option></select></div><div><label>人数</label><select><option>1人</option><option>2人</option><option>3人</option><option>4人</option></select></div></div><div><label>联系人</label><input type="text" placeholder="姓名"></div><div style="margin-top:6px"><label>电话</label><input type="tel" placeholder="手机号"></div><button class="s4-submit">提交预约</button></div>';
  return h;
}

function renderStayYardInline() {
  return '<div class="s4-yard"><div class="s4-yard-t">小隐村 · 合作院子招募中</div><div class="s4-yard-d">在安吉竹林深处，有一个小村落正在寻找有缘人。如果你也想过「采菊东篱下」的生活，欢迎来坐坐。</div><button class="s4-yard-btn">了解详情</button></div>';
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

/* ----- China map: project lon/lat to 0-100 system ----- */
function _mapProject(lon, lat) {
  /* China approx: lon 73-135, lat 18-54, 3% padding */
  var pad = 3, rx = 135 - 73, ry = 54 - 18;
  return {
    x: pad + ((lon - 73) / rx) * (100 - pad * 2),
    y: pad + ((54 - lat) / ry) * (100 - pad * 2)
  };
}

/* ----- Convert MultiPolygon geometry to SVG path d ----- */
function _geomToPath(geometry) {
  var d = '';
  geometry.coordinates.forEach(function(polygon) {
    polygon.forEach(function(ring) {
      ring.forEach(function(pt, i) {
        var p = _mapProject(pt[0], pt[1]);
        d += (i === 0 ? 'M' : 'L') + p.x.toFixed(2) + ' ' + p.y.toFixed(2);
      });
      d += 'Z';
    });
  });
  return d;
}

/* China map locations - geo-calculated via _mapProject(lon,lat) */
var _chinaLocations = [
  {type:'visited', x:75.1, y:65.6, label:'绍兴', season:'第1-4期', count:37},
  {type:'visited', x:75.0, y:65.5, label:'柯桥', season:'第1期', count:7},
  {type:'visited', x:74.5, y:65.0, label:'杭州', season:'第5-6期', count:30},
  {type:'visited', x:73.8, y:64.0, label:'安吉', season:'第14-16期', count:45},
  {type:'visited', x:76.5, y:62.5, label:'上海', season:'第7-9期', count:28},
  {type:'visited', x:76.4, y:61.4, label:'崇明岛', season:'第7-9期', count:20},
  {type:'visited', x:59.1, y:93.1, label:'海南', season:'第10-13期', count:40},
  {type:'visited', x:58.3, y:96.3, label:'三亚', season:'第10-13期', count:35},
  {type:'future', x:77.4, y:46.1, label:'威海', season:'计划中', count:0},
  {type:'future', x:74.8, y:49.8, label:'青岛', season:'计划中', count:0},
  {type:'future', x:48.0, y:78.6, label:'云南', season:'计划中', count:0},
  {type:'future', x:44.3, y:77.2, label:'大理', season:'计划中', count:0},
  {type:'future', x:50.1, y:64.2, label:'成都', season:'计划中', count:0},
  {type:'future', x:53.8, y:66.8, label:'重庆', season:'计划中', count:0},
  {type:'future', x:59.5, y:78.0, label:'桂林', season:'计划中', count:0},
  {type:'future', x:57.5, y:54.5, label:'西安', season:'计划中', count:0},
  {type:'future', x:62.8, y:53.6, label:'洛阳', season:'计划中', count:0},
  {type:'future', x:84.1, y:24.4, label:'哈尔滨', season:'计划中', count:0},
  {type:'future', x:71.4, y:80.1, label:'厦门', season:'计划中', count:0},
  {type:'future', x:71.2, y:71.6, label:'武夷山', season:'计划中', count:0},
  {type:'future', x:65.6, y:64.2, label:'武汉', season:'计划中', count:0},
  {type:'future', x:72.4, y:60.3, label:'南京', season:'计划中', count:0},
  {type:'future', x:62.9, y:45.1, label:'太原', season:'计划中', count:0},
];

/* Render location markers + labels (shared by both map renderers) */
function _renderMapOverlays(container) {
  var h = '';
  container._locations = _chinaLocations;

  _chinaLocations.forEach(function(l, idx) {
    var isVisited = l.type === 'visited';
    var dotColor = isVisited ? '#d4733e' : '#4a8ab5';
    var glowColor = isVisited ? 'rgba(212,115,62,0.35)' : 'rgba(74,138,181,0.25)';
    var delay = (idx * 0.05).toFixed(2);
    var size = isVisited ? 9 : 7;
    var labelColor = isVisited ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)';

    h += '<div class="map-loc" data-idx="' + idx + '" style="position:absolute;left:' + l.x + '%;top:' + l.y + '%;transform:translate(-50%,-50%);animation:map-pop 0.5s ease-out ' + delay + 's both;cursor:pointer" onclick="onMapClick(this,' + idx + ')">';
    h += '<div style="width:' + (size*3) + 'px;height:' + (size*3) + 'px;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:' + glowColor + ';animation:map-pulse 2s ease-in-out ' + delay + 's infinite"></div>';
    h += '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + dotColor + ';box-shadow:0 0 12px ' + glowColor + ';position:relative;z-index:2;animation:map-dot 2s ease-in-out ' + delay + 's infinite"></div>';
    h += '<div style="position:absolute;top:' + (size+8) + 'px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:0.4rem;color:' + labelColor + ';letter-spacing:0.5px">' + l.label + '</div>';
    h += '</div>';
  });

  return h;
}

function _renderMapFooter() {
  var h = '';
  h += '<div style="position:absolute;bottom:6px;right:8px;display:flex;gap:10px;font-size:0.35rem;color:rgba(255,255,255,0.3);letter-spacing:0.5px">';
  h += '<span><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#d4733e;margin-right:2px"></span>去过</span>';
  h += '<span><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#4a8ab5;margin-right:2px"></span>计划中</span>';
  h += '</div>';
  h += '<div id="map-info" style="position:absolute;bottom:6px;left:8px;right:8px;text-align:center;font-size:0.5rem;color:rgba(255,255,255,0.4);letter-spacing:1px">点击地点查看旅居详情</div>';
  h += '<div id="map-people" style="position:absolute;inset:0;display:none;pointer-events:none"></div>';
  return h;
}

/* China map generator - loads real GeoJSON for accurate outline */
function renderChinaMap() {
  var container = document.getElementById('about-china-map');
  if (!container) return;

  container.style.cssText = 'width:100%;height:380px;position:relative;overflow:hidden;border-radius:12px;background:rgba(255,255,255,0.06);margin:4px 0 0;border:1px solid rgba(255,255,255,0.1);cursor:default;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)';

  /* Show loading state */
  container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#8a7a6a;font-size:0.5rem;letter-spacing:2px">加载中国地图...</div>';

  fetch('china.json')
    .then(function(r) { return r.json(); })
    .then(function(geojson) { _renderGeoMap(container, geojson); })
    .catch(function() { _renderFallbackMap(container); });
}

/* Render map using real GeoJSON province boundaries */
function _renderGeoMap(container, geojson) {
  var h = '';

  /* Frosted grid */
  h += '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:20px 20px"></div>';
  /* Glow */
  h += '<div style="position:absolute;left:0;top:0;width:100%;height:100%;background:radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.03) 0%, transparent 60%);pointer-events:none"></div>';

  /* SVG with province paths */
  h += '<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.4" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">';
  geojson.features.forEach(function(f) {
    h += '<path d="' + _geomToPath(f.geometry) + '" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" stroke-width="0.2" stroke-linejoin="round"/>';
  });
  h += '</svg>';

  /* Connecting path */
  h += '<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.2" viewBox="0 0 100 100">';
  h += '<polyline points="64,43 62,44 60,45 57,46 75,32 40,70 63,43" fill="none" stroke="#d4733e" stroke-width="0.6" stroke-dasharray="2,2" stroke-linejoin="round"/>';
  h += '</svg>';

  /* Location markers */
  h += _renderMapOverlays(container);

  /* Footer */
  h += _renderMapFooter();
  container.innerHTML = h;
}

/* Fallback: inline simplified China outline if GeoJSON fails */
function _renderFallbackMap(container) {
  var h = '';

  h += '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:20px 20px"></div>';
  h += '<div style="position:absolute;left:0;top:0;width:100%;height:100%;background:radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.03) 0%, transparent 60%);pointer-events:none"></div>';

  h += '<svg style="position:absolute;inset:2%;width:96%;height:96%;opacity:0.35" viewBox="0 0 100 100">';
  h += '<path d="M48,5 L55,3 L62,4 L68,6 L73,8 L78,12 L83,16 L87,22 L90,28 L91,34 L89,40 L85,45 L82,48 L78,50 L74,52 L70,53 L66,54 L62,55 L58,56 L54,57 L50,58 L46,59 L42,60 L38,61 L34,62 L30,63 L26,64 L22,65 L18,64 L14,62 L11,58 L9,54 L8,50 L9,44 L10,38 L12,32 L15,26 L18,20 L22,15 L27,10 L33,6 L40,4 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>';
  h += '<path d="M76,30 L81,28 L86,29 L90,32 L92,38 L91,44 L88,48 L84,49 L80,48 L77,46 L75,42 L74,36 Z" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>';
  h += '</svg>';

  h += '<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.2" viewBox="0 0 100 100">';
  h += '<polyline points="64,43 62,44 60,45 57,46 75,32 40,70 63,43" fill="none" stroke="#d4733e" stroke-width="0.6" stroke-dasharray="2,2" stroke-linejoin="round"/>';
  h += '</svg>';

  h += _renderMapOverlays(container);
  h += _renderMapFooter();
  container.innerHTML = h;
}

/* Map click handler */
function onMapClick(el, idx) {
  var container = document.getElementById('about-china-map');
  if (!container || !container._locations) return;
  var loc = container._locations[idx];
  if (!loc) return;

  var peopleDiv = document.getElementById('map-people');
  var infoDiv = document.getElementById('map-info');
  if (!peopleDiv || !infoDiv) return;

  /* Toggle: if same location clicked, hide people */
  if (container._activeLoc === idx) {
    peopleDiv.style.display = 'none';
    infoDiv.innerHTML = '点击地点查看旅居详情';
    container._activeLoc = -1;
    return;
  }
  container._activeLoc = idx;

  /* Show big text info */
  var isVisited = loc.type === 'visited';
  infoDiv.innerHTML = '<span style="font-size:clamp(0.7rem,1.8vw,1.2rem);font-weight:700;color:#fff">' + loc.season + '</span><br><span style="font-size:0.55rem;color:rgba(255,255,255,0.5)">' + loc.label + ' · ' + (isVisited ? (loc.count || '') + '位战友同行' : '即将出发') + '</span>';

  /* Generate people avatars - Chinese elderly portraits */
  var count = isVisited ? Math.min(loc.count || 30, 60) : 20;
  var photos = _photos;
  var h = '';

  /* Cluster people around this location instead of random across map */
  var cx = loc.x, cy = loc.y;
  for (var i = 0; i < count; i++) {
    /* Tight cluster around the location dot */
    var angle = Math.random() * 2 * Math.PI;
    var radius = 2 + Math.random() * 10; /* 2-12% spread from center */
    var px = cx + Math.cos(angle) * radius;
    var py = cy + Math.sin(angle) * radius * 0.85; /* slightly tighter vertically */
    /* Keep within bounds */
    px = Math.max(2, Math.min(98, px));
    py = Math.max(2, Math.min(96, py));
    var size = 24 + Math.floor(Math.random() * 10);
    var url = photos[i % photos.length];
    var delay = (i * 0.025).toFixed(2);
    h += '<div style="position:absolute;left:' + px + '%;top:' + py + '%;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:url(' + url + ') center/cover;border:2px solid rgba(255,255,255,0.85);box-shadow:0 2px 8px rgba(0,0,0,0.08);animation:map-pop 0.4s ease-out ' + delay + 's both;opacity:0.9;pointer-events:none"></div>';
  }

  peopleDiv.style.display = 'block';
  peopleDiv.innerHTML = h;
}



