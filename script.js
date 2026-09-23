// Données des projets chargées par JSON

let PROJECTS = [];
let currentProject = null;

async function loadProjects() {
  try {
    const response = await fetch('projects.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    PROJECTS = await response.json();
    buildProjectCards();
    initContactOrb();
    initNavScroll();
    initSectionScroll();
    showPage('home');
  } catch (error) {
    console.error('Could not load projects.json:', error);
    const grid = document.getElementById('projects-grid');
    if (grid) {
      grid.innerHTML = '<div class="project-card" style="grid-column:1/-1;padding:2rem;text-align:center;">Impossible de charger les projets.</div>';
    }
  }
}

// Créer cartes projets affichées

function buildProjectCards() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map(p => `
    <article class="project-card" data-tone="${p.tone}" onclick="openProject(${p.id})">
      <div class="card-media">
        <img src="${p.cover}" alt="${p.title}" loading="lazy" />
        <div class="card-year">${p.year}</div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${p.title}</h3>
        <div class="card-label ${p.tone === 'violet' ? 'alt' : ''}">${p.category}</div>
        <div class="card-tags">
          ${p.tags.map(t => `<span class="tag ${p.tone === 'violet' ? 'alt' : ''}">${t}</span>`).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

// Données des pages de chaque projet

function fillDetail(id) {
  const p = PROJECTS[id];
  if (!p) return;
  currentProject = p;
  const col = p.accent;
  const tone = p.tone === 'violet';

  const coverEl = document.getElementById('detail-cover');
  if (coverEl) { coverEl.src = p.cover; coverEl.alt = p.title; }

  const overlayEl = document.getElementById('detail-overlay');
  if (overlayEl) {
    overlayEl.style.background = `linear-gradient(to top,#06040a 0%,rgba(6,4,10,.4) 50%,transparent 100%),linear-gradient(135deg,${tone ? 'rgba(124,58,237,.25)' : 'rgba(192,57,43,.25)'},transparent)`;
  }

  const navCatEl = document.getElementById('detail-nav-cat');
  const navYearEl = document.getElementById('detail-nav-year');
  if (navCatEl) { navCatEl.textContent = p.title; navCatEl.style.color = col; }
  if (navYearEl) navYearEl.textContent = p.year;

  const catEl = document.getElementById('detail-cat');
  if (catEl) { catEl.textContent = p.category; catEl.style.color = col; }
  setText('detail-title', p.title);

  setText('detail-cadre', p.cadre);
  setText('detail-meta-cat', p.category);
  setText('detail-duration', p.duration);
  setText('detail-year', p.year);

  setText('detail-desc-label', '// Description du projet');
  const detailDescEl = document.getElementById('detail-desc');
  if (detailDescEl) detailDescEl.innerHTML = p.description;

  setText('detail-tech-label', '// Technologies');

  const tagsEl = document.getElementById('detail-tags');
  if (tagsEl) {
    tagsEl.innerHTML = p.tags.map(t => `<span class="tag ${p.tone === 'violet' ? 'alt' : ''}">${t}</span>`).join('');
  }

  const mainImg = document.getElementById('gallery-img');
  const thumbsEl = document.getElementById('gallery-thumbs');
  const counter = document.getElementById('gallery-counter');
  let active = 0;

  function setPhoto(index) {
    active = index;
    if (mainImg) mainImg.src = p.gallery[index];
    if (counter) counter.textContent = `${index + 1} / ${p.gallery.length}`;
    if (thumbsEl) {
      thumbsEl.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
        thumb.style.borderColor = i === index ? col : 'transparent';
      });
    }
  }

  if (thumbsEl) {
    thumbsEl.innerHTML = p.gallery.map((photo, i) => `
      <div class="gallery-thumb" data-i="${i}">
        <img src="${photo}" alt="Photo ${i + 1}" loading="lazy" />
      </div>
    `).join('');
    thumbsEl.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
      thumb.addEventListener('click', () => setPhoto(i));
    });
  }
  setPhoto(0);

  const videoBlock = document.querySelector('.video-block');
  const videoWrap = document.getElementById('video-wrap');

  if (videoBlock && (!p.videoId || !String(p.videoId).trim())) {
    videoBlock.style.display = 'none';
  } else if (videoBlock) {
    videoBlock.style.display = '';

    const videoThumb = document.getElementById('video-thumb');
    if (videoThumb) videoThumb.src = p.gallery[1] || p.cover;

    if (videoWrap) {
      const poster = document.getElementById('video-poster');
      if (!poster) {
        videoWrap.innerHTML = `
          <div class="video-poster" id="video-poster" onclick="loadVideo()">
            <img class="video-thumb" id="video-thumb" src="${p.gallery[1] || p.cover}" alt="" />
            <div class="video-overlay"></div>
            <div class="video-play"><svg width="28" height="28" viewBox="0 0 24 24" fill="#f0e8ff"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
        `;
      } else if (videoThumb) {
        videoThumb.src = p.gallery[1] || p.cover;
      }
    }
  }

  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid) {
    const others = PROJECTS.filter(x => x.id !== id).slice(0, 3);
    relatedGrid.innerHTML = others.map(r => `
      <article class="related-card" data-tone="${r.tone}" onclick="openProject(${r.id})">
        <div class="related-image"><img src="${r.cover}" alt="${r.title}" loading="lazy" /></div>
        <div class="related-body">
          <div class="related-cat ${r.tone === 'violet' ? 'alt' : ''}">${r.category}</div>
          <div class="related-title">${r.title}</div>
        </div>
      </article>
    `).join('');
  }
}

// Chargement vidéo YouTube

function loadVideo() {
  const p = currentProject;
  if (!p || !p.videoId || !String(p.videoId).trim()) return;
  const wrap = document.getElementById('video-wrap');
  if (wrap) wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${p.videoId}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
}

// Remplacer texte html par son id

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Animation hyperspace

const HS_DURATION = 1200;
const HS_STARS = 520;

function runHyperspace(cb) {
  const canvas = document.getElementById('hyperspace');
  if (!canvas) return cb();
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const stars = Array.from({ length: HS_STARS }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist: Math.random() * 80 + 20,
    speed: Math.random() * 5 + 3,
    size: Math.random() * 1.5 + 0.3,
    color: Math.random() > 0.15 ? '#ffffff' : (Math.random() > 0.5 ? '#c8c8ff' : '#e8e8e8')
  }));

  let moved = false;
  const state = { progress: 0 };

  function render(progress) {
    const t = Math.min(progress, 1);
    const fadeStart = 0.6;
    const dissolveT = t > fadeStart ? (t - fadeStart) / (1 - fadeStart) : 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(6,4,10,${0.92 - dissolveT * 0.92})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
      star.dist += star.speed * (1 + t * 4);
      const x = cx + Math.cos(star.angle) * star.dist;
      const y = cy + Math.sin(star.angle) * star.dist;
      const len = Math.min(18 + t * 30, star.dist - 2);
      const x0 = cx + Math.cos(star.angle) * (star.dist - len);
      const y0 = cy + Math.sin(star.angle) * (star.dist - len);
      const alpha = Math.max(0, 1 - dissolveT * 1.4);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = star.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = star.size;
      ctx.stroke();
    });

    if (!moved && t >= 0.6) {
      moved = true;
      cb();
    }
  }

  gsap.to(state, {
    progress: 1,
    duration: HS_DURATION / 1000,
    ease: 'none',
    onUpdate: () => render(state.progress),
    onComplete: () => setTimeout(() => { canvas.style.display = 'none'; }, 100)
  });
}

// Affichage de la page du projet

function showPage(name) {
  const nav = document.getElementById('main-nav');
  if (nav) nav.style.display = name === 'home' ? '' : 'none';

  document.documentElement.style.overflowY = 'auto';
  document.body.style.overflowY = 'auto';
  document.documentElement.style.scrollBehavior = 'auto';
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));

  const target = document.getElementById('page-' + name);
  if (target) target.classList.add('active');

  if (name === 'home') {
    const home = document.getElementById('page-home');
    if (home) home.scrollTop = 0;
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = ''; });
}

// Ouvre un projet avec hyperspace

function openProject(id) {
  runHyperspace(() => {
    fillDetail(id);
    showPage('detail');
  });
}

// Retour à la section projets

function goBack() {
  showPage('home');

  const projectsSection = document.getElementById('projects');
  if (projectsSection) {
    projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Clone l'orb hero pour contact

function initContactOrb() {
  const source = document.querySelector('#hero .orb');
  const target = document.querySelector('.contact-orb');
  if (!source || !target) return;

  const orb = source.cloneNode(true);
  const grad = orb.querySelector('#rg0');
  const fill = orb.querySelector('[fill="url(#rg0)"]');
  if (grad && fill) {
    grad.id = 'rg-contact';
    fill.setAttribute('fill', 'url(#rg-contact)');
  }
  target.appendChild(orb);
}

// Ajouter état "scrolled" à la nav quand on scroll

function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30), { passive: true });
}

// Défilement section par section

function initSectionScroll() {
  const home = document.getElementById('page-home');
  const sections = Array.from(document.querySelectorAll('#hero, #projects, #skills, #contact'));
  if (!home || !sections.length) return;

  let currentIndex = 0;
  let isAnimating = false;
  let lastWheelTime = 0;

  const setActiveSection = index => {
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

  const scrollToSection = index => {
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
  home.addEventListener('wheel', event => {
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

// Fonctions boutons HTML et onclick

window.openProject = openProject;
window.goBack = goBack;
window.loadVideo = loadVideo;

// Démarrage du chargement des données lorsque la page est prête

document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
});

