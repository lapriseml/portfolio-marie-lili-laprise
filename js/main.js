import { loadProjects, getProjects } from './data.js';
import { buildProjectCards, fillDetail, loadVideo } from './components/projects.js';
import { initNavScroll, initSectionScroll } from './components/nav.js';
import { runHyperspace } from './components/orbs.js';

function showPage(name) {
  const nav = document.getElementById('main-nav');
  if (nav) nav.style.display = name === 'home' ? '' : 'none';

  document.documentElement.style.overflowY = 'auto';
  document.body.style.overflowY = 'auto';
  document.documentElement.style.scrollBehavior = 'auto';
  document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));

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

function openProject(id) {
  runHyperspace(() => {
    fillDetail(id);
    showPage('detail');
  });
}

function goBack() {
  showPage('home');

  const home = document.getElementById('page-home');
  const projectsSection = document.getElementById('projects');
  if (home && projectsSection) {
    requestAnimationFrame(() => {
      home.scrollTo({ top: projectsSection.offsetTop, behavior: 'smooth' });
    });
  }
}

async function initializePortfolio() {
  const projects = await loadProjects();

  if (!projects.length) {
    const grid = document.getElementById('projects-grid');
    if (grid) {
      grid.innerHTML = '<div class="project-card" style="grid-column:1/-1;padding:2rem;text-align:center;">Impossible de charger les projets.</div>';
    }
    return;
  }

  buildProjectCards();
  initNavScroll();
  initSectionScroll();
  showPage('home');
}

window.openProject = openProject;
window.goBack = goBack;
window.loadVideo = loadVideo;

document.addEventListener('DOMContentLoaded', () => {
  initializePortfolio();
});

export { showPage, openProject, goBack, initializePortfolio };

