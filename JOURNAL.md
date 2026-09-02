## IA

### 2026-09-02
- **Outil:** *Copilot (VSCODE)*
- **Prompt:** *with a gsap animation, i want the .home to take full screen at first, then first h1 comes from the left to the middle, then second h1 comes from the right to the middle (to end up beside the first h1) then first h2 comes from the bottom to the middle (to end up under the 2 h1) and then the second h2 to appear (opacity 0 to 100) and end up under the first h2*
- **Résultat:**
  // Register ScrollTrigger only if it's loaded to avoid reference errors
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    console.warn('ScrollTrigger plugin not loaded; continuing without it.');
  }
  
  // Entrance timeline for the hero headings
  // Hide scroll until animation completes
  document.body.style.overflow = "hidden";
  
  const headings = document.querySelectorAll('.h1-1, .h1-2, .h2-1, .h2-2');
  if (!headings || headings.length === 0) {
    console.warn('Hero headings not found — skipping entrance animation.');
    document.body.style.overflow = 'auto';
  } else {
    console.log('Starting hero entrance animation');
    const tl = gsap.timeline({defaults:{ease: "power3.out"}});
  
    tl.from(".h1-1", {x: -window.innerWidth * 0.5, duration: 1})
      .from(".h1-2", {x: window.innerWidth * 0.5, duration: 1}, "-=.6")
      .fromTo(".h2-1", {y: 200, opacity: 0}, {y: 0, opacity: 1, duration: 0.8}, "-=0.2")
      .fromTo(".h2-2", {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.6}, "-=0.2")
      .call(() => {
        document.body.style.overflow = "auto";
        document.scrollingElement.scrollTo(0, 0);
        console.log('Hero entrance animation complete');
      });
  }
