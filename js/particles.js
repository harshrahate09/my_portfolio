/* ═══════════════════════════════════════════════════════════════════
   PARTICLE SYSTEM — Canvas-based floating particles
═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas  = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx     = canvas.getContext('2d');
  let W, H, raf;
  let particles = [];
  let mouse     = { x: -9999, y: -9999 };

  const CONFIG = {
    count:        70,
    maxRadius:    2.2,
    minRadius:    0.5,
    speed:        0.35,
    connectionDist: 130,
    mouseRadius:  120,
    colors: ['#6366f1', '#06b6d4', '#a78bfa', '#f472b6'],
  };

  /* ── Resize ── */
  function resize() {
    const dpr   = window.devicePixelRatio || 1;
    const rect  = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }

  /* ── Particle factory ── */
  function createParticle() {
    const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    return {
      x:   Math.random() * W,
      y:   Math.random() * H,
      vx:  (Math.random() - 0.5) * CONFIG.speed,
      vy:  (Math.random() - 0.5) * CONFIG.speed,
      r:   CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
      color,
      alpha: 0.3 + Math.random() * 0.5,
    };
  }

  function init() {
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  /* ── Draw ── */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      /* Mouse repulsion */
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < CONFIG.mouseRadius && dist > 0) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius * 0.03;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      /* Speed cap */
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > CONFIG.speed * 3) {
        p.vx = (p.vx / speed) * CONFIG.speed * 3;
        p.vy = (p.vy / speed) * CONFIG.speed * 3;
      }

      /* Drift back to base speed */
      const decay = 0.98;
      p.vx *= decay;
      p.vy *= decay;
      if (Math.abs(p.vx) < 0.02) p.vx = (Math.random() - 0.5) * CONFIG.speed;
      if (Math.abs(p.vy) < 0.02) p.vy = (Math.random() - 0.5) * CONFIG.speed;

      /* Update position */
      p.x += p.vx;
      p.y += p.vy;

      /* Wrap edges */
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      /* Draw particle */
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();

      /* Draw connections */
      for (let j = i + 1; j < particles.length; j++) {
        const q    = particles[j];
        const cdx  = p.x - q.x;
        const cdy  = p.y - q.y;
        const cdist = Math.hypot(cdx, cdy);

        if (cdist < CONFIG.connectionDist) {
          const alpha = (1 - cdist / CONFIG.connectionDist) * 0.18;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  /* ── Events ── */
  const hero = canvas.parentElement;
  hero.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(raf);
      resize();
      draw();
    }, 150);
  });

  /* ── Init ── */
  resize();
  init();
  draw();
})();
