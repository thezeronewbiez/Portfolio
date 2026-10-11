const navLinks = [...document.querySelectorAll('.nav-link')];
const navList = document.querySelector('.nav-links');
const mobileMenuButton = document.querySelector('.nav-menu-btn');

function updateActiveNavLink() {
  const activeLink = navLinks.find(link => link.hash === window.location.hash) || navLinks[0];
  navLinks.forEach(link => link.classList.toggle('active', link === activeLink));
}

window.addEventListener('hashchange', updateActiveNavLink);
window.addEventListener('popstate', updateActiveNavLink);
updateActiveNavLink();

let scrollAnimationFrame;
let previousScrollBehavior = '';

function scrollToPosition(targetY) {
  if (scrollAnimationFrame) {
    cancelAnimationFrame(scrollAnimationFrame);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  }

  const root = document.documentElement;
  const startY = window.scrollY;
  const endY = Math.max(0, Math.min(targetY, root.scrollHeight - window.innerHeight));
  const distance = endY - startY;
  if (distance === 0) return;

  previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  const startTime = performance.now();
  const duration = Math.min(900, Math.max(450, Math.abs(distance) * 0.35));

  function animateScroll(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    window.scrollTo({ top: startY + distance * easedProgress, behavior: 'instant' });

    if (progress < 1) {
      scrollAnimationFrame = requestAnimationFrame(animateScroll);
    } else {
      scrollAnimationFrame = undefined;
      root.style.scrollBehavior = previousScrollBehavior;
    }
  }

  scrollAnimationFrame = requestAnimationFrame(animateScroll);
}

function scrollToElement(target) {
  const marginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  scrollToPosition(window.scrollY + target.getBoundingClientRect().top - marginTop);
}

mobileMenuButton.addEventListener('click', () => {
  const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
  mobileMenuButton.setAttribute('aria-expanded', String(!isExpanded));
  mobileMenuButton.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
  navList.classList.toggle('mobile-open', !isExpanded);
});

navLinks.forEach(link => {
  link.addEventListener('click', event => {
    const target = document.querySelector(link.hash);
    if (!target) return;

    event.preventDefault();
    if (window.location.hash !== link.hash) {
      window.history.pushState(null, '', link.hash);
    }
    updateActiveNavLink();
    scrollToElement(target);

    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.setAttribute('aria-label', 'Open navigation menu');
    navList.classList.remove('mobile-open');
  });
});

const githubRepositories = document.querySelector('#github-repositories');
const githubRepositoriesToggle = document.querySelector('#github-repositories-toggle');

if (githubRepositories && githubRepositoriesToggle) {
  githubRepositoriesToggle.addEventListener('click', () => {
    const isOpening = githubRepositories.hidden;
    githubRepositories.hidden = !isOpening;
    githubRepositoriesToggle.setAttribute('aria-expanded', String(isOpening));
    githubRepositoriesToggle.querySelector('span').textContent = isOpening ? 'Hide Projects' : 'View Project';
    githubRepositoriesToggle.querySelector('[aria-hidden="true"]').textContent = isOpening ? '↑' : '→';

    if (isOpening) {
      document.dispatchEvent(new CustomEvent('github:show-repositories'));
      scrollToElement(githubRepositories);
    } else {
      scrollToElement(githubRepositoriesToggle);
    }
  });
}

document.querySelectorAll('a[href^="#"]:not(.nav-link):not(.nav-home-btn)').forEach(link => {
  link.addEventListener('click', event => {
    const target = document.querySelector(link.hash);
    if (!target) return;

    event.preventDefault();
    if (window.location.hash !== link.hash) {
      window.history.pushState(null, '', link.hash);
    }
    updateActiveNavLink();
    scrollToElement(target);
  });
});

const homeLink = document.querySelector('.nav-home-btn');
homeLink.addEventListener('click', event => {
  event.preventDefault();
  if (window.location.hash !== '#home') {
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}#home`);
  }
  updateActiveNavLink();
  scrollToPosition(0);
});

const traitDeck = document.querySelector('.about-trait-deck');
if (traitDeck) {
  const traitCards = [...traitDeck.querySelectorAll('[data-trait-card]')];
  const traitStatus = document.querySelector('#trait-card-status');
  let traitOrder = traitCards;

  function moveTraitCardToFront(card) {
    let cardIndex = traitOrder.indexOf(card);
    if (cardIndex === 0) cardIndex = 1;
    if (cardIndex < 0) return;

    traitOrder = [...traitOrder.slice(cardIndex), ...traitOrder.slice(0, cardIndex)];
    traitOrder.forEach((traitCard, position) => {
      traitCard.dataset.position = String(position);
    });

    traitStatus.textContent = `${traitOrder[0].querySelector('.shuffle-card-value').textContent} trait selected.`;
  }

  traitCards.forEach(card => {
    card.addEventListener('click', () => moveTraitCardToFront(card));
  });

  traitDeck.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();

    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (traitOrder.indexOf(document.activeElement) + direction + traitOrder.length) % traitOrder.length;
    traitOrder[nextIndex].focus();
    moveTraitCardToFront(traitOrder[nextIndex]);
  });
}

// Handle theme toggle
const themeBtn = document.querySelector('.nav-theme-btn');
if (themeBtn) {
  function setLightMode(enabled) {
    document.body.classList.toggle('light-mode', enabled);
    document.documentElement.classList.toggle('light-mode', enabled);
    themeBtn.setAttribute('aria-pressed', String(enabled));
    const nextMode = enabled ? 'dark' : 'light';
    themeBtn.setAttribute('aria-label', `Switch to ${nextMode} mode`);
    themeBtn.setAttribute('title', `Switch to ${nextMode} mode`);
  }

  themeBtn.addEventListener('click', () => {
    setLightMode(!document.body.classList.contains('light-mode'));
  });
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const formStatus = document.querySelector('#contact-form-status');
    const senderName = new FormData(contactForm).get('name');
    formStatus.textContent = `Thanks${senderName ? `, ${senderName}` : ''}. This form preview is not connected to message delivery yet. Email me at giantgamer1321@gmail.com.`;
  });
}

const projects = [
  {
    title: 'URBS - University Room Booking System',
    description: 'A university room booking system for managing reservations, tracking availability, and providing real-time information to users.',
    accent: '#1785d1',
    kind: 'coding'
  },
  {
    title: 'Line Flex Message API',
    description: 'A custom API for generating and sending LINE Flex messages, enabling dynamic and interactive messaging experiences.',
    accent: '#7868e8',
    kind: 'API'
  },
  {
    title: 'Automatic Script And Ui Overlay Roblox',
    description: 'Developed automation scripts and UI overlays using Lua to manage in-game systems in real-time, while integrating statistical notifications via Discord Webhooks.',
    accent: '#159c86',
    kind: 'coding'
  }
];

const projectCarousel = document.querySelector('#project-carousel');
if (projectCarousel) {
  const slides = [...projectCarousel.querySelectorAll('.project-slide')];
  const title = document.querySelector('#project-title');
  const description = document.querySelector('#project-description');
  const projectLink = document.querySelector('.project-link');
  const projectCount = document.querySelector('.project-count');
  let activeProjectIndex = 0;

  function escapeSvgText(value) {
    return value.replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;'
    })[character]);
  }

  function makeProjectPreview(project) {
    const safeTitle = escapeSvgText(project.title);
    const safeKind = escapeSvgText(project.kind.toUpperCase());
    const accent = project.accent;
    const rows = Array.from({ length: 5 }, (_, index) => {
      const y = 330 + index * 42;
      const width = 700 - (index % 3) * 100;
      return `<rect x="300" y="${y}" width="${width}" height="13" rx="6" fill="#dce2e9"/><rect x="300" y="${y + 21}" width="${Math.max(160, width - 180)}" height="8" rx="4" fill="#edf0f4"/>`;
    }).join('');

    const artwork = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600">
      <defs><linearGradient id="hero" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${accent}"/><stop offset="1" stop-color="#182335"/></linearGradient></defs>
      <rect width="1000" height="600" fill="#f3f5f8"/>
      <rect width="1000" height="54" fill="#171d27"/>
      <rect x="28" y="17" width="21" height="21" rx="6" fill="${accent}"/>
      <rect x="62" y="20" width="110" height="8" rx="4" fill="#eef1f5"/>
      <rect x="760" y="22" width="46" height="7" rx="3" fill="#7c8796"/>
      <rect x="824" y="22" width="46" height="7" rx="3" fill="#7c8796"/>
      <rect x="900" y="13" width="70" height="28" rx="7" fill="${accent}"/>
      <rect x="0" y="54" width="205" height="546" fill="#202938"/>
      <rect x="25" y="83" width="150" height="11" rx="5" fill="#e3e7ed"/>
      <rect x="25" y="120" width="125" height="9" rx="4" fill="#8894a3"/>
      <rect x="25" y="154" width="142" height="9" rx="4" fill="#8894a3"/>
      <rect x="25" y="188" width="116" height="9" rx="4" fill="#8894a3"/>
      <rect x="25" y="222" width="135" height="9" rx="4" fill="#8894a3"/>
      <rect x="230" y="78" width="740" height="220" rx="14" fill="url(#hero)"/>
      <text x="270" y="126" fill="#d7e3f0" font-size="16" font-family="JetBrains Mono, monospace" letter-spacing="4">${safeKind}</text>
      <text x="270" y="185" fill="#ffffff" font-size="34" font-weight="700" font-family="JetBrains Mono, monospace">${safeTitle}</text>
      <rect x="270" y="216" width="360" height="9" rx="4" fill="#ffffff" opacity=".6"/>
      <rect x="270" y="238" width="280" height="9" rx="4" fill="#ffffff" opacity=".35"/>
      <rect x="270" y="261" width="120" height="23" rx="6" fill="#ffffff" opacity=".94"/>
      <rect x="230" y="320" width="740" height="250" rx="14" fill="#ffffff"/>
      <rect x="260" y="347" width="190" height="12" rx="5" fill="#263244"/>
      ${rows}
      <rect x="790" y="374" width="145" height="160" rx="10" fill="#f4f6f9"/>
      <circle cx="862" cy="440" r="43" fill="none" stroke="#e2e7ed" stroke-width="13"/>
      <path d="M862 397a43 43 0 0 1 39 61" fill="none" stroke="${accent}" stroke-width="13" stroke-linecap="round"/>
      <rect x="830" y="500" width="64" height="8" rx="4" fill="#a2adba"/>
    </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(artwork)}`;
  }

  function renderProjectCarousel() {
    const projectCountTotal = projects.length;

    slides.forEach(slide => {
      const offset = Number(slide.dataset.projectOffset);
      const projectIndex = (activeProjectIndex + offset + projectCountTotal) % projectCountTotal;
      const project = projects[projectIndex];
      const image = slide.querySelector('.project-image');
      const isActive = offset === 0;

      image.src = makeProjectPreview(project);
      image.alt = `${project.title} project preview`;
      slide.setAttribute('aria-label', isActive ? `Current project: ${project.title}` : `Show project: ${project.title}`);
      slide.classList.toggle('project-slide-active', isActive);
      slide.classList.toggle('project-slide-side', !isActive);
      slide.classList.toggle('project-slide-left', offset === -1);
      slide.classList.toggle('project-slide-right', offset === 1);
      slide.tabIndex = isActive ? -1 : 0;
    });

    const activeProject = projects[activeProjectIndex];
    title.textContent = activeProject.title;
    description.textContent = activeProject.description;
    projectLink.setAttribute('aria-label', `View ${activeProject.title}`);
    projectCount.textContent = `${String(activeProjectIndex + 1).padStart(2, '0')} / ${String(projectCountTotal).padStart(2, '0')}`;
  }

  function showProject(offset) {
    activeProjectIndex = (activeProjectIndex + offset + projects.length) % projects.length;
    renderProjectCarousel();
  }

  const activityItems = [...document.querySelectorAll('[data-activity]')];
  if (activityItems.length) {
    const activityVisuals = {
      'virtual-assistance': {
        title: 'Freshman Orientation MC',
        images: [
          'Image/Activity/Freshman/1.jpg',
          'Image/Activity/Freshman/2.jpg',
          'Image/Activity/Freshman/3.jpg'
        ]
      },
      'tech-tuesdays': {
        title: 'LINE Messaging API training',
        images: ['Image/Work/Flex%20Message%20API.png']
      },
      capstone: {
        title: 'Essential SQL for Everyone',
        images: ['Image/Activity/SQL/1.png']
      }
    };

    activityItems.forEach(item => {
      const activity = activityVisuals[item.dataset.activity];
      const button = item.querySelector('[data-activity-image]');
      if (!activity || !button) return;

      const image = button.querySelector('.activity-image');
      const imageCount = button.querySelector('.activity-image-count');
      let imageIndex = 0;
      const imageTotal = activity.images.length;

      function renderActivityImage() {
        image.src = activity.images[imageIndex];
        image.alt = `${activity.title}${imageTotal > 1 ? ` photo ${imageIndex + 1} of ${imageTotal}` : ' photo'}`;

        if (imageCount) {
          imageCount.hidden = imageTotal < 2;
          imageCount.textContent = `${imageIndex + 1} / ${imageTotal}`;
        }

        if (button instanceof HTMLButtonElement) {
          button.setAttribute('aria-label', `Show next photo for ${activity.title} (${imageIndex + 1} of ${imageTotal})`);
        }
      }

      if (imageTotal > 1 && button instanceof HTMLButtonElement) {
        button.addEventListener('click', () => {
          imageIndex = (imageIndex + 1) % imageTotal;
          renderActivityImage();
        });
      }

      renderActivityImage();
    });
  }

  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      const offset = Number(slide.dataset.projectOffset);
      if (offset !== 0) showProject(offset);
    });
  });

  document.querySelectorAll('[data-project-direction]').forEach(button => {
    button.addEventListener('click', () => showProject(Number(button.dataset.projectDirection)));
  });

  projectCarousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showProject(-1);
    if (event.key === 'ArrowRight') showProject(1);
  });

  renderProjectCarousel();
}
