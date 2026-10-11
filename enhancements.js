/* enhancements.js: load AFTER script.js. Nothing here edits your existing code;
   if this file fails to load, the site still works exactly as before. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Navbar gains depth once the page scrolls (styled by .is-scrolled in the CSS)
  const bar = document.querySelector('.navbar-wrapper');
  const onScroll = () => bar && bar.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 2. Scroll-spy: the active nav link follows the section in view, not just clicks
  const links = [...document.querySelectorAll('.nav-link')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(link => {
    const section = document.querySelector(link.hash);
    if (section) spy.observe(section);
  });

  // 3. One-time reveal for dense blocks (cards and activity rows)
  if (!reduce) {
    const items = [...document.querySelectorAll('.capability-card, .activity-item')];
    items.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 2) * 90}ms`;
    });
    const reveal = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-visible');
        observer.unobserve(el);
        // hand control back to the normal hover transitions once revealed
        setTimeout(() => {
          el.classList.remove('reveal', 'is-visible');
          el.style.transitionDelay = '';
        }, 1000);
      });
    }, { threshold: 0.15 });
    items.forEach(el => reveal.observe(el));
  }

  // 4. Count-up for the About stats (skips years such as 2026)
  document.querySelectorAll('.about-stats dd').forEach(dd => {
    const match = dd.textContent.trim().match(/^(\d+)(\+?)$/);
    if (!match || reduce || Number(match[1]) > 999) return;
    const end = Number(match[1]);
    const suffix = match[2];
    dd.textContent = `0${suffix}`;
    new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / 1200, 1);
        dd.textContent = `${Math.round(end * (1 - Math.pow(1 - p, 3)))}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 }).observe(dd);
  });

  // 5. Replay a short animation whenever script.js swaps carousel text or images
  const replay = (el, cls) => {
    el.classList.remove(cls);
    void el.offsetWidth; // restart the animation
    el.classList.add(cls);
  };
  if (!reduce) {
    ['#project-title', '#project-description'].forEach(selector => {
      const el = document.querySelector(selector);
      if (el) new MutationObserver(() => replay(el, 'swap-in')).observe(el, { childList: true });
    });
    document.querySelectorAll('.project-image, .activity-image').forEach(img => {
      new MutationObserver(() => replay(img, 'img-new')).observe(img, { attributes: true, attributeFilter: ['src'] });
    });
  }
})();
