// Données du portfolio et chargement du JSON

const state = {
  projects: [],
  currentProject: null,
};

async function loadProjects() {
  try {
    const response = await fetch('data/projects.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    state.projects = await response.json();
    return state.projects;
  } catch (error) {
    console.error('Could not load projects.json:', error);
    state.projects = [];
    return [];
  }
}

function getProjects() {
  return state.projects;
}

function getProjectById(id) {
  return state.projects[id];
}

function setCurrentProject(project) {
  state.currentProject = project;
  return project;
}

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
