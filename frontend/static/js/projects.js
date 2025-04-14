document.addEventListener('DOMContentLoaded', () => {
    console.log('Projects.js initialized');
    initializeProjectsTab();
    setupProjectForm();
    setupCustomerForm();
    setupSearch();
});

function initializeProjectsTab() {
    // Load data when projects tab is shown
    const projectsTab = document.getElementById('projects-tab');
    if (projectsTab) {
        projectsTab.addEventListener('shown.bs.tab', () => {
            console.log('Projects tab activated');
            loadProjectsList();
            loadSoftwareList();
        });
    }
    // Also load initial data if we're starting on the projects tab
    if (document.querySelector('#projects.active')) {
        console.log('Initially on projects tab');
        loadProjectsList();
        loadSoftwareList();
    }
}

async function loadSoftwareList() {
    try {
        console.log('Loading software list...');
        const response = await fetch('/api/software');
        console.log('Software response:', response.status);
        const software = await response.json();
        console.log('Loaded software:', software);
        const select = document.getElementById('softwareSelect');
        
        software.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading software list:', error);
        alert('Error loading software list: ' + error.message);
    }
}

function setupProjectForm() {
    const form = document.getElementById('projectForm');
    if (!form) {
        console.error('Project form not found');
        return;
    }

    console.log('Setting up project form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Project form submitted');
        
        const projectData = {
            name: document.getElementById('projectName').value.trim(),
            description: document.getElementById('projectDescription').value.trim(),
            software_id: document.getElementById('softwareSelect')?.value,
            software_version: document.getElementById('softwareVersion')?.value
        };

        console.log('Project data:', projectData);

        if (!projectData.name) {
            alert('Project name is required');
            return;
        }

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(projectData)
            });

            console.log('Project creation response:', response.status);
            const data = await response.json();
            console.log('Project creation data:', data);

            if (response.ok) {
                form.reset();
                await loadProjectsList();
                alert('Project added successfully');
            } else {
                alert('Error adding project: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting project:', error);
            alert('Error adding project: ' + error.message);
        }
    });
}

function setupCustomerForm() {
    const form = document.getElementById('customerForm');
    if (!form) {
        console.error('Customer form not found');
        return;
    }

    console.log('Setting up customer form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Customer form submitted');
        
        const customerData = {
            name: document.getElementById('customerName').value.trim(),
            email: document.getElementById('customerEmail').value.trim(),
            contact_person: document.getElementById('contactPerson').value.trim()
        };

        console.log('Customer data:', customerData);

        if (!customerData.name) {
            alert('Customer name is required');
            return;
        }

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(customerData)
            });

            console.log('Customer creation response:', response.status);
            const data = await response.json();
            console.log('Customer creation data:', data);

            if (response.ok) {
                form.reset();
                await loadProjectsList(); // This will also refresh customers list
                alert('Customer added successfully');
            } else {
                alert('Error adding customer: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting customer:', error);
            alert('Error adding customer: ' + error.message);
        }
    });
}

async function loadProjectsList() {
    try {
        console.log('Loading projects and customers...');
        const [projectsResponse, customersResponse] = await Promise.all([
            fetch('/api/projects'),
            fetch('/api/customers')
        ]);
        
        console.log('Projects response:', projectsResponse.status);
        console.log('Customers response:', customersResponse.status);
        
        const projects = await projectsResponse.json();
        const customers = await customersResponse.json();
        
        console.log('Loaded projects:', projects);
        console.log('Loaded customers:', customers);
        
        displayProjects(projects, customers);
    } catch (error) {
        console.error('Error loading projects and customers:', error);
        alert('Error loading projects and customers: ' + error.message);
    }
}

function displayProjects(projects, customers) {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'card project-card mb-4';
        
        const releasesList = project.releases.map(release => `
            <div class="release-item">
                <span>
                    <strong>${release.version}</strong>
                    <span class="text-muted ms-2">${new Date(release.release_date).toLocaleDateString()}</span>
                </span>
                <div class="btn-group">
                    <button onclick="editRelease(${project.id}, ${release.id})" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deleteRelease(${release.id})" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const customersList = project.customers.map(customer => `
            <div class="customer-item">
                <span>
                    <strong>${customer.name}</strong>
                    ${customer.email ? `<span class="text-muted ms-2">${customer.email}</span>` : ''}
                </span>
                <button onclick="removeCustomerFromProject(${project.id}, ${customer.id})" 
                    class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `).join('');

        const availableCustomers = customers.filter(customer => 
            !project.customers.some(pc => pc.id === customer.id)
        );

        const customerOptions = availableCustomers.map(customer =>
            `<option value="${customer.id}">${customer.name}</option>`
        ).join('');

        projectCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h4 class="card-title mb-1">${project.name}</h4>
                        <p class="text-muted">${project.description || 'No description'}</p>
                        ${project.software ? `
                        <div class="software-info">
                            <strong>Software:</strong> ${project.software.name}<br>
                            <strong>Version:</strong> ${project.software_version || project.software.latest_version}
                        </div>
                        ` : ''}
                    </div>
                    <div class="btn-group">
                        <button onclick="editProject(${project.id})" class="btn btn-outline-primary">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button onclick="deleteProject(${project.id})" class="btn btn-outline-danger">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="releases-section">
                    <h5 class="mb-3">
                        <i class="bi bi-tags me-2"></i>
                        Releases
                    </h5>
                    <div class="releases-list mb-3">
                        ${releasesList || '<p class="text-muted">No releases yet</p>'}
                    </div>
                    <div class="add-release-form">
                        <input type="text" class="form-control" id="version-${project.id}" 
                            placeholder="Version number">
                        <textarea class="form-control" id="notes-${project.id}" 
                            placeholder="Release notes"></textarea>
                        <button onclick="addRelease(${project.id})" class="btn btn-primary">
                            Add Release
                        </button>
                    </div>
                </div>

                <div class="customers-section">
                    <h5 class="mb-3">
                        <i class="bi bi-people me-2"></i>
                        Customers
                    </h5>
                    <div class="customers-list mb-3">
                        ${customersList || '<p class="text-muted">No customers assigned</p>'}
                    </div>
                    <div class="add-customer-to-project">
                        <select class="form-select" id="customer-select-${project.id}">
                            <option value="">Select customer...</option>
                            ${customerOptions}
                        </select>
                        <button onclick="addCustomerToProject(${project.id})" 
                            class="btn btn-primary">
                            Add Customer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        projectsList.appendChild(projectCard);
    });
}

function setupSearch() {
    const projectSearch = document.getElementById('projectSearch');
    if (projectSearch) {
        projectSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

async function addRelease(projectId) {
    const version = document.getElementById(`version-${projectId}`).value;
    const notes = document.getElementById(`notes-${projectId}`).value;
    
    if (!version) {
        alert('Please enter a version number');
        return;
    }

    try {
        const response = await fetch(`/api/projects/${projectId}/releases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ version, notes })
        });

        console.log('Add release response:', response.status);

        if (response.ok) {
            await loadProjectsList();
            alert('Release added successfully');
        } else {
            alert('Error adding release');
        }
    } catch (error) {
        console.error('Error adding release:', error);
        alert('Error adding release: ' + error.message);
    }
}

async function deleteRelease(releaseId) {
    if (!confirm('Are you sure you want to delete this release?')) {
        return;
    }

    try {
        const response = await fetch(`/api/releases/${releaseId}`, {
            method: 'DELETE'
        });

        console.log('Delete release response:', response.status);

        if (response.ok) {
            await loadProjectsList();
            alert('Release deleted successfully');
        } else {
            alert('Error deleting release');
        }
    } catch (error) {
        console.error('Error deleting release:', error);
        alert('Error deleting release: ' + error.message);
    }
}

async function addCustomerToProject(projectId) {
    const selectElement = document.getElementById(`customer-select-${projectId}`);
    const customerId = selectElement.value;
    
    if (!customerId) {
        alert('Please select a customer');
        return;
    }

    try {
        const response = await fetch(`/api/projects/${projectId}/customers/${customerId}`, {
            method: 'POST'
        });

        console.log('Add customer to project response:', response.status);

        if (response.ok) {
            await loadProjectsList();
            alert('Customer added to project successfully');
        } else {
            alert('Error adding customer to project');
        }
    } catch (error) {
        console.error('Error adding customer to project:', error);
        alert('Error adding customer to project: ' + error.message);
    }
}

async function removeCustomerFromProject(projectId, customerId) {
    if (!confirm('Are you sure you want to remove this customer from the project?')) {
        return;
    }

    try {
        const response = await fetch(`/api/projects/${projectId}/customers/${customerId}`, {
            method: 'DELETE'
        });

        console.log('Remove customer from project response:', response.status);

        if (response.ok) {
            await loadProjectsList();
            alert('Customer removed from project successfully');
        } else {
            alert('Error removing customer from project');
        }
    } catch (error) {
        console.error('Error removing customer from project:', error);
        alert('Error removing customer from project: ' + error.message);
    }
}

async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE'
        });

        console.log('Delete project response:', response.status);

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

function editProject(id) {
    // TODO: Implement edit functionality
    console.log('Edit project:', id);
}

function editRelease(projectId, releaseId) {
    // TODO: Implement edit functionality
    console.log('Edit release:', releaseId, 'for project:', projectId);
}