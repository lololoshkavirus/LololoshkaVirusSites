/* ============================================================
   LOLOLOSHKAVIRUSTM™ — Full Application Script (FX EDITION)
   Vanilla ES6+ · Hash Router · Config-driven · Heavy Effects
   ============================================================ */

(() => {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const FALLBACK = {
    site: {
      siteName: 'LOLOLOSHKAVIRUSTM™',
      teamName: 'LOLOLOSHKAVIRUSTM',
      description: 'Технологическая команда: разработка ПО, кибербезопасность, Android, Windows, Linux-дистрибутивы и open source.',
      copyright: '© 2026 LOLOLOSHKAVIRUSTM™. Все права защищены.',
      canonicalBaseUrl: 'https://lololoshkavirus.github.io',
      year: 2026,
      ogImage: ''
    },
    projects: {
      projects: [
        {
          id: 'lv_flash', name: 'LV Flash', logo: 'LV',
          description: 'Фирменная утилита для работы с прошивками Android-устройств.',
          category: 'Android Tools', platforms: ['Android'],
          version: '', status: 'coming_soon', mirrorsKey: 'lv_flash', links: []
        }
      ]
    },
    mirrors: {
      lv_flash: {
        mirrors: [
          { name: 'GitHub', url: 'https://github.com/lololoshkavirus', status: 'active', type: 'repository' },
          { name: 'Mirror 2', url: '', status: 'coming_soon', type: 'download' },
          { name: 'Mirror 3', url: '', status: 'coming_soon', type: 'download' }
        ]
      }
    },
    contacts: {
      telegram: 'https://t.me/LololoshkaVirusTM',
      github: 'https://github.com/lololoshkavirus/lololoshkavirus.github.io',
      email: 'lololoshkavirus@gmail.com'
    }
  };

  const CONFIG_PATHS = {
    site: 'config/site.json',
    projects: 'config/projects.json',
    mirrors: 'config/mirrors.json',
    contacts: 'config/contacts.json'
  };

  const state = {
    config: {
      site: FALLBACK.site,
      projects: FALLBACK.projects,
      mirrors: FALLBACK.mirrors,
      contacts: FALLBACK.contacts
    },
    ready: false,
    route: '/'
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function isValidHttpUrl(url) {
    if (typeof url !== 'string' || !url) return false;
    try { const u = new URL(url); return u.protocol === 'https:' || u.protocol === 'http:'; }
    catch { return false; }
  }

  function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('timeout')), ms);
      promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
    });
  }

  async function fetchJSON(path) {
    const res = await withTimeout(fetch(path, { cache: 'no-cache' }), 6000);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  async function loadConfigs() {
    const tasks = Object.entries(CONFIG_PATHS).map(async ([key, path]) => {
      try {
        const data = await fetchJSON(path);
        if (data && typeof data === 'object') state.config[key] = data;
      } catch { /* fallback */ }
    });
    await Promise.all(tasks);
    state.ready = true;
  }

  /* ============================================================
     FX: Notifications
     ============================================================ */
  const Notify = {
    host: null,
    init() { this.host = $('#snackbar-host'); },
    show(message, kind = 'info', duration = 2400) {
      if (!this.host) return;
      const node = el('div', { class: 'snackbar', dataset: { kind } }, [
        el('span', { class: 'snackbar__dot', 'aria-hidden': 'true' }),
        el('span', { text: String(message) })
      ]);
      this.host.appendChild(node);
      requestAnimationFrame(() => node.dataset.show = 'true');
      setTimeout(() => {
        node.dataset.show = 'false';
        setTimeout(() => node.remove(), 260);
      }, duration);
    }
  };

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); document.body.removeChild(ta);
      return ok;
    } catch { return false; }
  }

  /* ============================================================
     FX: Theme
     ============================================================ */
  const Theme = {
    init() {
      const toggle = $('#theme-toggle');
      if (toggle) toggle.addEventListener('click', () => this.toggle());
      const stored = localStorage.getItem('lv-theme');
      if (!stored) {
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        document.documentElement.setAttribute('data-theme', mq.matches ? 'light' : 'dark');
        mq.addEventListener?.('change', e => {
          if (!localStorage.getItem('lv-theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'light' : 'dark');
          }
        });
      }
    },
    toggle() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('lv-theme', next);
      document.body.animate(
        [{ filter: 'brightness(1.3)' }, { filter: 'brightness(1)' }],
        { duration: 260, easing: 'ease-out' }
      );
    }
  };

  /* ============================================================
     FX: Custom cursor + trail
     ============================================================ */
  const Cursor = {
    x: 0, y: 0, tx: 0, ty: 0,
    ring: null, dot: null, raf: null,
    init() {
      if (TOUCH || REDUCED) {
        $('#fx-cursor')?.remove();
        $('#fx-cursor-ring')?.remove();
        return;
      }
      this.dot = $('#fx-cursor');
      this.ring = $('#fx-cursor-ring');
      if (!this.dot || !this.ring) return;

      window.addEventListener('mousemove', e => {
        this.tx = e.clientX; this.ty = e.clientY;
        this.dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }, { passive: true });

      this.loop();

      // Hover state on interactive elements
      const hoverables = 'a, button, [data-tilt], [data-magnetic], .chip, .contact-card';
      document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverables)) document.body.dataset.cursor = 'hover';
        else if (e.target.closest('input, textarea')) document.body.dataset.cursor = 'text';
        else document.body.dataset.cursor = '';
      });
    },
    loop() {
      const speed = 0.18;
      this.x += (this.tx - this.x) * speed;
      this.y += (this.ty - this.y) * speed;
      if (this.ring) this.ring.style.transform = `translate(${this.x}px, ${this.y}px) translate(-50%, -50%)`;
      this.raf = requestAnimationFrame(() => this.loop());
    }
  };

  /* ============================================================
     FX: Scroll progress bar
     ============================================================ */
  const Progress = {
    init() {
      const bar = $('#scroll-progress');
      if (!bar) return;
      const onScroll = () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
        bar.style.width = pct + '%';
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  };

  /* ============================================================
     FX: Mesh gradient background
     ============================================================ */
  function initMesh() {
    const canvas = $('#fx-mesh');
    if (!canvas || REDUCED) { canvas?.remove(); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const blobs = [
      { x: 0.2, y: 0.3, r: 0.45, c: [167,139,250], vx: 0.0003, vy: 0.0002 },
      { x: 0.8, y: 0.2, r: 0.5, c: [103,232,249], vx: -0.0002, vy: 0.0003 },
      { x: 0.5, y: 0.8, r: 0.55, c: [196,181,253], vx: 0.00025, vy: -0.00025 }
    ];
    let t = 0;

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

    const draw = () => {
      if (document.hidden) { requestAnimationFrame(draw); return; }
      t += 1;
      ctx.clearRect(0, 0, w, h);
      const light = isLight();
      blobs.forEach((b, i) => {
        b.x += b.vx * 60; b.y += b.vy * 60;
        if (b.x < -0.2 || b.x > 1.2) b.vx *= -1;
        if (b.y < -0.2 || b.y > 1.2) b.vy *= -1;
        const cx = b.x * w + Math.sin(t * 0.003 + i) * 40;
        const cy = b.y * h + Math.cos(t * 0.004 + i) * 40;
        const rad = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const alpha = light ? 0.18 : 0.28;
        g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${alpha})`);
        g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ============================================================
     FX: Navigation
     ============================================================ */
  const Nav = {
    init() {
      const header = $('#app-header');
      const drawer = $('#nav-drawer');
      const menuBtn = $('#menu-toggle');

      const onScroll = () => { if (header) header.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false'; };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      const open = () => {
        drawer.dataset.open = 'true';
        drawer.setAttribute('aria-hidden', 'false');
        menuBtn?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      };
      const close = () => {
        drawer.dataset.open = 'false';
        drawer.setAttribute('aria-hidden', 'true');
        menuBtn?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      };

      menuBtn?.addEventListener('click', () => {
        if (drawer.dataset.open === 'true') close(); else open();
      });
      $$('[data-close-drawer]').forEach(n => n.addEventListener('click', close));
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && drawer.dataset.open === 'true') close();
      });
      $$('.nav-drawer__link').forEach(a => a.addEventListener('click', close));
    },
    updateActive(route) {
      $$('[data-route]').forEach(a => {
        const active = a.dataset.route === route;
        if (a.classList.contains('app-nav__link') || a.classList.contains('nav-drawer__link')) {
          a.dataset.active = active ? 'true' : 'false';
        }
      });
    }
  };

  /* ============================================================
     FX: Reveal + stagger
     ============================================================ */
  const Reveal = {
    io: null,
    init() {
      if (!('IntersectionObserver' in window) || REDUCED) {
        $$('.reveal').forEach(n => n.dataset.inview = 'true');
        return;
      }
      this.io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.dataset.inview = 'true';
            this.io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      this.observe();
    },
    observe() {
      $$('.reveal:not([data-inview])').forEach((n, i) => {
        n.style.setProperty('--i', String(i % 8));
        this.io?.observe(n);
      });
    }
  };

  /* ============================================================
     FX: Ripple on buttons
     ============================================================ */
  function bindRipple(root = document) {
    $$('.md-btn, .chip, .icon-btn', root).forEach(btn => {
      if (btn.dataset.rippleBound) return;
      btn.dataset.rippleBound = '1';
      btn.addEventListener('click', e => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        const r = document.createElement('span');
        r.className = 'ripple';
        r.style.width = r.style.height = size + 'px';
        r.style.left = x + 'px';
        r.style.top = y + 'px';
        btn.appendChild(r);
        setTimeout(() => r.remove(), 650);
      });
    });
  }

  /* ============================================================
     FX: Magnetic buttons
     ============================================================ */
  function bindMagnetic() {
    if (TOUCH || REDUCED) return;
    $$('.md-btn--filled, .hero__actions .md-btn, .brand__mark').forEach(btn => {
      if (btn.dataset.magBound) return;
      btn.dataset.magBound = '1';
      btn.dataset.magnetic = '1';
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.2}px, ${my * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ============================================================
     FX: Tilt on cards
     ============================================================ */
  function bindTilt() {
    if (TOUCH || REDUCED) return;
    $$('.project-card, .feature-card, .about-card, .contact-card').forEach(card => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = '1';
      card.dataset.tilt = '1';
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 6}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ============================================================
     FX: Spotlight on cards
     ============================================================ */
  function bindSpotlight() {
    $$('.project-card, .feature-card, .about-card, .contact-card').forEach(card => {
      if (card.dataset.spotBound) return;
      card.dataset.spotBound = '1';
      card.dataset.spotlight = '1';
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ============================================================
     FX: Hero particles + parallax
     ============================================================ */
  function initHeroCanvas() {
    const canvas = $('#hero-canvas');
    if (!canvas) return;
    if (REDUCED) { canvas.remove(); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const particles = [];
    const COUNT = window.innerWidth < 700 ? 26 : 48;
    let mouseX = 0, mouseY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    canvas.parentElement?.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
    }, { passive: true });

    const color = () => {
      const t = document.documentElement.getAttribute('data-theme');
      return t === 'light' ? '91, 59, 201' : '167, 139, 250';
    };

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 1.8
      });
    }

    let raf = null;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const c = color();
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${c}, 0.7)`;
        ctx.arc(p.x + mouseX * 0.3, p.y + mouseY * 0.3, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 16000) {
            const alpha = (1 - d2 / 16000) * 0.25;
            ctx.strokeStyle = `rgba(${c}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x + mouseX * 0.3, a.y + mouseY * 0.3);
            ctx.lineTo(b.x + mouseX * 0.3, b.y + mouseY * 0.3);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) draw();
    });
  }

  /* ============================================================
     FX: Typewriter
     ============================================================ */
  function typewriter(node, text, speed = 30) {
    if (!node) return;
    if (REDUCED) { node.textContent = text; return; }
    node.textContent = '';
    let i = 0;
    const caret = document.createElement('span');
    caret.className = 'tw-caret';
    caret.setAttribute('aria-hidden', 'true');
    node.appendChild(caret);
    const tick = () => {
      if (i < text.length) {
        node.insertBefore(document.createTextNode(text[i++]), caret);
        setTimeout(tick, speed);
      }
    };
    tick();
  }

  /* ============================================================
     FX: Scramble on hover
     ============================================================ */
  const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________';
  function bindScramble() {
    if (REDUCED) return;
    $$('[data-scramble]').forEach(node => {
      if (node.dataset.scrBound) return;
      node.dataset.scrBound = '1';
      const original = node.textContent;
      let frame = 0, raf = null;
      const scramble = () => {
        const progress = Math.min(frame / 30, 1);
        const revealed = Math.floor(original.length * progress);
        let out = '';
        for (let i = 0; i < original.length; i++) {
          if (i < revealed || original[i] === ' ') out += original[i];
          else out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        node.textContent = out;
        frame++;
        if (frame < 30) raf = requestAnimationFrame(scramble);
        else node.textContent = original;
      };
      node.addEventListener('mouseenter', () => {
        cancelAnimationFrame(raf);
        frame = 0;
        scramble();
      });
    });
  }

  /* ============================================================
     FX: Particle burst on click
     ============================================================ */
  function bindParticleBurst() {
    if (REDUCED || TOUCH) return;
    document.addEventListener('click', e => {
      if (e.target.closest('a, button, .md-btn')) {
        const colors = ['#A78BFA', '#67E8F9', '#C4B5FD'];
        for (let i = 0; i < 8; i++) {
          const p = document.createElement('div');
          p.style.cssText = `
            position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:4px;height:4px;
            border-radius:50%;background:${colors[i % 3]};pointer-events:none;z-index:9999;
            box-shadow:0 0 8px ${colors[i % 3]};
          `;
          document.body.appendChild(p);
          const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
          const dist = 40 + Math.random() * 40;
          p.animate(
            [
              { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
              { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0)`, opacity: 0 }
            ],
            { duration: 600 + Math.random() * 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' }
          ).onfinish = () => p.remove();
        }
      }
    }, { passive: true });
  }

  /* ============================================================
     FX: Page transition (glitch bars)
     ============================================================ */
  const Transition = {
    overlay: null,
    init() { this.overlay = $('#fx-page-transition'); },
    play(cb) {
      if (REDUCED) { cb(); return; }
      const o = this.overlay;
      if (!o) { cb(); return; }
      o.dataset.active = 'true';
      setTimeout(() => {
        cb();
        setTimeout(() => { o.dataset.active = 'false'; }, 220);
      }, 400);
    }
  };

  /* ============================================================
     Projects
     ============================================================ */
  const STATUS_LABEL = {
    active: 'Active', development: 'Development', beta: 'Beta',
    coming_soon: 'Coming Soon', archived: 'Archived',
    maintenance: 'Maintenance', inactive: 'Inactive'
  };

  function statusBadge(status) {
    const label = STATUS_LABEL[status] || status;
    return el('span', { class: `status status--${status}` }, [
      el('span', { class: 'status__dot', 'aria-hidden': 'true' }),
      el('span', { text: label })
    ]);
  }

  function projectCard(project) {
    const card = el('article', { class: 'md-card md-card--filled project-card reveal' });
    const head = el('div', { class: 'project-card__head' }, [
      el('span', { class: 'project-card__logo', 'aria-hidden': 'true', text: project.logo || (project.name || '?').slice(0, 2).toUpperCase() }),
      el('div', {}, [
        el('h3', { class: 'project-card__title', text: project.name || 'Untitled' }),
        el('p', { class: 'project-card__cat', text: project.category || 'Uncategorized' })
      ])
    ]);
    const desc = el('p', { class: 'project-card__desc', text: project.description || '' });
    const meta = el('div', { class: 'project-card__meta' });
    if (Array.isArray(project.platforms)) project.platforms.forEach(p => meta.appendChild(el('span', { class: 'project-card__tag', text: p })));
    if (project.version) meta.appendChild(el('span', { class: 'project-card__tag', text: 'v' + project.version }));
    meta.appendChild(statusBadge(project.status));

    const actions = el('div', { class: 'project-card__actions' });
    const detailsBtn = el('button', { class: 'md-btn md-btn--outlined', type: 'button', text: 'Подробнее' });
    detailsBtn.addEventListener('click', () => Notify.show(`Проект: ${project.name}. Раздел в разработке.`, 'info'));
    actions.appendChild(detailsBtn);

    const mirrorsKey = project.mirrorsKey || project.id;
    const hasMirrors = mirrorsKey && state.config.mirrors[mirrorsKey];
    const downloadBtn = el('button', { class: 'md-btn md-btn--tonal', type: 'button', text: 'Загрузка' });
    if (!hasMirrors || project.status === 'coming_soon') {
      downloadBtn.setAttribute('aria-disabled', 'true');
      downloadBtn.disabled = true;
    } else {
      downloadBtn.addEventListener('click', () => openMirrorDialog(project, mirrorsKey));
    }
    actions.appendChild(downloadBtn);

    card.append(head, desc, meta, actions);
    return card;
  }

  function renderProjectsPreview() {
    const host = $('#projects-preview');
    if (!host) return;
    const projects = (state.config.projects.projects || []).slice(0, 3);
    host.innerHTML = '';
    if (!projects.length) { host.appendChild(el('p', { class: 'empty-state', text: 'Проекты пока не добавлены.' })); return; }
    projects.forEach(p => host.appendChild(projectCard(p)));
    Reveal.observe(); bindRipple(host); bindTilt(); bindSpotlight();
  }

  function renderProjectsPage() {
    const host = $('#projects-grid');
    const filters = $('#project-filters');
    const empty = $('#projects-empty');
    if (!host || !filters) return;

    const all = state.config.projects.projects || [];
    const categories = ['All', ...Array.from(new Set(all.map(p => p.category).filter(Boolean)))];

    filters.innerHTML = '';
    categories.forEach((cat, idx) => {
      const btn = el('button', {
        class: 'chip', type: 'button', text: cat,
        'aria-pressed': idx === 0 ? 'true' : 'false',
        dataset: { category: cat }
      });
      btn.addEventListener('click', () => {
        $$('.chip', filters).forEach(c => c.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        renderGrid(cat);
      });
      filters.appendChild(btn);
    });

    const renderGrid = (cat) => {
      host.innerHTML = '';
      const list = cat === 'All' ? all : all.filter(p => p.category === cat);
      if (!list.length) { if (empty) empty.hidden = false; return; }
      if (empty) empty.hidden = true;
      list.forEach(p => host.appendChild(projectCard(p)));
      Reveal.observe(); bindRipple(host); bindTilt(); bindSpotlight();
    };

    renderGrid('All');
    bindRipple(filters);
  }

  function openMirrorDialog(project, mirrorsKey) {
    const dlg = $('#mirror-dialog');
    const body = $('#mirror-dialog-body');
    if (!dlg || !body || !dlg.showModal) return;

    const mirrors = (state.config.mirrors[mirrorsKey] && state.config.mirrors[mirrorsKey].mirrors) || [];
    body.innerHTML = '';

    if (!mirrors.length) {
      body.appendChild(el('p', { class: 'empty-state', text: 'Зеркала для этого проекта пока не добавлены.' }));
    } else {
      mirrors.forEach(m => {
        const row = el('div', { class: 'md-card md-card--outlined', style: 'padding:14px;margin-bottom:10px;' }, [
          el('div', { style: 'display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;' }, [
            el('div', {}, [
              el('p', { style: 'font-weight:500;', text: m.name || 'Mirror' }),
              el('p', { style: 'font-size:0.78rem;color:var(--text-secondary);font-family:var(--font-mono);', text: (m.type || 'download') })
            ]),
            statusBadge(m.status === 'active' ? 'active' : m.status === 'coming_soon' ? 'coming_soon' : m.status === 'maintenance' ? 'maintenance' : 'inactive')
          ]),
          el('div', { style: 'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;' }, [
            (() => {
              const isOpenable = m.status === 'active' && isValidHttpUrl(m.url);
              const btn = el('a', {
                class: 'md-btn md-btn--filled',
                href: isOpenable ? m.url : 'javascript:void(0)',
                target: isOpenable ? '_blank' : null,
                rel: isOpenable ? 'noopener noreferrer' : null,
                'aria-disabled': isOpenable ? 'false' : 'true',
                text: 'Перейти'
              });
              if (!isOpenable) { btn.style.pointerEvents = 'none'; btn.style.opacity = '0.5'; }
              return btn;
            })(),
            (() => {
              const isCopyable = isValidHttpUrl(m.url);
              const btn = el('button', { class: 'md-btn md-btn--outlined', type: 'button', text: 'Копировать URL' });
              if (!isCopyable) { btn.setAttribute('aria-disabled', 'true'); btn.disabled = true; }
              else btn.addEventListener('click', async () => {
                const ok = await copyText(m.url);
                Notify.show(ok ? 'URL скопирован' : 'Не удалось скопировать', ok ? 'success' : 'error');
              });
              return btn;
            })()
          ])
        ]);
        body.appendChild(row);
      });
    }

    dlg.showModal();
    bindRipple(body);
  }

  function bindDialogs() {
    const dlg = $('#mirror-dialog');
    if (!dlg) return;
    $$('[data-close-dialog]').forEach(b => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }

  /* ============================================================
     Contacts
     ============================================================ */
  function contactsArray() {
    const c = state.config.contacts || {};
    const out = [];
    if (c.telegram) out.push({ key: 'telegram', label: 'Telegram', value: c.telegram, type: 'url' });
    if (c.github) out.push({ key: 'github', label: 'GitHub', value: c.github, type: 'url' });
    if (c.email) out.push({ key: 'email', label: 'Email', value: c.email, type: 'email' });
    return out;
  }

  function renderContacts(selector, compact = false) {
    const host = $(selector);
    if (!host) return;
    host.innerHTML = '';
    contactsArray().forEach(item => {
      const card = el('article', { class: 'md-card md-card--filled contact-card reveal', tabindex: '0' }, [
        el('span', { class: 'contact-card__icon', 'aria-hidden': 'true', text: item.label.slice(0, 1) }),
        el('p', { class: 'contact-card__label', text: item.label }),
        el('p', { class: 'contact-card__value', text: item.value })
      ]);
      if (!compact) {
        const actions = el('div', { class: 'contact-card__actions' });
        if (item.type === 'url' && isValidHttpUrl(item.value)) {
          actions.appendChild(el('a', {
            class: 'md-btn md-btn--outlined', href: item.value,
            target: '_blank', rel: 'noopener noreferrer', text: 'Открыть'
          }));
        }
        const copyBtn = el('button', { class: 'md-btn md-btn--text', type: 'button', text: 'Копировать' });
        copyBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const ok = await copyText(item.value);
          Notify.show(ok ? `${item.label} скопирован` : 'Не удалось скопировать', ok ? 'success' : 'error');
        });
        actions.appendChild(copyBtn);
        card.appendChild(actions);
      }
      card.addEventListener('click', async () => {
        const ok = await copyText(item.value);
        Notify.show(ok ? `${item.label} скопирован` : 'Не удалось скопировать', ok ? 'success' : 'error');
      });
      card.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const ok = await copyText(item.value);
          Notify.show(ok ? `${item.label} скопирован` : 'Не удалось скопировать', ok ? 'success' : 'error');
        }
      });
      host.appendChild(card);
    });
    Reveal.observe(); bindRipple(host); bindTilt(); bindSpotlight();
  }

  function renderFooterContacts() {
    const host = $('#footer-contacts');
    if (!host) return;
    host.innerHTML = '';
    contactsArray().forEach(item => {
      if (item.type === 'url' && isValidHttpUrl(item.value)) {
        host.appendChild(el('a', { href: item.value, target: '_blank', rel: 'noopener noreferrer', text: item.label }));
      } else {
        host.appendChild(el('a', { href: 'mailto:' + item.value, text: item.label }));
      }
    });
  }

  /* ============================================================
     Page templates
     ============================================================ */
  const Pages = {
    home() {
      return `
        <section class="hero" aria-labelledby="hero-title">
          <canvas class="hero__canvas" id="hero-canvas" aria-hidden="true"></canvas>
          <div class="hero__glow" aria-hidden="true"></div>
          <div class="hero__grid" aria-hidden="true"></div>
          <div class="container hero__inner">
            <p class="hero__eyebrow"><span class="hero__dot" aria-hidden="true"></span>Технологическая команда</p>
            <h1 class="hero__title" id="hero-title">
              <span class="hero__title-line" data-scramble>LOLOLOSHKA</span>
              <span class="hero__title-line hero__title-line--accent" data-scramble>VIRUS</span><sup class="hero__tm">™</sup>
            </h1>
            <p class="hero__subtitle" id="hero-subtitle">Разрабатываем ПО, инструменты для Android, Windows и Linux, а также решения в области кибербезопасности.</p>
            <div class="hero__actions">
              <a class="md-btn md-btn--filled" href="#/projects">Смотреть проекты <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
              <a class="md-btn md-btn--outlined" href="#/about">О команде</a>
            </div>
            <ul class="hero__tags" aria-label="Направления работы">
              <li class="hero__tag">Software Development</li>
              <li class="hero__tag">Cybersecurity</li>
              <li class="hero__tag">Android</li>
              <li class="hero__tag">Windows</li>
              <li class="hero__tag">Linux Distribution</li>
              <li class="hero__tag">Open Source</li>
              <li class="hero__tag">System Engineering</li>
            </ul>
          </div>
        </section>

        <div class="marquee" aria-hidden="true">
          <div class="marquee__track">
            ${Array(2).fill(`
              <span class="marquee__item">ANDROID</span>
              <span class="marquee__item">WINDOWS</span>
              <span class="marquee__item">LINUX</span>
              <span class="marquee__item">CYBERSECURITY</span>
              <span class="marquee__item">OPEN SOURCE</span>
              <span class="marquee__item">SYSTEM ENGINEERING</span>
              <span class="marquee__item">SOFTWARE</span>
            `).join('')}
          </div>
        </div>

        <section class="section" aria-labelledby="projects-preview-title">
          <div class="container">
            <div class="section__head">
              <div>
                <p class="section__eyebrow">Products</p>
                <h2 class="md-headline-large" id="projects-preview-title">Наши проекты</h2>
              </div>
              <a class="md-btn md-btn--text" href="#/projects">Все проекты <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </div>
            <div class="project-grid" id="projects-preview"></div>
          </div>
        </section>

        <div class="divider" aria-hidden="true"></div>

        <section class="section section--alt" aria-labelledby="about-preview-title">
          <div class="container">
            <div class="section__head">
              <div>
                <p class="section__eyebrow">About</p>
                <h2 class="md-headline-large" id="about-preview-title">Что мы делаем</h2>
              </div>
              <a class="md-btn md-btn--text" href="#/about">Подробнее <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </div>
            <div class="feature-grid">
              ${[
                ['01','Software Development','Проектирование и разработка прикладного ПО с упором на предсказуемость и сопровождаемость.'],
                ['02','Cybersecurity','Анализ поверхностей атаки, минимизация зависимостей и отказ от небезопасных практик.'],
                ['03','Android Development','Инструменты и утилиты для Android-устройств — от прошивок до прикладных решений.'],
                ['04','Windows Utilities','Компактные утилиты без тяжёлых зависимостей и скрытых сетевых запросов.'],
                ['05','Linux Distribution','Собственные сборки и конфигурации Linux с упором на безопасность и минимализм.'],
                ['06','Open Source','Прозрачность, воспроизводимость сборок и возможность проверить то, что вы используете.']
              ].map(([i,t,d]) => `
                <article class="md-card md-card--filled feature-card reveal featured">
                  <span class="feature-card__index">${i}</span>
                  <h3 class="md-title-large">${t}</h3>
                  <p class="md-body-medium">${d}</p>
                </article>
              `).join('')}
            </div>
          </div>
        </section>

        <section class="section" aria-labelledby="contacts-preview-title">
          <div class="container">
            <div class="section__head">
              <div>
                <p class="section__eyebrow">Contacts</p>
                <h2 class="md-headline-large" id="contacts-preview-title">Связаться с нами</h2>
              </div>
              <a class="md-btn md-btn--text" href="#/contacts">Все контакты <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </div>
            <div class="contact-grid contact-grid--preview" id="contacts-preview"></div>
          </div>
        </section>
      `;
    },

    projects() {
      return `
        <section class="page-hero">
          <div class="container">
            <p class="section__eyebrow">Catalog</p>
            <h1 class="md-display-medium" data-scramble>Projects</h1>
            <p class="md-body-large page-hero__desc">
              Полный каталог продуктов LOLOLOSHKAVIRUSTM™. Android-инструменты, Windows-утилиты,
              Linux-дистрибутивы и open-source решения.
            </p>
          </div>
        </section>
        <section class="section">
          <div class="container">
            <div class="chips" role="group" aria-label="Фильтр по категориям" id="project-filters"></div>
            <div class="project-grid" id="projects-grid" aria-live="polite"></div>
            <p class="empty-state" id="projects-empty" hidden>В этой категории пока нет проектов.</p>
          </div>
        </section>
      `;
    },

    about() {
      return `
        <section class="page-hero">
          <div class="container">
            <p class="section__eyebrow">About</p>
            <h1 class="md-display-medium" data-scramble>LOLOLOSHKAVIRUSTM™</h1>
            <p class="md-body-large page-hero__desc">
              Технологическая команда, работающая над программным обеспечением,
              инструментами для Android, Windows, Linux-дистрибутивами и решениями
              в области кибербезопасности.
            </p>
          </div>
        </section>
        <section class="section">
          <div class="container about-grid">
            <article class="md-card md-card--outlined about-card reveal featured">
              <h2 class="md-title-large">Философия</h2>
              <p class="md-body-medium">Качественное ПО должно быть предсказуемым, проверяемым и независимым. Минимум зависимостей, прозрачная логика, отсутствие скрытых механизмов.</p>
            </article>
            <article class="md-card md-card--outlined about-card reveal">
              <h2 class="md-title-large">Направления</h2>
              <ul class="about-list">
                <li>Software Development</li>
                <li>Cybersecurity</li>
                <li>Android Development</li>
                <li>Windows Utilities</li>
                <li>Linux Distribution</li>
                <li>System Engineering</li>
              </ul>
            </article>
            <article class="md-card md-card--outlined about-card reveal">
              <h2 class="md-title-large">Open Source</h2>
              <p class="md-body-medium">Открытый код — инструмент доверия. Публикуем исходники там, где это возможно, и поощряем проверку сообществом.</p>
            </article>
            <article class="md-card md-card--outlined about-card reveal">
              <h2 class="md-title-large">Безопасность и приватность</h2>
              <p class="md-body-medium">Никакой телеметрии без согласия, никаких скрытых сетевых запросов. Все конфигурации прозрачны.</p>
            </article>
            <article class="md-card md-card--outlined about-card reveal featured">
              <h2 class="md-title-large">Технологическая независимость</h2>
              <p class="md-body-medium">Избегаем тяжёлых фреймворков и vendor-lock. Сайт и продукты собираются из стандартных веб-технологий.</p>
            </article>
            <article class="md-card md-card--outlined about-card reveal">
              <h2 class="md-title-large">Принципы</h2>
              <ul class="about-list">
                <li>Ясность важнее сложности</li>
                <li>Безопасность по умолчанию</li>
                <li>Отсутствие фиктивных функций</li>
                <li>Документированная конфигурация</li>
              </ul>
            </article>
          </div>
        </section>
      `;
    },

    contacts() {
      return `
        <section class="page-hero">
          <div class="container">
            <p class="section__eyebrow">Contacts</p>
            <h1 class="md-display-medium" data-scramble>Связаться</h1>
            <p class="md-body-large page-hero__desc">
              Нажмите на карточку, чтобы скопировать значение, или используйте кнопку перехода.
            </p>
          </div>
        </section>
        <section class="section">
          <div class="container">
            <div class="contact-grid" id="contacts-grid"></div>
          </div>
        </section>
      `;
    },

    notFound() {
      return `
        <section class="error-page">
          <div class="container error-page__inner">
            <p class="error-page__code glitch" data-text="404">404</p>
            <h1 class="md-headline-large">Страница не найдена</h1>
            <p class="md-body-large error-page__desc">Возможно, страница была перемещена, удалена или вы попали сюда по ошибке.</p>
            <div class="error-page__actions">
              <a class="md-btn md-btn--filled" href="#/">На главную</a>
              <a class="md-btn md-btn--outlined" href="#/projects">К проектам</a>
            </div>
            <p class="error-page__hint">LOLOLOSHKAVIRUSTM™ · 2026</p>
          </div>
        </section>
      `;
    }
  };

  /* ============================================================
     Router with page transition
     ============================================================ */
  const Router = {
    routes: { '/': 'home', '/projects': 'projects', '/about': 'about', '/contacts': 'contacts' },
    init() {
      window.addEventListener('hashchange', () => this.render());
      this.render(true);
    },
    current() {
      const hash = window.location.hash.replace(/^#/, '') || '/';
      return this.routes[hash] ? hash : '/__404';
    },
    render(initial = false) {
      const route = this.current();
      const main = $('#main');
      if (!main) return;

      const doRender = () => {
        state.route = route;
        const view = route === '/__404' ? 'notFound' : this.routes[route];
        main.innerHTML = Pages[view]();

        if (view === 'home') {
          renderProjectsPreview();
          renderContacts('#contacts-preview', true);
          initHeroCanvas();
          const sub = $('#hero-subtitle');
          if (sub) {
            const txt = sub.textContent;
            typewriter(sub, txt, 18);
          }
        } else if (view === 'projects') {
          renderProjectsPage();
        } else if (view === 'contacts') {
          renderContacts('#contacts-grid', false);
        }

        Nav.updateActive(route === '/__404' ? '' : route);
        Reveal.observe();
        bindRipple(main);
        bindMagnetic();
        bindTilt();
        bindSpotlight();
        bindScramble();

        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

        const titles = {
          '/': 'LOLOLOSHKAVIRUSTM™ — Технологическая команда',
          '/projects': 'Projects — LOLOLOSHKAVIRUSTM™',
          '/about': 'About — LOLOLOSHKAVIRUSTM™',
          '/contacts': 'Contacts — LOLOLOSHKAVIRUSTM™'
        };
        document.title = titles[route] || '404 — LOLOLOSHKAVIRUSTM™';
      };

      if (initial) doRender();
      else Transition.play(doRender);
    }
  };

  /* ============================================================
     Boot
     ============================================================ */
  async function boot() {
    Notify.init();
    Cursor.init();
    Theme.init();
    Nav.init();
    bindDialogs();
    Reveal.init();
    Progress.init();
    Transition.init();
    initMesh();
    bindParticleBurst();

    await loadConfigs();

    const yearNode = $('#footer-year');
    if (yearNode) yearNode.textContent = String(state.config.site.year || 2026);
    renderFooterContacts();

    Router.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();