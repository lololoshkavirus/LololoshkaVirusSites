(() => {
  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened));
      toggle.textContent = opened ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      });
    });
  }

  // Dynamic year
  document.querySelectorAll('[data-year]').forEach(node => {
    node.textContent = new Date().getFullYear();
  });

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // Reliable skill tooltips (JS floating bubble — works even if CSS ::after is clipped)
  const tipEl = document.createElement('div');
  tipEl.className = 'js-skill-tip';
  tipEl.setAttribute('role', 'tooltip');
  document.body.appendChild(tipEl);

  const style = document.createElement('style');
  style.textContent = `
    .js-skill-tip {
      position: fixed;
      z-index: 9999;
      max-width: min(280px, 80vw);
      padding: 11px 14px;
      border-radius: 12px;
      background: #16162a;
      border: 1px solid rgba(167, 139, 250, 0.5);
      color: #eceaff;
      font-family: Manrope, Inter, system-ui, sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.5;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55);
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
      white-space: normal;
    }
    .js-skill-tip.is-visible {
      opacity: 1;
      visibility: visible;
    }
  `;
  document.head.appendChild(style);

  function placeTip(target) {
    const text = target.getAttribute('data-tip');
    if (!text) return;
    tipEl.textContent = text;
    tipEl.classList.add('is-visible');

    const rect = target.getBoundingClientRect();
    const tipRect = tipEl.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    let top = rect.top - tipRect.height - 12;

    // Keep inside viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
    if (top < 8) {
      top = rect.bottom + 10; // show below if no space above
    }

    tipEl.style.left = left + 'px';
    tipEl.style.top = top + 'px';
  }

  function hideTip() {
    tipEl.classList.remove('is-visible');
  }

  document.querySelectorAll('.skill-tag[data-tip]').forEach(el => {
    el.setAttribute('tabindex', '0');
    el.addEventListener('mouseenter', () => placeTip(el));
    el.addEventListener('mouseleave', hideTip);
    el.addEventListener('focus', () => placeTip(el));
    el.addEventListener('blur', hideTip);
  });

  window.addEventListener('scroll', hideTip, { passive: true });
  window.addEventListener('resize', hideTip);
})();
