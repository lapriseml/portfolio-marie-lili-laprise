// Navigation et scroll des sections

// Initialisation du nav (desktop) et menu burger (mobile) et gestion scroll
function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  // Quand on scroll, nav = scrolled, fond = plus opaque et ombre pour lisibilité
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // Menu burger s'ouvre et se ferme + liens
  const mobileMenu = document.querySelector('.mobile-menu');
  const toggle = mobileMenu?.querySelector('.mobile-menu__toggle');
  const links = mobileMenu?.querySelector('.burger-menu_links');
  if (!toggle || !links) return;

  // Le bouton du burger contrôle aria-expanded true = ouvert, false = fermé, met à jour le aria-label et l'état visuel du conteneur pour garder la logique du DOM et de l'accessibilité cohérente
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';

    // On inverse l'état actuel pour passer de ouvert à fermé et vice versa
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');

    // Le conteneur des liens est masqué fermé
    links.hidden = isOpen;
    mobileMenu.classList.toggle('is-open', !isOpen);
  });

  // En cliquant sur un lien, ça ferme le panneau
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu');
      links.hidden = true;
      mobileMenu.classList.remove('is-open');
    });
  });
}

// Scroll section par section
function initSectionScroll() {
  const home = document.getElementById('page-home');
  const sections = Array.from(document.querySelectorAll('#hero, #projects, #skills, #contact'));
  if (!home || !sections.length) return;

  // Sur mobile, les cartes compétences sont séparées en deux sections
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const skillSlide = document.querySelector('#skills .skills-mobile-slide');
  const aboutSlide = document.querySelector('#skills .about-mobile-slide');
  const targets = isMobile && skillSlide && aboutSlide
    ? [
        { element: sections[0], section: sections[0] },
        { element: sections[1], section: sections[1] },
        { element: skillSlide, section: sections[2] },
        { element: aboutSlide, section: sections[2] },
        { element: sections[3], section: sections[3] }
      ]
    : sections.map((section) => ({ element: section, section }));

  let currentIndex = 0;
  let isAnimating = false;
  let animationId = 0;
  home.style.scrollSnapType = 'none';
  home.style.scrollBehavior = 'auto';

  // Met à jour la section active et applique la classe CSS correspondante
  const setActiveSection = (index) => {
    currentIndex = index;
    sections.forEach((section) => section.classList.remove('active-section'));
    targets.forEach((target, i) => target.element.classList.toggle('active-section', i === index));
    targets[index].section.classList.add('active-section');
  };

  // Calcule le centre d'une section pour comparer sa position avec celle du viewport
  const getTargetCenter = (target) => {
    const homeRect = home.getBoundingClientRect();
    const targetRect = target.element.getBoundingClientRect();
    return targetRect.top - homeRect.top + home.scrollTop + targetRect.height / 2;
  };

  // Détecte automatiquement la section la plus proche du centre de la vue actuelle
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

  // Anime le scroll vers une section cible pour obtenir un mouvement doux et contrôlé
  const scrollToSection = (index) => {
    if (index < 0 || index >= targets.length || isAnimating) return;

    const target = targets[index];
    const targetTop = Math.min(
      Math.max(0, getTargetCenter(target) - home.clientHeight / 2),
      home.scrollHeight - home.clientHeight
    );
    const startTop = home.scrollTop;
    const startTime = performance.now();
    const animationDuration = 900;
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

  // Écouteurs d'événements pour le scroll et le toucher
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

  // Les liens internes de la page déclenchent un déplacement animé vers la section cible
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      const targetIndex = targets.findIndex((item) => item.section === target);
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
