document.addEventListener('DOMContentLoaded', () => {
    loadProjectsList();
    setupProjectForm();
    setupSearch();
    setupEditHandlers();
});

async function loadProjectsList() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        alert('Error loading projects: ' + error.message);
    }
}

function displayProjects(projects) {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';

    if (projects.length === 0) {
        projectsList.innerHTML = '<p class="text-muted text-center">No projects found</p>';
        return;
    }

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'card project-card mb-3';
        
        projectCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h4 class="card-title mb-1">${project.name}</h4>
                        <p class="text-muted mb-1">Version: ${project.software_version || 'N/A'}</p>
                        <p class="mb-0">${project.description || 'No description'}</p>
                    </div>
                    <div class="btn-group">
                        <button onclick="editProject(${project.id})" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button onclick="deleteProject(${project.id})" class="btn btn-sm btn-outline-danger">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        projectsList.appendChild(projectCard);
    });
}

function setupProjectForm() {
    const form = document.getElementById('projectForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const projectData = {
            name: document.getElementById('projectName').value.trim(),
            description: document.getElementById('projectDescription').value.trim(),
            software_version: document.getElementById('projectVersion').value.trim()
        };

        if (!projectData.name) {
            alert('Project name is required');
            return;
        }

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                form.reset();
                await loadProjectsList();
                alert('Project added successfully');
            } else {
                const data = await response.json();
                alert('Error adding project: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting project:', error);
            alert('Error adding project: ' + error.message);
        }
    });
}

function setupSearch() {
    const searchInput = document.getElementById('projectSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

function setupEditHandlers() {
    document.getElementById('saveProjectEdit').addEventListener('click', saveProjectChanges);
}

async function editProject(id) {
    try {
        const response = await fetch(`/api/projects/${id}`);
        const project = await response.json();
        
        document.getElementById('editProjectId').value = project.id;
        document.getElementById('editProjectName').value = project.name;
        document.getElementById('editProjectVersion').value = project.software_version || '';
        document.getElementById('editProjectDescription').value = project.description || '';
        
        const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading project details:', error);
        alert('Error loading project details: ' + error.message);
    }
}

async function saveProjectChanges() {
    const projectId = document.getElementById('editProjectId').value;
    const projectData = {
        name: document.getElementById('editProjectName').value.trim(),
        description: document.getElementById('editProjectDescription').value.trim(),
        software_version: document.getElementById('editProjectVersion').value.trim()
    };

    if (!projectData.name) {
        alert('Project name is required');
        return;
    }

    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
            modal.hide();
            await loadProjectsList();
            alert('Project updated successfully');
        } else {
            const data = await response.json();
            alert('Error updating project: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating project:', error);
        alert('Error updating project: ' + error.message);
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadProjectsList();
            alert('Project deleted successfully');
        } else {
            alert('Error deleting project');
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project: ' + error.message);
    }
}