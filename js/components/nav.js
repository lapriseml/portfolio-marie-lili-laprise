// Navigation et comportement de scroll

function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  const mobileMenu = document.querySelector('.mobile-menu');
  const toggle = mobileMenu?.querySelector('.mobile-menu__toggle');
  const links = mobileMenu?.querySelector('.mobile-menu__links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
    links.hidden = isOpen;
    mobileMenu.classList.toggle('is-open', !isOpen);
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu');
      links.hidden = true;
      mobileMenu.classList.remove('is-open');
    });
  });
}

function initSectionScroll() {
  const home = document.getElementById('page-home');
  const sections = Array.from(document.querySelectorAll('#hero, #projects, #skills, #contact'));
  if (!home || !sections.length) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const projectCards = Array.from(document.querySelectorAll('#projects .project-card'));
  const targets = isMobile
    ? [
        { element: sections[0], section: sections[0] },
        ...projectCards.map((card) => ({ element: card, section: sections[1] })),
        { element: document.querySelector('#skills .skills-mobile-slide'), section: sections[2] },
        { element: document.querySelector('#skills .about-mobile-slide'), section: sections[2] },
        { element: sections[3], section: sections[3] }
      ]
    : sections.map((section) => ({ element: section, section }));

  let currentIndex = 0;
  let isAnimating = false;
  let animationId = 0;
  home.style.scrollSnapType = 'none';
  home.style.scrollBehavior = 'auto';
  if (isMobile) home.style.touchAction = 'none';

  const setActiveSection = (index) => {
    currentIndex = index;
    sections.forEach((section) => section.classList.remove('active-section'));
    targets.forEach((target, i) => {
      target.element.classList.toggle('active-section', i === index);
    });
    targets[index].section.classList.add('active-section');
  };

  const getTargetCenter = (target) => {
    const homeRect = home.getBoundingClientRect();
    const targetRect = target.element.getBoundingClientRect();
    return targetRect.top - homeRect.top + home.scrollTop + targetRect.height / 2;
  };

  const updateActiveSection = () => {
    if (isAnimating) return;
    const currentPosition = home.scrollTop + home.clientHeight / 2;
    const closestIndex = targets.reduce((bestIndex, target, index) => {
      const currentDistance = Math.abs(getTargetCenter(target) - currentPosition);
      const bestDistance = Math.abs(getTargetCenter(targets[bestIndex]) - currentPosition);
      return currentDistance < bestDistance ? index : bestIndex;
    }, 0);
    setActiveSection(closestIndex);
  };

  const scrollToSection = (index) => {
    if (index < 0 || index >= targets.length || isAnimating) return;

    const target = targets[index];
    const targetTop = Math.min(
      Math.max(0, getTargetCenter(target) - home.clientHeight / 2),
      home.scrollHeight - home.clientHeight
    );
    const startTop = home.scrollTop;
    const startTime = performance.now();
    const animationDuration = 650;
    const currentAnimationId = ++animationId;

    isAnimating = true;
    setActiveSection(index);

    const animate = (timestamp) => {
      if (currentAnimationId !== animationId) return;
      const progress = Math.min((timestamp - startTime) / animationDuration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      home.scrollTop = startTop + (targetTop - startTop) * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animate);
        return;
      }

      home.scrollTop = targetTop;
      isAnimating = false;
    };

    requestAnimationFrame(animate);
    setTimeout(() => {
      if (currentAnimationId !== animationId || !isAnimating) return;
      home.scrollTop = targetTop;
      isAnimating = false;
    }, animationDuration + 200);
  };

  home.addEventListener('scroll', updateActiveSection, { passive: true });
  home.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    if (isAnimating) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    scrollToSection(currentIndex + direction);
  }, { passive: false });

  let touchStartY = 0;
  home.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0].clientY;
  }, { passive: true });
  home.addEventListener('touchmove', (event) => {
    event.preventDefault();
  }, { passive: false });
  home.addEventListener('touchend', (event) => {
    const deltaY = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(deltaY) < 30 || isAnimating) return;
    scrollToSection(currentIndex + (deltaY > 0 ? 1 : -1));
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      const targetSectionIndex = sections.indexOf(target);
      const targetIndex = isMobile && targetSectionIndex === 1
        ? 1
          : isMobile && targetSectionIndex === 2
          ? targets.findIndex((item) => item.element === document.querySelector('#skills .skills-mobile-slide'))
        : targets.findIndex((item) => item.section === target);
      if (targetIndex === -1) return;
      event.preventDefault();
      scrollToSection(targetIndex);
    });
  });

  setActiveSection(0);
}

export {
  initNavScroll,
  initSectionScroll,
};
