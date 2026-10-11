/* โหลดไฟล์นี้หลัง script.js เพื่อเติมลูกเล่น โดยไม่ไปแก้ข้อมูลหลักของเว็บ */
(() => {
  // เช็กก่อนว่าผู้ใช้ขอลดการเคลื่อนไหวไว้ไหม ถ้าขอไว้ก็ข้ามเอฟเฟกต์บางอย่าง
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // เลื่อนหน้าแล้วเพิ่มคลาสให้แถบเมนู เพื่อให้ CSS เปลี่ยนเงาและพื้นหลัง
  const bar = document.querySelector('.navbar-wrapper');
  const onScroll = () => bar && bar.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ดูว่า section ไหนอยู่กลางจอ แล้วทำเครื่องหมายเมนูของ section นั้น
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

  // ค่อย ๆ เผยการ์ดตอนเลื่อนมาถึง และทำครั้งเดียวต่อการ์ด
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
        // จบเอฟเฟกต์เข้าแล้ว เอาคลาสชั่วคราวออกเพื่อให้ hover ทำงานตามปกติ
        setTimeout(() => {
          el.classList.remove('reveal', 'is-visible');
          el.style.transitionDelay = '';
        }, 1000);
      });
    }, { threshold: 0.15 });
    items.forEach(el => reveal.observe(el));
  }

  // นับตัวเลขสถิติใน About เมื่อเลื่อนมาถึง แต่ไม่แตะตัวเลขที่เป็นปี
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

  // เปลี่ยนเนื้อหาใน carousel แล้วเริ่มเอฟเฟกต์เข้าใหม่ให้ดูต่อเนื่อง
  const replay = (el, cls) => {
    el.classList.remove(cls);
    void el.offsetWidth; // อ่านขนาด element เพื่อบังคับให้เบราว์เซอร์เริ่มแอนิเมชันรอบใหม่
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
