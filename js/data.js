// Stocke les données du portfolio et gère le chargement du JSON de projets

const state = {
  projects: [],
  currentProject: null,
};

// Récupère la liste des projets depuis le fichier JSON, charge les données au démarrage pour alimenter la grille, le détail et les autres projets
async function loadProjects() {
  try {
    const response = await fetch('data/projects.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    state.projects = await response.json();
    return state.projects;
  } catch (error) {
    // En cas d'erreur réseau ou d'un fichier manquant, on garde une liste vide pour éviter de faire planter l'initialisation du portfolio et on affiche un message explicite dans la console
    console.error('Could not load projects.json:', error);
    state.projects = [];
    return [];
  }
}

// Retourne tous les projets actuellement chargés dans le state, source unique de vérité pour les composants qui affichent des cartes, des liens ou un détail de projet
function getProjects() {
  return state.projects;
}

// Récupère un projet spécifique grâce à son index/id dans le tableau
function getProjectById(id) {
  return state.projects[id];
}

// Enregistre le projet actif pour que les composants de détail puissent l'utiliser
function setCurrentProject(project) {
  state.currentProject = project;
  return project;
}

// Retourne le projet actuellement sélectionné pour afficher ses détails
function getCurrentProject() {
  return state.currentProject;
}

export {
  loadProjects,
  getProjects,
  getProjectById,
  setCurrentProject,
  getCurrentProject,
};
