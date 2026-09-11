gsap.registerPlugin(ScrollTrigger);

/* ─── Data ─────────────────────────────────────────────────────────────── */
let PROJECTS = [];

async function loadProjects() {
  try {
    const response = await fetch("projects.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    PROJECTS = await response.json();
    buildProjectCards();
    initContactOrb();
    initReveal();
    initNavScroll();
    initSectionScroll();
    showPage("home");
  } catch (error) {
    console.error("Could not load projects.json:", error);
    document.getElementById("projects-grid").innerHTML = `
      <div class="project-card" style="grid-column:1/-1; padding:2rem; text-align:center;">
        Impossible de charger les projets. Vérifiez que le fichier <strong>projects.json</strong> est présent et servi via un serveur local.
      </div>`;
  }
}

/* ─── Active project (for loadVideo) ───────────────────────────────────── */
let _currentProject = null;

/* ─── Render home project cards ────────────────────────────────────────── */
function buildProjectCards() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  grid.innerHTML = PROJECTS.map(p => `
    <div class="project-card ${p.eye === "windu" ? "windu" : ""}" onclick="openProject(${p.id})">
      <div class="card-img">
        <img src="${p.cover}" alt="${p.title}" loading="lazy"/>
        <div class="card-overlay"><div class="card-overlay-btn">Voir le projet</div></div>
        <div class="card-year">${p.year}</div>
      </div>
      <div class="card-body">
        <div class="card-cat ${p.eye === "windu" ? "windu" : ""}">${p.category}</div>
        <h3 class="card-title">${p.title}</h3>
        <div class="card-tags">
          ${p.tags.map(t => `<span class="tag ${p.eye === "windu" ? "windu" : ""}">${t}</span>`).join("")}
        </div>
      </div>
    </div>`).join("");
}

/* ─── Fill detail page ─────────────────────────────────────────────────── */
function fillDetail(id) {
  const p = PROJECTS[id];
  _currentProject = p;
  const col = p.accent;
  const isSith = p.eye === "sith";

  // hero
  const coverEl = document.getElementById("detail-cover");
  if (coverEl) { coverEl.src = p.cover; coverEl.alt = p.title; }

  const overlayEl = document.getElementById("detail-overlay");
  if (overlayEl) overlayEl.style.background =
    `linear-gradient(to top,#06040a 0%,rgba(6,4,10,.4) 50%,transparent 100%),`
    + `linear-gradient(135deg,${isSith ? "rgba(192,57,43,.25)" : "rgba(124,58,237,.25)"},transparent)`;

  // nav bar
  const navCatEl = document.getElementById("detail-nav-cat");
  const navYearEl = document.getElementById("detail-nav-year");
  const navEyeEl = document.getElementById("detail-nav-eye");
  if (navCatEl) { navCatEl.textContent = p.title; navCatEl.style.color = col; }
  if (navYearEl) navYearEl.textContent = p.year;
  if (navEyeEl) navEyeEl.innerHTML = miniEye(p.eye, col);

  // hero content
  const catEl = document.getElementById("detail-cat");
  if (catEl) { catEl.textContent = p.category; catEl.style.color = col; }
  setText("detail-title", p.title);
  setText("detail-tagline", p.tagline);

  // eye badge
  const badgeEl = document.getElementById("detail-eye-badge");
  if (badgeEl) badgeEl.innerHTML = eyeSVG(p.eye, 72);

  // meta band
  setText("detail-cadre", p.cadre);
  setText("detail-meta-cat", p.category);
  setText("detail-duration", p.duration);
  setText("detail-year", p.year);

  // body
  setText("detail-desc-label", "// Description du projet");
  const detailDescEl = document.getElementById("detail-desc");
  if (detailDescEl) detailDescEl.innerHTML = p.description;
  // challenge / result
  const challengeLabelEl = document.getElementById("detail-challenge-label");
  if (challengeLabelEl) { challengeLabelEl.textContent = "Défi"; challengeLabelEl.style.color = col; }
  setText("detail-challenge", p.challenge);
  const resultLabelEl = document.getElementById("detail-result-label");
  if (resultLabelEl) { resultLabelEl.textContent = "Résultat"; resultLabelEl.style.color = col; }
  setText("detail-result", p.result);
  // challenge / result end
  setText("detail-tech-label", "// Technologies");

  // tags
  const tagsEl = document.getElementById("detail-tags");
  if (tagsEl) tagsEl.innerHTML = p.tags.map(t =>
    `<span class="tag ${p.eye === "windu" ? "windu" : ""}">${t}</span>`).join("");

  // gallery
  const mainImg = document.getElementById("gallery-img");
  const thumbsEl = document.getElementById("gallery-thumbs");
  const counter = document.getElementById("gallery-counter");
  let current = 0;

  function setPhoto(i) {
    current = i;
    if (mainImg) mainImg.src = p.gallery[i];
    if (counter) counter.textContent = `${i + 1} / ${p.gallery.length}`;
    if (thumbsEl) thumbsEl.querySelectorAll(".gallery-thumb").forEach((t, j) => {
      t.classList.toggle("active", j === i);
      t.style.borderColor = j === i ? col : "transparent";
    });
  }

  if (thumbsEl) {
    thumbsEl.innerHTML = p.gallery.map((ph, i) => `
      <div class="gallery-thumb" data-i="${i}">
        <img src="${ph}" alt="Photo ${i+1}" loading="lazy"/>
      </div>`).join("");
    thumbsEl.querySelectorAll(".gallery-thumb").forEach((el, i) => {
      el.addEventListener("click", () => setPhoto(i));
    });
  }
  setPhoto(0);

  // video poster
  const videoThumb = document.getElementById("video-thumb");
  if (videoThumb) videoThumb.src = p.gallery[1] || p.cover;
  setText("video-caption", p.videoCaption);

  // reset video-wrap to poster state (in case previously played)
  const videoWrap = document.getElementById("video-wrap");
  if (videoWrap) {
    const poster = document.getElementById("video-poster");
    if (!poster) {
      videoWrap.innerHTML = `
        <div class="video-poster" id="video-poster" onclick="loadVideo()">
          <img class="video-poster-img" id="video-thumb" src="${p.gallery[1] || p.cover}" alt=""/>
          <div class="video-poster-overlay"></div>
          <div class="video-play-btn"><svg width="28" height="28" viewBox="0 0 24 24" fill="#f0e8ff"><path d="M8 5v14l11-7z"/></svg></div>
          <span class="video-label">Lancer la vidéo</span>
        </div>`;
    } else {
      if (videoThumb) videoThumb.src = p.gallery[1] || p.cover;
    }
  }

  // related
  const relatedGrid = document.getElementById("related-grid");
  if (relatedGrid) {
    const others = PROJECTS.filter(x => x.id !== id).slice(0, 3);
    relatedGrid.innerHTML = others.map(r => `
      <div class="related-card ${r.eye === "windu" ? "windu" : ""}" onclick="openProject(${r.id})">
        <div class="related-img"><img src="${r.cover}" alt="${r.title}" loading="lazy"/></div>
        <div class="related-body">
          <div class="related-cat ${r.eye === "windu" ? "windu" : ""}">${r.category}</div>
          <div class="related-title">${r.title}</div>
        </div>
      </div>`).join("");
  }
}

/* ─── Load video ───────────────────────────────────────────────────────── */
function loadVideo() {
  const p = _currentProject;
  if (!p) return;
  const wrap = document.getElementById("video-wrap");
  if (wrap) wrap.innerHTML =
    `<iframe src="https://www.youtube.com/embed/${p.videoId}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function miniEye(type, col) {
  return `<svg width="14" height="14" viewBox="0 0 100 100" style="margin-right:.35rem">
    <circle cx="50" cy="50" r="48" fill="${type === "windu" ? "#1a083a" : "#1a0505"}" stroke="${col}" stroke-width="1"/>
    <circle cx="50" cy="50" r="${type === "windu" ? "6" : "10"}" fill="${col}" opacity=".9"/>
  </svg>`;
}

function eyeSVG(type, size) {
  if (type === "windu") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
      <defs><radialGradient id="bg-w${size}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1a0830"/><stop offset="100%" stop-color="#06040a"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill="url(#bg-w${size})" stroke="#7c3aed" stroke-width=".5" opacity=".4"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#7c3aed" stroke-width=".4" opacity=".5"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#7c3aed" stroke-width=".4" opacity=".4"/>
      <circle cx="50" cy="50" r="18" fill="none" stroke="#7c3aed" stroke-width=".35" opacity=".35"/>
      <circle cx="50" cy="50" r="12" fill="#120520" stroke="#7c3aed" stroke-width=".5" opacity=".7"/>
      <circle cx="50" cy="50" r="6" fill="#7c3aed" opacity=".9"/>
      <line x1="50" y1="2" x2="50" y2="20" stroke="#7c3aed" stroke-width=".5" opacity=".4"/>
      <line x1="50" y1="80" x2="50" y2="98" stroke="#7c3aed" stroke-width=".5" opacity=".4"/>
      <line x1="2" y1="50" x2="20" y2="50" stroke="#7c3aed" stroke-width=".5" opacity=".4"/>
      <line x1="80" y1="50" x2="98" y2="50" stroke="#7c3aed" stroke-width=".5" opacity=".4"/>
    </svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
    <defs><radialGradient id="bg-s${size}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2d0a0a"/><stop offset="100%" stop-color="#06040a"/></radialGradient></defs>
    <circle cx="50" cy="50" r="48" fill="url(#bg-s${size})" stroke="#c0392b" stroke-width=".5" opacity=".4"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#c0392b" stroke-width=".4" opacity=".6"/>
    <circle cx="50" cy="50" r="28" fill="none" stroke="#c0392b" stroke-width=".3" opacity=".5"/>
    <circle cx="50" cy="50" r="18" fill="#1a0505" stroke="#c0392b" stroke-width=".5" opacity=".7"/>
    <circle cx="50" cy="50" r="8" fill="#c0392b" opacity=".9"/>
    <ellipse cx="50" cy="50" rx="5" ry="2" fill="#06040a" opacity=".7"/>
    <line x1="50" y1="2" x2="50" y2="20" stroke="#c0392b" stroke-width=".5" opacity=".35"/>
    <line x1="50" y1="80" x2="50" y2="98" stroke="#c0392b" stroke-width=".5" opacity=".35"/>
    <line x1="2" y1="50" x2="20" y2="50" stroke="#c0392b" stroke-width=".5" opacity=".35"/>
    <line x1="80" y1="50" x2="98" y2="50" stroke="#c0392b" stroke-width=".5" opacity=".35"/>
  </svg>`;
}

/* ─── Hyperspace ───────────────────────────────────────────────────────── */
const HS_DURATION = 1900;
const HS_STARS = 520;

function runHyperspace(cb) {
  const canvas = document.getElementById("hyperspace");
  canvas.style.display = "block";
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const cx = canvas.width / 2, cy = canvas.height / 2;

  const stars = Array.from({ length: HS_STARS }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist: Math.random() * 80 + 20,
    speed: Math.random() * 5 + 3,
    size: Math.random() * 1.5 + 0.3,
    color: Math.random() > 0.15 ? "#ffffff" : (Math.random() > 0.5 ? "#c8c8ff" : "#e8e8e8"),
  }));

  let navigated = false;
  const state = { progress: 0 };

  function render(progress) {
    const t = Math.min(progress, 1);
    const fadeStart = 0.6;
    const dissolveT = t > fadeStart ? (t - fadeStart) / (1 - fadeStart) : 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(6,4,10,${0.92 - dissolveT * 0.92})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
      s.dist += s.speed * (1 + t * 4);
      const x = cx + Math.cos(s.angle) * s.dist;
      const y = cy + Math.sin(s.angle) * s.dist;
      const len = Math.min(18 + t * 30, s.dist - 2);
      const x0 = cx + Math.cos(s.angle) * (s.dist - len);
      const y0 = cy + Math.sin(s.angle) * (s.dist - len);
      const alpha = Math.max(0, 1 - dissolveT * 1.4);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = s.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      ctx.lineWidth = s.size;
      ctx.stroke();
    });

    if (!navigated && t >= 0.6) {
      navigated = true;
      cb();
    }
  }

  gsap.to(state, {
    progress: 1,
    duration: HS_DURATION / 1000,
    ease: "none",
    onUpdate: () => render(state.progress),
    onComplete: () => {
      setTimeout(() => { canvas.style.display = "none"; }, 100);
    }
  });
}

/* ─── Navigation ───────────────────────────────────────────────────────── */
function showPage(name) {
  const nav = document.getElementById("main-nav");
  if (nav) nav.style.display = name === "home" ? "" : "none";

  document.documentElement.style.scrollBehavior = "auto";
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById("page-" + name);
  if (target) target.classList.add("active");
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = "";
  });
}

function openProject(id) {
  runHyperspace(() => {
    fillDetail(id);
    showPage("detail");
  });
}

function goBack() {
  showPage("home");
}

/* ─── Scroll reveals ───────────────────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
}

function initContactOrb() {
  const source = document.querySelector("#hero .orb-root");
  const target = document.querySelector(".contact-orb");
  if (!source || !target) return;

  const orb = source.cloneNode(true);
  const gradient = orb.querySelector("#rg0");
  const gradientCircle = orb.querySelector('[fill="url(#rg0)"]');
  if (gradient && gradientCircle) {
    gradient.id = "rg-contact";
    gradientCircle.setAttribute("fill", "url(#rg-contact)");
  }
  target.appendChild(orb);
}

/* ─── Nav scroll tint ──────────────────────────────────────────────────── */
function initNavScroll() {
  const nav = document.getElementById("main-nav");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });
}

/* ─── Section change on scroll ───────────────────────────────────────────── */
function initSectionScroll() {
  const home = document.getElementById("page-home");
  const sections = Array.from(document.querySelectorAll("#hero, #projets, #competences, #contact"));
  if (!home || !sections.length) return;

  let currentIndex = 0;
  let isAnimating = false;
  let lastWheelTime = 0;

  const setActiveSection = (index) => {
    currentIndex = index;
    sections.forEach((section, i) => {
      section.classList.toggle("active-section", i === index);
    });
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
    home.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    setActiveSection(index);

    setTimeout(() => {
      isAnimating = false;
      updateActiveSection();
    }, 700);
  };

  home.addEventListener("scroll", updateActiveSection, { passive: true });
  home.addEventListener("wheel", (event) => {
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

/* ─── Expose globals ───────────────────────────────────────────────────── */
window.openProject = openProject;
window.goBack = goBack;
window.loadVideo = loadVideo;

/* ─── Init ─────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
});
