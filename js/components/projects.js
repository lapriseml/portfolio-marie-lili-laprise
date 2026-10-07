// Gestion des cartes projets, détail, galerie, vidéo et projets liés

import { getProjects, getProjectById, setCurrentProject, getCurrentProject } from '../data.js';

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

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

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
  setText('detail-meta-cat', p.category);
  setText('detail-duration', p.duration);
  setText('detail-year', p.year);
  setText('detail-desc-label', '// Description du projet');

  const detailDescEl = document.getElementById('detail-desc');
  if (detailDescEl) detailDescEl.innerHTML = p.description;

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
      prevBtn.style.borderColor = p.accent;
      prevBtn.style.boxShadow = `inset 0 0 0 1px ${p.accent}66, 0 0 20px ${p.accent}25`;
      prevBtn.style.background = `linear-gradient(135deg, ${p.accent}25, rgba(255,255,255,.06))`;
    }
    if (nextBtn) {
      nextBtn.style.borderColor = p.accent;
      nextBtn.style.boxShadow = `inset 0 0 0 1px ${p.accent}66, 0 0 20px ${p.accent}25`;
      nextBtn.style.background = `linear-gradient(135deg, ${p.accent}25, rgba(255,255,255,.06))`;
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

  if (videoBlock && (!p.videoId || !String(p.videoId).trim())) {
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

function loadVideo() {
  const p = getCurrentProject();
  if (!p || !p.videoId || !String(p.videoId).trim()) return;

  const wrap = document.getElementById('video-wrap');
  if (wrap) {
    wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${p.videoId}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }
}

export {
  buildProjectCards,
  fillDetail,
  loadVideo,
};
