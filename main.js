/* ─────────────────────────────────────────
   0. UTILITIES
───────────────────────────────────────── */
const lerp = (a, b, n) => a + (b - a) * n;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* Shared dialog behavior: open/close, Escape-to-close, backdrop click,
   focus trap, and returning focus to whatever triggered it. Used by the
   privacy modal and the work case-study overlay. */
function initOverlay({ modalId, backId, closeId }){
  const modal = document.getElementById(modalId);
  if (!modal) return null;
  const back   = document.getElementById(backId);
  const closeB = document.getElementById(closeId);
  let lastFocus = null;

  function open(trigger){
    lastFocus = trigger || document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeB?.focus();
  }
  function close(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus();
  }

  closeB?.addEventListener('click', close);
  back?.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const f = modal.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])');
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey){ if (document.activeElement === first){ e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last){ e.preventDefault(); first.focus(); } }
  });

  return { open, close };
}

/* ─────────────────────────────────────────
   1. PAGE LOADER
───────────────────────────────────────── */
(function(){
  const loader = document.getElementById('loader');
  const chars  = loader.querySelectorAll('#loader-name span');
  const bar    = document.getElementById('loader-bar');
  const lpL    = document.getElementById('lp-l');
  const lpR    = document.getElementById('lp-r');
  const tl     = gsap.timeline({ onComplete: startSite });

  /* Chars tumble up */
  tl.to(chars, { y: '0%', duration: .9, ease: 'power4.out', stagger: .06, delay: .15 });
  /* Bar fills */
  tl.to(bar, { width: '100%', duration: .7, ease: 'power2.inOut' }, '-=.3');
  /* Brief pause */
  tl.to({}, { duration: .25 });
  /* Panels split open */
  tl.to([lpL, lpR], { scaleY: 0, duration: .65, ease: 'power3.inOut', stagger: .07 });
  /* Loader out */
  tl.set(loader, { display: 'none' });

  function startSite(){
    heroEntrance();
    initLenis();
    initScrollAnimations();
  }
})();

/* ─────────────────────────────────────────
   2. THREE.JS WEBGL STAR FIELD
───────────────────────────────────────── */
(function(){
  if (typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  const canvas   = document.getElementById('webgl');
  const hero     = canvas.closest('section');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, .1, 2000);
  camera.position.z = 420;

  function layer(n, spread, size, color, opacity){
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i += 3){
      pos[i]   = (Math.random() - .5) * spread;
      pos[i+1] = (Math.random() - .5) * spread * .55;
      pos[i+2] = (Math.random() - .5) * spread * .4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
    return new THREE.Points(geo, mat);
  }

  const l1 = layer(2200, 1600, 1.0, 0xffffff, .4);
  const l2 = layer(600,  1100, 1.8, 0xc4d0ff, .32);
  const l3 = layer(140,   800, 3.2, 0x2dd4bf, .5);
  scene.add(l1, l2, l3);

  let mx = 0, my = 0, tx = 0, ty = 0, t = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - .5) * 22;
    my = (e.clientY / window.innerHeight - .5) * -12;
  });

  (function tick(){
    requestAnimationFrame(tick);
    if (document.hidden) return; /* pause rendering while tab is backgrounded */
    t += .0004;
    l1.rotation.y = t * .35; l2.rotation.y = t * .65; l3.rotation.y = t * 1.0;
    l1.rotation.x = t * .12; l3.rotation.x = t * .22;
    tx = lerp(tx, mx, .035); ty = lerp(ty, my, .035);
    camera.position.x = tx; camera.position.y = ty;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  })();

  function resize(){
    const w = hero.offsetWidth, h = hero.offsetHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
})();

/* ─────────────────────────────────────────
   4. ANIMATED FILM GRAIN
───────────────────────────────────────── */
(function(){
  const c = document.getElementById('grain');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, frame = 0;

  function resize(){
    w = c.width  = window.innerWidth;
    h = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  (function tick(){
    requestAnimationFrame(tick);
    if (document.hidden) return; /* pause redraw while tab is backgrounded */
    if (frame++ % 3 !== 0) return; /* refresh every 3rd frame for film-grain flicker */
    const img = ctx.createImageData(w, h);
    const d   = img.data;
    for (let i = 0; i < d.length; i += 4){
      const v = Math.random() * 255 | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = Math.random() * 22 | 0; /* ~8% max opacity */
    }
    ctx.putImageData(img, 0, 0);
  })();
})();

/* ─────────────────────────────────────────
   5. LENIS SMOOTH SCROLL
───────────────────────────────────────── */
let lenis;
function initLenis(){
  if (typeof Lenis === 'undefined') return;
  lenis = new Lenis({ lerp: .085, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ─────────────────────────────────────────
   6. GSAP SCROLL ANIMATIONS
───────────────────────────────────────── */
function heroEntrance(){
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  /* Clip-path reveals */
  tl.to('.hero .clip-inner', { y: '0%', duration: 1.2, stagger: .15 }, .1);
  tl.to('#hero-eye', { opacity: 1, y: 0, duration: .7 }, .05);
  tl.to('#hero-stats', { opacity: 1, y: 0, duration: .8 }, .9);
  tl.to('.hero-ctas', { opacity: 1, y: 0, duration: .7 }, 1.05);
  tl.to('#scroll-cue', { opacity: 1, duration: .6 }, 1.3);

  /* Stat counters */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suf    = el.dataset.suffix  || '';
    gsap.to({ val: 0 }, {
      val: target, duration: 2, ease: 'power3.out', delay: 1,
      onUpdate(){ el.textContent = prefix + Math.round(this.targets()[0].val) + suf; }
    });
  });
}

function initScrollAnimations(){
  gsap.registerPlugin(ScrollTrigger);

  /* Nav scrolled state + section index */
  const nav  = document.getElementById('main-nav');
  const idx  = document.getElementById('nav-index');
  document.querySelectorAll('[data-section]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter:    () => { idx.textContent = sec.dataset.section; nav.classList.add('scrolled'); },
      onEnterBack:() => { idx.textContent = sec.dataset.section; },
    });
  });
  ScrollTrigger.create({ trigger: 'body', start: 'top -10px', onEnter: () => nav.classList.add('scrolled'), onLeaveBack: () => nav.classList.remove('scrolled') });

  /* Section heading clip reveals */
  document.querySelectorAll('.section .clip-inner, .footer-cta .clip-inner').forEach(el => {
    gsap.to(el, {
      y: '0%', duration: 1.1, ease: 'power4.out',
      scrollTrigger: { trigger: el.closest('.clip-wrap'), start: 'top 85%' }
    });
  });

  /* Work cards */
  gsap.from('.work-card', {
    opacity: 0, y: 50, duration: 1, ease: 'power3.out', stagger: .15,
    scrollTrigger: { trigger: '.work-grid', start: 'top 78%' }
  });

  /* Work card mouse glow */
  document.querySelectorAll('.work-card').forEach(p => {
    p.addEventListener('mousemove', e => {
      const r = p.getBoundingClientRect();
      p.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      p.style.setProperty('--my', (e.clientY - r.top)  + 'px');
    });
  });

  /* EXPERIENCE TIMELINE — rail fill + node activation */
  const railFill = document.getElementById('tl-rail-fill');
  const tlItems  = gsap.utils.toArray('.tl-item');
  if (railFill && tlItems.length){
    ScrollTrigger.create({
      trigger: '#timeline', start: 'top 60%', end: 'bottom 60%', scrub: .3,
      onUpdate: self => { railFill.style.height = (self.progress * 100) + '%'; }
    });
    tlItems.forEach(item => {
      gsap.from(item, {
        opacity: 0, x: -24, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 82%' }
      });
      ScrollTrigger.create({
        trigger: item, start: 'top 60%', end: 'bottom 60%',
        onEnter:     () => item.classList.add('is-active'),
        onEnterBack: () => item.classList.add('is-active'),
        onLeave:     () => item.classList.remove('is-active'),
        onLeaveBack: () => item.classList.remove('is-active'),
      });
    });
  }

  /* SKILLS — animated proficiency bars */
  document.querySelectorAll('.skill-bar-fill').forEach(bar => {
    gsap.to(bar, {
      width: bar.dataset.pct + '%', duration: 1.3, ease: 'power3.out',
      scrollTrigger: { trigger: bar, start: 'top 90%' }
    });
  });
  gsap.from('.skill-col', {
    opacity: 0, y: 30, duration: .9, ease: 'power3.out', stagger: .12,
    scrollTrigger: { trigger: '.skills-grid', start: 'top 80%' }
  });

  /* EDUCATION — stagger in */
  gsap.from('.edu-item', {
    opacity: 0, y: 20, duration: .8, ease: 'power3.out', stagger: .1,
    scrollTrigger: { trigger: '.edu-list', start: 'top 82%' }
  });

  /* TESTIMONIAL HORIZONTAL PIN */
  const outer = document.getElementById('testi-outer');
  const track = document.getElementById('testi-track');
  const prog  = document.getElementById('testi-prog');

  /* Set outer height so there's room to scroll through cards */
  const scrollDist = track.scrollWidth - track.parentElement.offsetWidth + 80;
  outer.style.height = (window.innerHeight + scrollDist) + 'px';

  gsap.to(track, {
    x: -scrollDist,
    ease: 'none',
    scrollTrigger: {
      trigger: outer,
      start: 'top top',
      end: () => '+=' + scrollDist,
      scrub: 1,
      pin: '.testi-sticky',
      onUpdate: self => { prog.style.width = (self.progress * 100) + '%'; }
    }
  });

  /* Links stagger */
  gsap.from('.link-row', {
    opacity: 0, x: -30, duration: .8, ease: 'power3.out', stagger: .1,
    scrollTrigger: { trigger: '.links-list', start: 'top 80%' }
  });

  /* Footer CTA */
  gsap.from('.fcta-inner', {
    opacity: 0, y: 40, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.footer-cta', start: 'top 82%' }
  });

  /* Hero content parallax */
  gsap.to('.hero-inner', {
    yPercent: 20, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

/* ─────────────────────────────────────────
   6b. EDUCATION ACCORDION
───────────────────────────────────────── */
(function(){
  document.querySelectorAll('.edu-item').forEach(item => {
    const trigger = item.querySelector('.edu-trigger');
    const panel   = item.querySelector('.edu-panel');
    const inner   = item.querySelector('.edu-panel-inner');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.edu-item.open').forEach(o => {
        if (o !== item){
          o.classList.remove('open');
          o.querySelector('.edu-trigger').setAttribute('aria-expanded','false');
          gsap.to(o.querySelector('.edu-panel'), { height: 0, duration: .5, ease: 'power3.inOut' });
        }
      });
      if (isOpen){
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded','false');
        gsap.to(panel, { height: 0, duration: .5, ease: 'power3.inOut' });
      } else {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded','true');
        gsap.to(panel, { height: inner.offsetHeight, duration: .5, ease: 'power3.inOut',
          onComplete(){ if (item.classList.contains('open')) panel.style.height = 'auto'; } });
      }
    });
  });
})();

/* ─────────────────────────────────────────
   6c. WORK CASE-STUDY OVERLAY
───────────────────────────────────────── */
(function(){
  const wmodal = initOverlay({ modalId: 'wmodal', backId: 'wmodal-back', closeId: 'wm-close' });
  if (!wmodal) return;
  const body = document.getElementById('wmodal-body');

  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => {
      const tpl = document.getElementById(card.getAttribute('data-target'));
      if (!tpl) return;
      body.innerHTML = '';
      body.appendChild(tpl.content.cloneNode(true));
      const title = body.querySelector('.wm-title');
      if (title) title.id = 'wm-title-live';
      wmodal.open(card);
    });
  });
})();

/* ─────────────────────────────────────────
   7. MAGNETIC BUTTONS
───────────────────────────────────────── */
(function(){
  if (!window.matchMedia('(hover:hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * .25;
      const y = (e.clientY - r.top  - r.height / 2) * .25;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ─────────────────────────────────────────
   8. PRIVACY MODAL
───────────────────────────────────────── */
(function(){
  const pmodal = initOverlay({ modalId: 'pmodal', backId: 'pmodal-back', closeId: 'pm-close' });
  if (!pmodal) return;
  const openB = document.getElementById('cbar-more');
  openB?.addEventListener('click', e => { e.preventDefault(); pmodal.open(openB); });
})();

/* ─────────────────────────────────────────
   9. COOKIE CONSENT + GA4
   Replace G-XXXXXXXXXX with your real ID.
───────────────────────────────────────── */
(function(){
  const GA  = 'G-XXXXXXXXXX';
  const KEY = 'analytics_consent';
  const bar = document.getElementById('cbar');
  if (!bar) return;

  function loadGA(){
    if (document.querySelector('script[src*="googletagmanager"]')) return;
    const s = document.createElement('script');
    s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${GA}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); } window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA, { anonymize_ip: true, storage: 'none', client_storage: 'none', allow_ad_personalization_signals: false });
  }
  function hide(){ bar.setAttribute('aria-hidden','true'); }

  const saved = localStorage.getItem(KEY);
  if (saved === 'accepted'){ hide(); loadGA(); }
  else if (saved === 'declined'){ hide(); }
  else { setTimeout(() => bar.classList.add('up'), 2000); }

  document.getElementById('cbar-ok').addEventListener('click',  () => { localStorage.setItem(KEY,'accepted'); hide(); loadGA(); });
  document.getElementById('cbar-no').addEventListener('click',  () => { localStorage.setItem(KEY,'declined'); hide(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && bar.classList.contains('up') && !document.getElementById('pmodal').classList.contains('open')){
      localStorage.setItem(KEY,'declined'); hide();
    }
  });
})();
