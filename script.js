/* ═══════════════════════════════════════════════════════════
   MARCO LORENZ · PORTFOLIO v2.6 — script.js
   All interactivity: cursor, loader, canvas, GSAP, games,
   terminal, tilt, Konami, typewriter, easter egg
═══════════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────── GSAP SETUP
const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────── CUSTOM CURSOR
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function animateCursorRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateCursorRing);
})();

document.querySelectorAll('a, button, .tilt-card, .c-chip, .proj-card, .earlier-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ─────────────────────────────── LOADING SCREEN
(function initLoader() {
  const bar    = document.getElementById('loaderBar');
  const status = document.getElementById('loaderStatus');
  const pct    = document.getElementById('loaderPct');
  const loader = document.getElementById('loader');

  const steps = [
    'Loading hero assets...',
    'Initializing particle engine...',
    'Compiling skill tree...',
    'Rendering project missions...',
    'Calibrating terminal...',
    'All systems go ✓',
  ];

  let progress = 0;
  let stepIdx  = 0;

  const canvas = document.getElementById('loaderCanvas');
  const ctx    = canvas.getContext('2d');
  let loaderParticles = [];

  function resizeLoaderCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeLoaderCanvas();

  for (let i = 0; i < 80; i++) {
    loaderParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    });
  }

  function drawLoaderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    loaderParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,240,255,${p.alpha})`;
      ctx.fill();
    });
    if (!loader.classList.contains('fade-out')) {
      requestAnimationFrame(drawLoaderParticles);
    }
  }
  drawLoaderParticles();

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) progress = 100;

    const stepProgress = Math.floor((progress / 100) * steps.length);
    if (stepProgress < steps.length && stepProgress > stepIdx) {
      stepIdx = stepProgress;
      status.textContent = steps[stepIdx] || steps[steps.length - 1];
    }

    bar.style.width = progress + '%';
    pct.textContent  = Math.floor(progress) + '%';

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('fade-out');
        initHeroCanvas();
        initTypewriter();
        initScrollAnimations();
        initGameCanvas();
        initRunnerCanvas();
        initTerminal();
        initProjectTilt();
        initEarlierToggle();
        initNavScroll();
        initContactForm();
      }, 400);
    }
  }, 120);
})();

// ─────────────────────────────── HERO CANVAS – PARTICLES + GRID
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 130;
  let particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 0.5,
    });
  }

  // Mouse-repel
  let mx = canvas.width / 2, my = canvas.height / 2;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });

  function drawGrid() {
    const cols = 24, rows = 16;
    const cw = canvas.width / cols;
    const ch = canvas.height / rows;
    ctx.strokeStyle = 'rgba(0,240,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cw, 0);
      ctx.lineTo(x * cw, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * ch);
      ctx.lineTo(canvas.width, y * ch);
      ctx.stroke();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const grad = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.4, 0,
      canvas.width * 0.5, canvas.height * 0.4, canvas.width * 0.6
    );
    grad.addColorStop(0, 'rgba(0,20,40,0.6)');
    grad.addColorStop(1, 'rgba(4,4,10,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          const alpha = (1 - d / CONNECTION_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Particles
    particles.forEach(p => {
      // Mouse repel
      const dx = p.x - mx, dy = p.y - my;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        p.vx += (dx / d) * 0.04;
        p.vy += (dy / d) * 0.04;
      }
      // Speed clamp
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > 1.5) { p.vx *= 0.95; p.vy *= 0.95; }

      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      grd.addColorStop(0, 'rgba(0,240,255,0.9)');
      grd.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ─────────────────────────────── TYPEWRITER EFFECT
function initTypewriter() {
  const el    = document.getElementById('heroTypewriter');
  const words = [
    'Frontend Developer',
    'UI Craftsman',
    'Code Alchemist',
    'Digital Experience Builder',
    'Creative Technologist',
  ];
  let wi = 0, ci = 0, isDeleting = false;
  const SPEED_TYPE = 70, SPEED_DEL = 35, PAUSE = 2000;

  function type() {
    const word    = words[wi];
    const current = isDeleting ? word.slice(0, ci - 1) : word.slice(0, ci + 1);
    el.textContent = current;
    isDeleting ? ci-- : ci++;

    let delay = isDeleting ? SPEED_DEL : SPEED_TYPE;

    if (!isDeleting && ci === word.length) {
      delay = PAUSE;
      isDeleting = true;
    } else if (isDeleting && ci === 0) {
      isDeleting = false;
      wi = (wi + 1) % words.length;
      delay = 300;
    }
    setTimeout(type, delay);
  }
  setTimeout(type, 1200);
}

// ─────────────────────────────── PRESS START
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('pressStart');
  if (btn) {
    btn.addEventListener('click', () => {
      document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
      gsap.to('#hero', { opacity: 0.7, duration: 0.3, yoyo: true, repeat: 1 });
    });
  }
});

// ─────────────────────────────── GSAP SCROLL ANIMATIONS
function initScrollAnimations() {
  if (!hasGSAP) {
    // Fallback: animate all bars immediately
    document.querySelectorAll('.sb-fill').forEach(el => {
      setTimeout(() => { el.style.width = (el.dataset.pct || '80') + '%'; }, 400);
    });
    document.querySelectorAll('.sci-fill').forEach(el => {
      const pct = el.closest('.sc-item')?.dataset.pct || '80';
      setTimeout(() => { el.style.width = pct + '%'; el.closest('.sc-item')?.classList.add('revealed'); }, 500);
    });
    document.querySelectorAll('.tl-item').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }
  // About stat bars
  document.querySelectorAll('.sb-fill').forEach(bar => {
    const pct = bar.dataset.pct;
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 90%',
      onEnter: () => gsap.to(bar, { width: pct + '%', duration: 1.2, ease: 'power2.out' }),
    });
  });

  // Skill bars
  document.querySelectorAll('.sci-fill').forEach(bar => {
    const pct = bar.closest('.sc-item').dataset.pct;
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 95%',
      onEnter: () => {
        bar.closest('.sc-item').classList.add('revealed');
        gsap.to(bar, { width: pct + '%', duration: 1.0, ease: 'power2.out', delay: 0.1 });
      },
    });
  });

  // Skill categories stagger
  gsap.utils.toArray('.skill-cat').forEach((cat, i) => {
    gsap.from(cat, {
      scrollTrigger: { trigger: cat, start: 'top 90%' },
      opacity: 0, y: 40, duration: 0.6, delay: i * 0.1, ease: 'power2.out',
    });
  });

  // Project cards stagger
  gsap.utils.toArray('.proj-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 92%' },
      opacity: 0, y: 50, duration: 0.6, delay: i * 0.08, ease: 'power2.out',
    });
  });

  // Timeline items
  document.querySelectorAll('.tl-item').forEach((item, i) => {
    const fromLeft = item.classList.contains('tl-left');
    ScrollTrigger.create({
      trigger: item,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(item, {
          opacity: 1, y: 0, x: 0,
          duration: 0.7, ease: 'power3.out', delay: i * 0.05,
        });
      },
    });
    gsap.set(item, { x: fromLeft ? -30 : 30 });
  });

  // Section headers
  gsap.utils.toArray('.section-title').forEach(t => {
    gsap.from(t, {
      scrollTrigger: { trigger: t, start: 'top 88%' },
      opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
    });
  });

  // Player card
  gsap.from('.player-card', {
    scrollTrigger: { trigger: '.player-card', start: 'top 85%' },
    opacity: 0, x: -50, duration: 0.8, ease: 'power3.out',
  });
  gsap.from('.about-right', {
    scrollTrigger: { trigger: '.about-right', start: 'top 85%' },
    opacity: 0, x: 50, duration: 0.8, ease: 'power3.out',
  });
}

// ─────────────────────────────── MINI GAME CANVAS (Skills runner)
function initGameCanvas() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const SCALE = window.devicePixelRatio || 1;
  canvas.width  = canvas.offsetWidth  * SCALE;
  canvas.height = canvas.offsetHeight * SCALE;
  ctx.scale(SCALE, SCALE);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;

  let score = 0;
  let groundY = H * 0.78;
  let scrollX = 0;

  // Character
  const char = {
    x: 60, y: groundY,
    vy: 0, onGround: true,
    frame: 0, frameTimer: 0,
  };

  const SKILLS = [
    'JS','React','CSS','Next.js',
    'Node','MySQL','Git','Docker',
    'UI','GSAP','Python','WordPress',
  ];
  let blocks = [];
  let blockTimer = 0;
  const BLOCK_INTERVAL = 110;

  function spawnBlock() {
    const skill = SKILLS[Math.floor(Math.random() * SKILLS.length)];
    blocks.push({ x: W + 60, y: groundY - 30, w: 50, h: 30, label: skill, hit: false });
  }

  // Stars
  const stars = Array.from({length: 50}, () => ({
    x: Math.random() * W * 3,
    y: Math.random() * groundY * 0.8,
    r: Math.random() * 1.2 + 0.3,
    blink: Math.random() * Math.PI * 2,
  }));

  // Pixel mountains
  const mountains = Array.from({length: 8}, (_, i) => ({
    x: i * 150 + Math.random() * 50,
    h: Math.random() * 40 + 20,
    w: Math.random() * 60 + 40,
  }));

  let frameCount = 0;

  function drawChar(x, y, frame) {
    const px = Math.floor(x), py = Math.floor(y);
    ctx.fillStyle = '#00f0ff';
    // Body
    ctx.fillRect(px - 5, py - 28, 10, 14);
    // Head
    ctx.fillRect(px - 4, py - 38, 8, 8);
    // Eye
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(px + 1, py - 35, 2, 2);
    // Legs (animated)
    ctx.fillStyle = '#00f0ff';
    if (frame < 4) {
      ctx.fillRect(px - 4, py - 14, 4, 10);
      ctx.fillRect(px + 1, py - 10, 3, 10);
    } else {
      ctx.fillRect(px - 4, py - 10, 4, 10);
      ctx.fillRect(px + 1, py - 14, 3, 10);
    }
    // Arms
    if (frame < 4) {
      ctx.fillRect(px - 9, py - 26, 4, 3);
      ctx.fillRect(px + 5, py - 22, 4, 3);
    } else {
      ctx.fillRect(px - 9, py - 22, 4, 3);
      ctx.fillRect(px + 5, py - 26, 4, 3);
    }
  }

  function update() {
    frameCount++;
    scrollX += 2;

    // Character animation
    char.frameTimer++;
    if (char.frameTimer > 6) { char.frameTimer = 0; char.frame = (char.frame + 1) % 8; }

    // Auto jump over blocks
    blocks.forEach(b => {
      if (!b.hit && char.x < b.x && char.x + 80 > b.x && char.onGround) {
        char.vy = -9;
        char.onGround = false;
      }
    });

    // Gravity
    char.vy += 0.45;
    char.y += char.vy;
    if (char.y >= groundY) { char.y = groundY; char.vy = 0; char.onGround = true; }

    // Block movement
    blockTimer++;
    if (blockTimer > BLOCK_INTERVAL) { spawnBlock(); blockTimer = 0; }
    blocks.forEach(b => {
      b.x -= 2;
      if (!b.hit && char.x + 5 > b.x && char.x - 5 < b.x + b.w && char.y - 30 < b.y + b.h) {
        b.hit = true;
        score += 10;
        const el = document.getElementById('gameScore');
        if (el) el.textContent = score;
      }
    });
    blocks = blocks.filter(b => b.x > -80);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#010108');
    skyGrad.addColorStop(1, '#050520');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, groundY);

    // Stars
    stars.forEach(s => {
      s.blink += 0.02;
      const a = 0.3 + 0.3 * Math.sin(s.blink);
      ctx.beginPath();
      const sx = ((s.x - scrollX * 0.1) % (W + 10) + W + 10) % (W + 10);
      ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${a})`;
      ctx.fill();
    });

    // Mountains
    mountains.forEach(m => {
      const mx = ((m.x - scrollX * 0.3) % (W + m.w + 20) + W + m.w + 20) % (W + m.w + 20);
      ctx.fillStyle = 'rgba(0,240,255,0.06)';
      ctx.beginPath();
      ctx.moveTo(mx, groundY);
      ctx.lineTo(mx + m.w / 2, groundY - m.h);
      ctx.lineTo(mx + m.w, groundY);
      ctx.fill();
    });

    // Ground
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    groundGrad.addColorStop(0, 'rgba(0,240,255,0.15)');
    groundGrad.addColorStop(1, 'rgba(0,20,40,0.8)');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Ground line
    ctx.strokeStyle = 'rgba(0,240,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 1);
    ctx.lineTo(W, groundY + 1);
    ctx.stroke();

    // Grid on ground
    for (let i = 0; i < 12; i++) {
      const lx = ((i * 80 - scrollX) % W + W) % W;
      ctx.strokeStyle = 'rgba(0,240,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(lx, groundY);
      ctx.lineTo(lx, H);
      ctx.stroke();
    }

    // Blocks
    blocks.forEach(b => {
      const col = b.hit ? 'rgba(48,255,128,0.9)' : 'rgba(0,240,255,0.8)';
      ctx.fillStyle = b.hit ? 'rgba(48,255,128,0.15)' : 'rgba(0,240,255,0.1)';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = col;
      ctx.font = `bold 9px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 3.5);
      // Glow on hit
      if (b.hit) {
        ctx.shadowColor = 'rgba(48,255,128,0.6)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = 'rgba(48,255,128,0.9)';
        ctx.strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
        ctx.shadowBlur = 0;
      }
    });

    // Character
    ctx.shadowBlur = 0;
    drawChar(char.x, char.y, char.frame);

    // Character glow
    ctx.shadowColor = 'rgba(0,240,255,0.6)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(0,240,255,0.05)';
    ctx.beginPath();
    ctx.ellipse(char.x, groundY + 2, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    update();
    requestAnimationFrame(draw);
  }

  draw();

  // Space/click to jump manually too
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && char.onGround) {
      char.vy = -9;
      char.onGround = false;
      e.preventDefault();
    }
  });
  canvas.addEventListener('click', () => {
    if (char.onGround) { char.vy = -9; char.onGround = false; }
  });
}

// ─────────────────────────────── RUNNER CANVAS (Experience timeline)
function initRunnerCanvas() {
  const canvas = document.getElementById('runnerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const SCALE = window.devicePixelRatio || 1;
  canvas.width  = canvas.offsetWidth  * SCALE;
  canvas.height = canvas.offsetHeight * SCALE;
  ctx.scale(SCALE, SCALE);
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;

  const groundY = H * 0.72;
  let scrollX = 0;
  let charX = 0;
  let frameC = 0;
  let frame = 0;
  let frameT = 0;

  const CHECKPOINTS = [
    { label: '2022', sub: 'e-hoi GmbH', color: '#00f0ff' },
    { label: '2023', sub: 'Tierheim 🐾', color: '#bf5fff' },
    { label: '2024', sub: 'IHK ✓',      color: '#00f0ff' },
    { label: 'NOW',  sub: 'Open ⚡',    color: '#30ff80' },
  ];

  const spacing = W / (CHECKPOINTS.length + 1);
  const flags = CHECKPOINTS.map((cp, i) => ({
    ...cp,
    x: spacing * (i + 1),
    reached: false,
  }));

  function drawSmallChar(x, y, f) {
    const px = Math.floor(x), py = Math.floor(y);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(px - 4, py - 24, 8, 12);
    ctx.fillRect(px - 3, py - 32, 6, 7);
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(px + 1, py - 29, 2, 2);
    ctx.fillStyle = '#00f0ff';
    if (f < 4) {
      ctx.fillRect(px - 3, py - 12, 3, 8);
      ctx.fillRect(px + 1, py - 9, 2, 8);
    } else {
      ctx.fillRect(px - 3, py - 9, 3, 8);
      ctx.fillRect(px + 1, py - 12, 2, 8);
    }
  }

  function draw() {
    frameC++;
    ctx.clearRect(0, 0, W, H);

    // BG
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);

    // Sky gradient
    const sg = ctx.createLinearGradient(0, 0, 0, groundY);
    sg.addColorStop(0, '#010108');
    sg.addColorStop(1, '#050520');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, groundY);

    // Small stars
    ctx.fillStyle = 'rgba(200,220,255,0.3)';
    for (let s = 0; s < 30; s++) {
      const sx = (s * 73 + 17) % W;
      const sy = (s * 37 + 11) % (groundY * 0.8);
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Ground
    ctx.fillStyle = 'rgba(0,240,255,0.08)';
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = 'rgba(0,240,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, groundY); ctx.lineTo(W, groundY);
    ctx.stroke();

    // Path line
    ctx.strokeStyle = 'rgba(0,240,255,0.15)';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY - 2); ctx.lineTo(W, groundY - 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Checkpoints/flags
    flags.forEach(flag => {
      const fx = flag.x;
      const col = flag.reached ? flag.color : 'rgba(100,100,140,0.6)';

      // Flag pole
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx, groundY); ctx.lineTo(fx, groundY - 55);
      ctx.stroke();

      // Flag
      ctx.fillStyle = flag.reached ? flag.color : 'rgba(80,80,110,0.5)';
      ctx.beginPath();
      ctx.moveTo(fx, groundY - 55);
      ctx.lineTo(fx + 22, groundY - 47);
      ctx.lineTo(fx, groundY - 39);
      ctx.fill();

      // Year label
      ctx.fillStyle = col;
      ctx.font = `bold 10px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(flag.label, fx, groundY - 62);

      // Sub label
      ctx.fillStyle = flag.reached ? 'rgba(255,255,255,0.7)' : 'rgba(100,100,140,0.5)';
      ctx.font = `9px "JetBrains Mono", monospace`;
      ctx.fillText(flag.sub, fx, groundY + 14);

      // Glow on reached
      if (flag.reached) {
        ctx.shadowColor = flag.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = flag.color + '22';
        ctx.fillRect(fx - 15, groundY - 58, 30, 60);
        ctx.shadowBlur = 0;
      }
    });

    // Scroll char
    charX += 0.8;
    if (charX > W + 40) charX = -20;

    frameT++;
    if (frameT > 6) { frameT = 0; frame = (frame + 1) % 8; }

    // Check flag reaches
    flags.forEach(flag => {
      if (!flag.reached && charX >= flag.x - 10) flag.reached = true;
    });

    // Draw char
    ctx.shadowBlur = 0;
    drawSmallChar(charX, groundY, frame);

    // Char shadow
    ctx.shadowColor = 'rgba(0,240,255,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = 'rgba(0,240,255,0.04)';
    ctx.beginPath();
    ctx.ellipse(charX, groundY + 2, 10, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    requestAnimationFrame(draw);
  }

  draw();
}

// ─────────────────────────────── 3D TILT CARDS
function initProjectTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) scale(1.03)`;
      card.style.boxShadow = `${-x * 20}px ${-y * 20}px 40px rgba(0,240,255,0.1)`;

      // Highlight follow
      const glow = card.querySelector('.proj-vis-glow, .card-glow-corner');
      if (glow) {
        glow.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      const glow = card.querySelector('.proj-vis-glow, .card-glow-corner');
      if (glow) glow.style.transform = '';
    });
  });
}

// ─────────────────────────────── TERMINAL ANIMATION (Contact)
function initTerminal() {
  const body = document.getElementById('termBody');
  if (!body) return;

  const lines = [
    { text: '> Connecting to marco@dev-marco.de...', delay: 0,    type: 'cmd' },
    { text: '> Connection established ✓',            delay: 800,  type: 'ok'  },
    { text: '',                                       delay: 1200, type: 'blank' },
    { text: '> PLAYER:   Marco Lorenz',               delay: 1600, type: 'info' },
    { text: '> CLASS:    Frontend Developer',          delay: 2000, type: 'info' },
    { text: '> RANK:     IHK Fachinformatiker AE',    delay: 2400, type: 'info' },
    { text: '> ZONE:     Rodgau, Deutschland',         delay: 2800, type: 'info' },
    { text: '> STATUS:   OPEN FOR PROJECTS ⚡',       delay: 3200, type: 'ok'  },
    { text: '',                                       delay: 3600, type: 'blank' },
    { text: '> CONTACT_METHODS:',                    delay: 4000, type: 'cmd' },
    { text: '>   [1] kontakt@dev-marco.de',           delay: 4400, type: 'val' },
    { text: '>   [2] GitHub  · /dev-marco',           delay: 4800, type: 'val' },
    { text: '>   [3] LinkedIn · /in/marco-lorenz',    delay: 5200, type: 'val' },
    { text: '',                                       delay: 5600, type: 'blank' },
    { text: '> Type your message below...',           delay: 6000, type: 'cmd' },
    { text: '> _',                                    delay: 6400, type: 'cursor' },
  ];

  let triggered = false;

  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top 75%',
    onEnter: () => {
      if (triggered) return;
      triggered = true;

      lines.forEach(line => {
        setTimeout(() => {
          if (line.type === 'blank') {
            body.insertAdjacentHTML('beforeend', '<br>');
            return;
          }
          if (line.type === 'cursor') {
            body.insertAdjacentHTML('beforeend',
              `<span class="term-line"><span class="tp">&gt;</span> <span class="term-cursor"></span></span><br>`);
            return;
          }

          const colors = {
            cmd:  'rgba(0,240,255,0.9)',
            ok:   'rgba(48,255,128,0.9)',
            info: 'rgba(232,232,244,0.8)',
            val:  'rgba(230,219,116,0.8)',
          };
          const color = colors[line.type] || 'rgba(232,232,244,0.8)';
          body.insertAdjacentHTML('beforeend',
            `<span class="term-line" style="color:${color}">${escHtml(line.text)}</span><br>`);
          body.scrollTop = body.scrollHeight;
        }, line.delay);
      });
    },
  });
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─────────────────────────────── EARLIER TOGGLE
function initEarlierToggle() {
  const btn  = document.getElementById('earlierBtn');
  const list = document.getElementById('earlierList');
  if (!btn || !list) return;

  btn.addEventListener('click', () => {
    const open = list.classList.toggle('visible');
    btn.classList.toggle('open', open);
    if (open) {
      gsap.from(list.children, { opacity: 0, y: 10, stagger: 0.07, duration: 0.35, ease: 'power2.out' });
    }
  });
}

// ─────────────────────────────── NAV SCROLL
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  const links = document.querySelectorAll('.nl');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);

    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
}

// ─────────────────────────────── CONTACT FORM
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('cfSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.textContent = 'SENDING...';
    btn.disabled = true;

    // Simulate send (no actual backend)
    setTimeout(() => {
      form.reset();
      btn.textContent = 'SEND_MESSAGE()';
      btn.disabled = false;
      if (success) { success.hidden = false; }
      setTimeout(() => { if (success) success.hidden = true; }, 5000);
    }, 1200);
  });
}

// ─────────────────────────────── KONAMI CODE + EASTER EGG
(function initKonami() {
  const CODE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;

  document.addEventListener('keydown', e => {
    if (e.key === CODE[idx]) {
      idx++;
      if (idx === CODE.length) {
        activateEasterEgg();
        idx = 0;
      }
    } else {
      idx = (e.key === CODE[0]) ? 1 : 0;
    }
  });

  const overlay = document.getElementById('easterOverlay');
  const closeBtn = document.getElementById('easterClose');
  const canvas   = document.getElementById('easterCanvas');

  function activateEasterEgg() {
    overlay.classList.add('active');
    startEasterCanvas(canvas);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  }
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
})();

function startEasterCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  const particles = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height + 20,
    vx: (Math.random() - 0.5) * 4,
    vy: -(Math.random() * 6 + 3),
    r: Math.random() * 5 + 2,
    color: ['#00f0ff','#bf5fff','#30ff80','#ff0090','#ffbd2e'][Math.floor(Math.random() * 5)],
    alpha: 1,
    decay: Math.random() * 0.012 + 0.006,
    gravity: Math.random() * 0.15 + 0.05,
  }));

  let frame = 0;
  const overlay = document.getElementById('easterOverlay');

  function draw() {
    if (!overlay.classList.contains('active')) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frame++;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        p.x = Math.random() * canvas.width;
        p.y = canvas.height + 20;
        p.vx = (Math.random() - 0.5) * 4;
        p.vy = -(Math.random() * 6 + 3);
        p.alpha = 1;
        p.color = ['#00f0ff','#bf5fff','#30ff80','#ff0090','#ffbd2e'][Math.floor(Math.random() * 5)];
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2,'0');
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ─────────────────────────────── FLOATING CODE BACKGROUND (subtle)
(function initFloatingCode() {
  const SNIPPETS = [
    '<div class="creativity++">',
    'const ui = build(vision);',
    'git commit -m "🚀 ship it"',
    'transform: perspective(1000px)',
    'addEventListener("passion")',
    'return <Experience />;',
    '// TODO: sleep()',
    'SELECT * FROM skills;',
    '.animate({opacity: 1})',
    'docker run -d magic',
    '@keyframes awesome {}',
    'npm run deploy',
  ];

  const wrap = document.createElement('div');
  wrap.className = 'floating-code';
  document.body.insertBefore(wrap, document.body.firstChild);

  SNIPPETS.forEach((snippet, i) => {
    const el = document.createElement('span');
    el.className = 'fc-line';
    el.textContent = snippet;
    el.style.left = (Math.random() * 90 + 2) + 'vw';
    el.style.animationDuration = (Math.random() * 20 + 25) + 's';
    el.style.animationDelay = (Math.random() * 30) + 's';
    el.style.opacity = (Math.random() * 0.03 + 0.01).toString();
    wrap.appendChild(el);
  });
})();

// ─────────────────────────────── SFX BUTTON (visual toggle)
(function initSfx() {
  const btn = document.getElementById('sfxBtn');
  if (!btn) return;
  btn.addEventListener('click', () => btn.classList.toggle('active'));
})();

// ─────────────────────────────── SMOOTH ANCHOR SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
