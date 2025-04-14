// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    if (document.getElementById('projectsList')) {
        loadProjects();
        setupProjectForm();
        setupCustomerForm();
    }
}

async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        displayProjects(projects);
        loadCustomers();
    } catch (error) {
        console.error('Error loading projects:', error);
        alert('Error loading projects: ' + error.message);
    }
}

function displayProjects(projects, customers = []) {
    const tbody = document.getElementById('projectsList');
    tbody.innerHTML = '';

    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No projects found</td></tr>';
        return;
    }

    projects.forEach(project => {
        const row = document.createElement('tr');
        const version = project.software_version ? project.software_version : 'N/A';
        row.innerHTML = `
            <td>${project.name}</td>
            <td>${project.description || ''}</td>
            <td>${version}</td>
            <td>
                ${project.customers?.map(c => c.name).join(', ') || ''}
                <button onclick="addCustomer(${project.id})" class="btn btn-sm btn-outline-primary ms-2">
                    <i class="bi bi-plus"></i>
                </button>
            </td>
            <td>
                <div class="btn-group">
                    <button onclick="editProject(${project.id})" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deleteProject(${project.id})" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button onclick="addRelease(${project.id})" class="btn btn-sm btn-outline-success">
                        <i class="bi bi-tag"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function addRelease(projectId) {
    try {
        const version = document.getElementById(`version-${projectId}`).value;
        const notes = document.getElementById(`notes-${projectId}`).value;

        const response = await fetch(`/api/projects/${projectId}/releases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version,
                notes
            })
        });

        if (response.ok) {
            alert('Release added successfully');
            loadProjects();
        } else {
            throw new Error('Failed to add release');
        }
    } catch (error) {
        console.error('Error adding release:', error);
        alert('Error adding release: ' + error.message);
    }
}

function setupProjectForm() {
    const form = document.getElementById('projectForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('projectName').value,
            description: document.getElementById('projectDescription').value,
            software_version: document.getElementById('projectVersion').value
        };

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                form.reset();
                loadProjects();
                alert('Project added successfully');
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add project');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding project: ' + error.message);
        }
    });
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
            loadProjects();
            alert('Project deleted successfully');
        } else {
            throw new Error('Failed to delete project');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting project: ' + error.message);
    }
}

async function loadCustomers() {
    try {
        const response = await fetch('/api/customers');
        const customers = await response.json();
        displayCustomers(customers);
    } catch (error) {
        console.error('Error loading customers:', error);
        alert('Error loading customers: ' + error.message);
    }
}

function displayCustomers(customers) {
    const tbody = document.getElementById('customersList');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No customers found</td></tr>';
        return;
    }

    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.email || ''}</td>
            <td>${customer.contact_person || ''}</td>
            <td>
                <div class="btn-group">
                    <button onclick="editCustomer(${customer.id})" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deleteCustomer(${customer.id})" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupCustomerForm() {
    const form = document.getElementById('customerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('customerName').value,
            email: document.getElementById('customerEmail').value,
            contact_person: document.getElementById('contactPerson').value
        };

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                form.reset();
                loadCustomers();
                alert('Customer added successfully');
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add customer');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding customer: ' + error.message);
        }
    });
}

async function addCustomer(projectId) {
    // Implementation for adding customer to project
    console.log('Adding customer to project:', projectId);
}

async function editProject(id) {
    try {
        const response = await fetch(`/api/projects/${id}`);
        const project = await response.json();
        
        // Fill form with existing data
        document.getElementById('editProjectName').value = project.name;
        document.getElementById('editProjectVersion').value = project.software_version || '';
        document.getElementById('editProjectDescription').value = project.description || '';
        document.getElementById('editProjectId').value = id;
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
        modal.show();
        
        // Setup save button handler
        document.getElementById('saveProjectEdit').onclick = async () => {
            const formData = {
                name: document.getElementById('editProjectName').value,
                software_version: document.getElementById('editProjectVersion').value,
                description: document.getElementById('editProjectDescription').value
            };
            
            try {
                const response = await fetch(`/api/projects/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    modal.hide();
                    loadProjects();
                    alert('Project updated successfully');
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to update project');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error updating project: ' + error.message);
            }
        };
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading project details: ' + error.message);
    }
}

// Expose functions to global scope
window.editProject = editProject;
window.deleteProject = deleteProject;
window.addRelease = addRelease;
window.addCustomer = addCustomer;

// Export functions for testing
export {
    loadProjects,
    displayProjects,
    addRelease,
    setupProjectForm,
    deleteProject,
    loadCustomers,
    displayCustomers,
    setupCustomerForm,
    addCustomer,
    initializeApp,
    editProject
};