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
    image: 'Image/Work/URBS.jpg',
    accent: '#1785d1',
    kind: 'coding'
  },
  {
    title: 'Line Flex Message API',
    description: 'A custom API for generating and sending LINE Flex messages, enabling dynamic and interactive messaging experiences.',
    image: 'Image/Work/Flex%20Message%20API.png',
    accent: '#7868e8',
    kind: 'API'
  },
  {
    title: 'Automatic Script And Ui Overlay Roblox',
    description: 'Developed automation scripts and UI overlays using Lua to manage in-game systems in real-time, while integrating statistical notifications via Discord Webhooks.',
    image: 'Image/Work/Roblox.png',
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

  function renderProjectCarousel() {
    const projectCountTotal = projects.length;

    slides.forEach(slide => {
      const offset = Number(slide.dataset.projectOffset);
      const projectIndex = (activeProjectIndex + offset + projectCountTotal) % projectCountTotal;
      const project = projects[projectIndex];
      const image = slide.querySelector('.project-image');
      const isActive = offset === 0;

      image.src = project.image;
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
