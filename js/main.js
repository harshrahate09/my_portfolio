/* ═══════════════════════════════════════════════════════════════════
   HARSH RAHATE PORTFOLIO — Main JS
   Loader · Cursor · Nav · Typewriter · Scroll Reveal · Counters
   Skills Tabs · Timeline Tabs · Form Validation
═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── HELPERS ────────────────────────────────────────────────────── */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ─── LOADER — SCRAMBLE REVEAL ───────────────────────────────────── */
(function initLoader() {
  const loader  = $('#loader');
  const line    = $('#loaderLine');
  const sub     = $('#loaderSub');

  const WORDS   = ['HARSH', 'RAHATE'];
  const IDS     = ['scrambleWord1', 'scrambleWord2'];

  // Characters to scramble through — alphanumeric + a few symbols for flair
  const POOL    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  const rand    = () => POOL[Math.floor(Math.random() * POOL.length)];

  // Build letter <span>s for each word
  const letterEls = WORDS.map((word, wi) => {
    const container = document.getElementById(IDS[wi]);
    return [...word].map(ch => {
      const span = document.createElement('span');
      span.className = 'loader-letter';
      span.textContent = rand();
      span.dataset.target = ch;
      container.appendChild(span);
      return span;
    });
  });

  // Flatten all letters with their staggered resolve time
  const allLetters = letterEls.flat();
  const totalLetters = allLetters.length;

  // Each letter resolves one by one, with a small random jitter
  const BASE_DELAY     = 80;   // ms between each letter resolving
  const SCRAMBLE_TICKS = 6;    // how many random frames before it locks
  const TICK_INTERVAL  = 50;   // ms per scramble frame

  let resolvedCount = 0;

  allLetters.forEach((span, i) => {
    const resolveAt = i * BASE_DELAY + Math.random() * 40;

    // Keep scrambling until it's time to resolve
    const scrambleTimer = setInterval(() => {
      if (!span.classList.contains('resolved')) {
        span.textContent = rand();
      }
    }, TICK_INTERVAL);

    setTimeout(() => {
      clearInterval(scrambleTimer);
      span.textContent = span.dataset.target;
      span.classList.add('resolved');
      resolvedCount++;

      if (resolvedCount === totalLetters) onAllResolved();
    }, resolveAt + SCRAMBLE_TICKS * TICK_INTERVAL);
  });

  function onAllResolved() {
    // 1. Grow the underline
    setTimeout(() => line.classList.add('grow'), 100);

    // 2. Fade in subtitle
    setTimeout(() => sub.classList.add('show'), 300);

    // 3. Dismiss loader and start the page
    setTimeout(() => {
      loader.classList.add('loaded');
      document.body.classList.add('loaded');
      $$('.hero .reveal').forEach(el => el.classList.add('revealed'));
    }, 1100);
  }
})();

/* ─── CUSTOM CURSOR ──────────────────────────────────────────────── */
(function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor   = $('#cursor');
  const follower = $('#cursorFollower');

  let mx = -100, my = -100;
  let fx = -100, fy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  (function animateCursor() {
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';

    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';

    requestAnimationFrame(animateCursor);
  })();

  /* Hover states */
  const hoverEls = 'a, button, .skill-card, .project-card, .contact-card, .timeline-card, .social-link, .tab-btn, .timeline-btn';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    }
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity   = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity   = '1';
    follower.style.opacity = '1';
  });
})();

/* ─── NAVBAR SCROLL ──────────────────────────────────────────────── */
(function initNav() {
  const nav = $('#navbar');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* Active link highlight */
  const sections = $$('section[id]');
  const links    = $$('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

/* ─── MOBILE MENU ────────────────────────────────────────────────── */
(function initMobileMenu() {
  const btn  = $('#hamburger');
  const menu = $('#mobileMenu');

  function toggle(open) {
    btn.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', () => toggle(!btn.classList.contains('open')));

  $$('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggle(false);
  });
})();

/* ─── TYPEWRITER ─────────────────────────────────────────────────── */
(function initTypewriter() {
  const el    = $('#typewriter');
  if (!el) return;

  const words  = [
    'web experiences.',
    'full-stack apps.',
    'clean interfaces.',
    'scalable APIs.',
    'pixel-perfect UIs.',
  ];

  let wIdx = 0, cIdx = 0, deleting = false;

  function tick() {
    const word    = words[wIdx];
    const display = deleting ? word.slice(0, cIdx--) : word.slice(0, cIdx++);
    el.textContent = display;

    let delay = deleting ? 55 : 100;

    if (!deleting && cIdx > word.length) {
      delay    = 1800;
      deleting = true;
    } else if (deleting && cIdx < 0) {
      deleting = false;
      cIdx     = 0;
      wIdx     = (wIdx + 1) % words.length;
      delay    = 400;
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 1200);
})();

/* ─── SCROLL REVEAL ──────────────────────────────────────────────── */
(function initReveal() {
  const revealEls = $$('.reveal');

  // Skip hero elements — handled by loader callback
  const nonHeroRevealEls = revealEls.filter(el => !el.closest('.hero'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  nonHeroRevealEls.forEach(el => observer.observe(el));
})();

/* ─── COUNTERS ───────────────────────────────────────────────────── */
(function initCounters() {
  const counters = $$('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1400;
      const step   = 16;
      const inc    = target / (dur / step);
      let current  = 0;

      const timer = setInterval(() => {
        current += inc;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current);
      }, step);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ─── SKILLS TABS ────────────────────────────────────────────────── */
(function initSkillsTabs() {
  const tabs   = $$('.tab-btn');
  const panels = $$('.tab-panel');

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabs.forEach(t => {
        t.classList.toggle('active', t === btn);
        t.setAttribute('aria-selected', String(t === btn));
      });

      panels.forEach(p => {
        const isActive = p.id === 'tab-' + target;
        p.classList.toggle('active', isActive);
        p.hidden = !isActive;

        if (isActive) {
          // Re-trigger skill bar + reveal for newly visible panel
          $$('.skill-card', p).forEach(card => {
            card.classList.remove('revealed');
            setTimeout(() => {
              card.classList.add('revealed');
              animateSkillBar(card);
            }, 50);
          });
        }
      });
    });
  });

  // Init skill bars for the default (first) active tab
  $$('.tab-panel.active .skill-card').forEach(card => {
    // wait for loader to finish
    setTimeout(() => animateSkillBar(card), 800);
  });
})();

function animateSkillBar(card) {
  const bar   = card.querySelector('.skill-bar');
  const level = card.dataset.level || 0;
  if (bar) bar.style.width = level + '%';
}

/* Watch skill cards entering view to animate bars */
(function watchSkillBars() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateSkillBar(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  $$('.skill-card').forEach(c => observer.observe(c));
})();

/* ─── TIMELINE TABS ──────────────────────────────────────────────── */
(function initTimelineTabs() {
  const btns = $$('.timeline-btn');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.timeline;

      btns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });

      $$('.timeline').forEach(tl => {
        const isActive = tl.id === 'timeline-' + target;
        tl.classList.toggle('hidden', !isActive);

        if (isActive) {
          $$('.timeline-item', tl).forEach((item, i) => {
            item.classList.remove('revealed');
            setTimeout(() => item.classList.add('revealed'), i * 120);
          });
        }
      });
    });
  });

  // Init first timeline
  $$('#timeline-experience .timeline-item').forEach((item, i) => {
    setTimeout(() => item.classList.add('revealed'), i * 150 + 600);
  });
})();

/* ─── CONTACT FORM ───────────────────────────────────────────────── */
(function initForm() {
  const form    = $('#contactForm');
  if (!form) return;

  const btn     = $('#submitBtn');
  const success = $('#formSuccess');

  function validate(field) {
    const errEl = field.nextElementSibling;
    let msg = '';

    if (!field.value.trim()) {
      msg = 'This field is required.';
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      msg = 'Enter a valid email address.';
    }

    if (msg) {
      field.classList.add('error');
      if (errEl) errEl.textContent = msg;
      return false;
    } else {
      field.classList.remove('error');
      if (errEl) errEl.textContent = '';
      return true;
    }
  }

  // Live validation
  $$('input, textarea', form).forEach(field => {
    field.addEventListener('blur', () => validate(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validate(field);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const fields = $$('input, textarea', form);
    const allValid = fields.map(validate).every(Boolean);
    if (!allValid) return;

    btn.classList.add('loading');
    btn.disabled = true;

    // Simulate async send (replace with real fetch/emailjs/formspree)
    await new Promise(r => setTimeout(r, 1800));

    btn.classList.remove('loading');
    btn.disabled = false;
    form.reset();
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => { success.hidden = true; }, 6000);
  });
})();

/* ─── PROJECT CARD TILT (mouse glow) ─────────────────────────────── */
(function initCardGlow() {
  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const mx   = ((e.clientX - rect.left) / rect.width)  * 100;
      const my   = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });
})();

/* ─── FOOTER YEAR ─────────────────────────────────────────────────── */
(function () {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ─── SMOOTH ANCHOR SCROLL ───────────────────────────────────────── */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    const offset = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '70',
      10
    );
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ─── KEYBOARD ACCESSIBILITY ─────────────────────────────────────── */
(function initA11y() {
  // Make skill/project cards keyboard-focusable when they have interactive children
  $$('.skill-card').forEach(card => {
    card.setAttribute('tabindex', '0');
  });
})();
