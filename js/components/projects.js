// Cartes projets, détail, galerie, vidéo et autres projets (transforme les données JSON en interface interactive et remplit les zones dynamiques du DOM)

import { getProjects, getProjectById, setCurrentProject, getCurrentProject } from '../data.js';

let processRevealObserver;

// Construit la grille des cartes de projets depuis les données chargées, chaque carte contient un aperçu visuel, le titre, la catégorie et les tags correspondant au projet
function buildProjectCards() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const projects = getProjects();
  grid.innerHTML = projects.map((p) => `
    <div class="project-mobile-slide">
      <article class="project-card" data-tone="${p.tone}" tabindex="0" role="button" aria-label="Voir le projet ${p.title}" onclick="openProject(${p.id})" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProject(${p.id}); }">
        <div class="card-media">
          <img src="${p.cover}" alt="${p.title}" loading="lazy" />
          <div class="card-year">${p.year}</div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${p.title}</h3>
          <div class="card-label ${p.tone === 'violet' ? 'alt' : ''}">${p.category}</div>
          <div class="card-tags">
            ${p.tags.map((t) => `<span class="tag ${p.tone === 'violet' ? 'alt' : ''}">${t}</span>`).join('')}
          </div>
        </div>
      </article>
    </div>
  `).join('');
}

// Met à jour le contenu textuel d'un élément du DOM en fonction de son identifiant
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Remplit le panneau de détail d'un projet avec ses informations, ses images et ses étapes,prend un id de projet, lit les données du JSON, puis injecte le contenu dans la vue de détail ainsi que dans la galerie et les autres sections associées
function fillDetail(id) {
  const p = getProjectById(id);
  if (!p) return;

  setCurrentProject(p);
  const tone = p.tone === 'violet';

  const coverEl = document.getElementById('detail-cover');
  if (coverEl) {
    coverEl.src = p.cover;
    coverEl.alt = `Image de couverture du projet ${p.title}`;
  }

  const overlayEl = document.getElementById('detail-overlay');
  if (overlayEl) {
    overlayEl.style.background = `linear-gradient(to top,#06040a 0%,rgba(6,4,10,.4) 50%,transparent 100%),linear-gradient(135deg,${tone ? 'rgba(124,58,237,.25)' : 'rgba(192,57,43,.25)'},transparent)`;
  }

  const navCatEl = document.getElementById('detail-nav-cat');
  const navYearEl = document.getElementById('detail-nav-year');
  if (navCatEl) {
    navCatEl.textContent = p.title;
    navCatEl.style.color = p.accent;
  }
  if (navYearEl) navYearEl.textContent = p.year;

  const catEl = document.getElementById('detail-cat');
  if (catEl) {
    catEl.textContent = p.category;
    catEl.style.color = p.accent;
  }

  setText('detail-title', p.title);
  setText('detail-cadre', p.cadre);
  setText('detail-equipe', p.equipe);
  setText('detail-meta-cat', p.category);
  setText('detail-duration', p.duration);
  setText('detail-year', p.year);
  setText('detail-desc-label', '// Description du projet');

  const detailDescEl = document.getElementById('detail-desc');
  if (detailDescEl) detailDescEl.innerHTML = p.description;

  const playEl = document.getElementById('detail-play');
  const playLinkEl = document.getElementById('detail-play-link');
  if (playEl && playLinkEl) {
    const hasGameLink = Boolean(p.gameUrl);
    playEl.hidden = !hasGameLink;
    if (hasGameLink) playLinkEl.href = p.gameUrl;
  }

  setText('detail-tech-label', '// Technologies');

  const tagsEl = document.getElementById('detail-tags');
  if (tagsEl) {
    tagsEl.innerHTML = p.tags.map((t) => `<span class="tag ${p.tone === 'violet' ? 'alt' : ''}">${t}</span>`).join('');
  }

  const mainImg = document.getElementById('gallery-img');
  const thumbsEl = document.getElementById('gallery-thumbs');
  const counter = document.getElementById('gallery-counter');
  const prevBtn = document.querySelector('.gallery-prev');
  const nextBtn = document.querySelector('.gallery-next');
  let active = 0;

  // Gère le changement de photo dans la galerie en mettant à jour l'image principale, le compteur et l'état actif des miniatures
  function setPhoto(index) {
    active = (index + p.gallery.length) % p.gallery.length;
    if (mainImg) {
      mainImg.src = p.gallery[active];
      mainImg.alt = `Image ${active + 1} de la galerie du projet ${p.title}`;
    }
    if (counter) counter.textContent = `${active + 1} / ${p.gallery.length}`;
    if (thumbsEl) {
      thumbsEl.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === active);
        thumb.style.borderColor = i === active ? p.accent : 'transparent';
      });
    }
    if (prevBtn) {
      prevBtn.style.color = p.accent;
    }
    if (nextBtn) {
      nextBtn.style.color = p.accent;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => setPhoto(active - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => setPhoto(active + 1));
  }

  if (thumbsEl) {
    thumbsEl.innerHTML = p.gallery.map((photo, i) => `
      <div class="gallery-thumb" data-i="${i}" role="button" tabindex="0" aria-label="Afficher la photo ${i + 1}" >
        <img src="${photo}" alt="Photo ${i + 1}" loading="lazy" />
      </div>
    `).join('');

    thumbsEl.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
      thumb.addEventListener('click', () => setPhoto(i));
      thumb.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setPhoto(i);
        }
      });
    });
  }

  setPhoto(0);

  const videoBlock = document.querySelector('.video-block');
  const videoWrap = document.getElementById('video-wrap');
  const videoSource = p.videoUrl || p.videoId;

  if (videoBlock && (!videoSource || !String(videoSource).trim())) {
    videoBlock.style.display = 'none';
  } else if (videoBlock) {
    videoBlock.style.display = '';

    const videoThumb = document.getElementById('video-thumb');
    if (videoThumb) {
      videoThumb.src = p.gallery[1] || p.cover;
      videoThumb.alt = `Aperçu de la vidéo du projet ${p.title}`;
    }

    if (videoWrap) {
      const poster = document.getElementById('video-poster');
      if (!poster) {
        videoWrap.innerHTML = `
          <div class="video-poster" id="video-poster" role="button" tabindex="0" aria-label="Lire la vidéo" onclick="loadVideo()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); loadVideo(); }">
            <img class="video-thumb" id="video-thumb" src="${p.gallery[1] || p.cover}" alt="Aperçu de la vidéo du projet ${p.title}" />
            <div class="video-overlay"></div>
            <div class="video-play"><svg width="28" height="28" viewBox="0 0 24 24" fill="#f0e8ff"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
        `;
      } else if (videoThumb) {
        videoThumb.src = p.gallery[1] || p.cover;
      }
    }
  }

  const processWrap = document.getElementById('process-wrap');
  const processSteps = document.getElementById('process-steps');
  if (processWrap && processSteps) {
    processWrap.hidden = !Array.isArray(p.process) || p.process.length === 0;
    processWrap.classList.remove('is-visible');
    processSteps.innerHTML = processWrap.hidden ? '' : p.process.map((step, index) => `
      <article class="process-step">
        <h3 class="process-step__title skill-label ${index === 1 ? 'alt' : ''}">${index + 1}. ${step.title}</h3>
        <div class="process-step__content">
          <div class="process-text-placeholder" aria-label="Espace réservé au texte">
            ${step.description || '<span>Espace réservé au texte</span>'}
          </div>
          ${Array.isArray(step.images) && step.images.length > 0 ? `
            <div class="process-images">
              ${step.images.map((image, imageIndex) => image
                ? `<img src="${image}" alt="${step.title}, image ${imageIndex + 1}" loading="lazy" />`
                : `<div class="process-image-placeholder" role="img" aria-label="Espace réservé à une image">Espace réservé à une image</div>`).join('')}
            </div>
          ` : ''}
        </div>
      </article>
    `).join('');

    if (processRevealObserver) processRevealObserver.disconnect();
    if (!processWrap.hidden) {
      // Apparition du bloc de processus, quand il devient visible, ajout d'une classe CSS pour déclencher une animation de révélation progressive
      processRevealObserver = new IntersectionObserver(([entry], observer) => {
        if (!entry.isIntersecting) return;
        processWrap.classList.add('is-visible');
        observer.disconnect();
      }, { threshold: .15 });
      processRevealObserver.observe(processWrap);
    }
  }

  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid) {
    const others = getProjects().filter((x) => x.id !== id);
    relatedGrid.innerHTML = others.map((r) => `
      <article class="related-card" data-tone="${r.tone}" tabindex="0" role="button" aria-label="Voir le projet ${r.title}" onclick="openProject(${r.id})" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProject(${r.id}); }">
        <div class="related-image"><img src="${r.cover}" alt="${r.title}" loading="lazy" /></div>
        <div class="related-body">
          <div class="related-cat ${r.tone === 'violet' ? 'alt' : ''}">${r.category}</div>
          <div class="related-title">${r.title}</div>
        </div>
      </article>
    `).join('');
  }
}

// Charge la vidéo d'un projet dans le conteneur prévu, en supportant YouTube, Vimeo et MP4 (car je n'étais pas sûre quel format j'allais choisir)
function loadVideo() {
  const p = getCurrentProject();
  const videoSource = p && (p.videoUrl || p.videoId);
  if (!videoSource || !String(videoSource).trim()) return;

  const wrap = document.getElementById('video-wrap');
  if (wrap) {
    const source = String(videoSource).trim();
    const vimeoMatch = source.match(/vimeo\.com\/(?:video\/)?(\d+)/i);

    if (vimeoMatch) {
      wrap.innerHTML = `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    } else if (/\.mp4(?:$|\?)/i.test(source)) {
      wrap.innerHTML = `<video controls autoplay playsinline><source src="${source}" type="video/mp4"></video>`;
    } else {
      wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(source)}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    }
  }
}

export {
  buildProjectCards,
  fillDetail,
  loadVideo,
};
