// Navigation et comportement de scroll

function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

function initSectionScroll() {
  const home = document.getElementById('page-home');
  const sections = Array.from(document.querySelectorAll('#hero, #projects, #skills, #contact'));
  if (!home || !sections.length) return;

  let currentIndex = 0;
  let isAnimating = false;
  let lastWheelTime = 0;

  const setActiveSection = (index) => {
    currentIndex = index;
    sections.forEach((section, i) => section.classList.toggle('active-section', i === index));
  };

  const updateActiveSection = () => {
    const closestIndex = sections.reduce((bestIndex, section, index) => {
      const currentDistance = Math.abs(section.offsetTop - home.scrollTop);
      const bestDistance = Math.abs(sections[bestIndex].offsetTop - home.scrollTop);
      return currentDistance < bestDistance ? index : bestIndex;
    }, 0);
    setActiveSection(closestIndex);
  };

  const scrollToSection = (index) => {
    if (index < 0 || index >= sections.length || isAnimating) return;
    const target = sections[index];
    isAnimating = true;
    home.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    setActiveSection(index);
    setTimeout(() => {
      isAnimating = false;
      updateActiveSection();
    }, 700);
  };

  home.addEventListener('scroll', updateActiveSection, { passive: true });
  home.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    const now = Date.now();
    if (now - lastWheelTime < 700) return;
    lastWheelTime = now;
    const nextIndex = event.deltaY > 0 ? currentIndex + 1 : currentIndex - 1;
    scrollToSection(nextIndex);
  }, { passive: false });

  setActiveSection(0);
}

export {
  initNavScroll,
  initSectionScroll,
};
