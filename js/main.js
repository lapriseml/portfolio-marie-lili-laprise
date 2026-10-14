// Initialisation des données, des interactions et des transitions entre les pages de contenu du site (charge les projets, instancie les modules de navigation, gère le changement de vue entre la page d'accueil et la fiche détail d'un projet)
import { loadProjects, getProjects } from './data.js';
import { buildProjectCards, fillDetail, loadVideo } from './components/projects.js';
import { initNavScroll, initSectionScroll } from './components/nav.js';
import { runHyperspace } from './components/hyperspace.js';

// Affiche une page donnée en masquant les autres, mode d'affichage principalement géré par classe CSS .active sur chaque page
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

// Ouvre un projet en déclenchant l'animation hyperspace, callback utilisé pour assurer que l'animation est terminée avant de charger le détail
function openProject(id) {
  runHyperspace(() => {
    fillDetail(id);
    showPage('detail');
  });
}

// Revient à la page d'accueil et recentre la vue sur la section des projets
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

// Charge les projets, initialise les composants interactifs et ouvre la page d'accueil (routine de démarrage du portfolio)
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
