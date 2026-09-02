// Register ScrollTrigger only if it's loaded to avoid reference errors
if (window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
} else {
  console.warn('ScrollTrigger plugin not loaded; continuing without it.');
}

// Entrance timeline for the hero headings
// Hide scroll until animation completes
// Inverted entrance: start with Portfolio, then transform into the hero group
document.body.style.overflow = "hidden";

const port = document.querySelector('.hero-portfolio');
const group = document.querySelector('.hero-group');
const textFile = document.querySelector('.home .text-file');

// Proceed only if the hero group exists
if (!group) {
  console.warn('Hero group missing — aborting hero animation.');
  document.body.style.overflow = 'auto';
} else {
  // initial state: hide group until portfolio finishes
  group.style.display = 'none';
  if (textFile) { textFile.style.opacity = '0'; textFile.style.transform = 'translateY(20px)'; }

  const mainTl = gsap.timeline({defaults:{ease: 'power3.out'}});

  // If Portfolio exists, show it first then spiral it into the hero group
  if (port) {
    // make Portfolio appear slightly faster and then spin/scale out
    mainTl.fromTo(port, {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1, duration: 1.17})
      .to(port, {rotation: 1080, scale: 0.5, opacity: 0, duration: 1.3, ease: 'power4.in', delay: 0.26})
      .call(() => {
        port.style.display = 'none';
        group.style.display = 'block';
        // prepare hero items for their respective entrances
        gsap.set('.h2-1', {y: 200, opacity: 0});
        gsap.set('.h1-1', {x: -200, opacity: 0, y: -4});
        gsap.set('.h1-2', {x: 200, opacity: 0, y: -4});
      });
  } else {
    // no portfolio: reveal group immediately and set positions
    group.style.display = 'block';
    gsap.set('.h2-1', {y: 200, opacity: 0});
    gsap.set('.h1-1', {x: -200, opacity: 0, y: -4});
    gsap.set('.h1-2', {x: 200, opacity: 0, y: -4});
  }

  const spacing = Math.min(140, window.innerWidth * 0.14);

  // Continue the timeline with the requested strictly-sequential sequence
  mainTl.to('.h2-1', {y: 0, opacity: 1, duration: 1.17})
    // Marie-Lili starts only when Développeuse Web finished
    .to('.h1-1', {x: -spacing/2, y: '-2.5vw', opacity: 1, duration: 1.17})
    // Laprise starts only when Marie-Lili finished
    .to('.h1-2', {x: spacing/2, y: '-2.5vw', opacity: 1, duration: 1.17})
    .to({}, {duration: 0.52})
    .to('.hero-group', {y: '-22vh', duration: 1.17, ease: 'power2.out'})
    .call(() => {
      if (!textFile) return;
      const p = textFile.querySelector('p');
      if (!p) return;
      const text = p.textContent.trim();
      p.innerHTML = '';
      const frag = document.createDocumentFragment();
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        frag.appendChild(span);
      }
      p.appendChild(frag);
      // ensure starting hidden state for GSAP and force visibility in case of CSS conflicts
      textFile.style.display = 'block';
      textFile.style.visibility = 'visible';
      // debug info
      console.log('Text-file found, created spans:', p.querySelectorAll('span').length);
      gsap.set(textFile, {opacity: 0, y: 20});
    })
    .to(textFile, {opacity: 1, y: 0, duration: 0.45, ease: 'power2.out'})
    .to('.home .text-file p span', {opacity: 1, stagger: 0.03, duration: 0.03, ease: 'none'})
    .call(() => { document.body.style.overflow = 'auto'; });

}





var swiper = new Swiper(".mySwiper", {
    loop: true,
    navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
    },
});