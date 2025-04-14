document.addEventListener('DOMContentLoaded', () => {
    loadProjectsList();
    setupProjectForm();
    setupCustomerForm();
    setupSearch();
});

function setupProjectForm() {
    const form = document.getElementById('projectForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const projectData = {
            name: document.getElementById('projectName').value,
            description: document.getElementById('projectDescription').value
        };

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
                loadProjectsList();
            } else {
                alert('Error adding project');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding project');
        }
    });
}

function setupCustomerForm() {
    const form = document.getElementById('customerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const customerData = {
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
                body: JSON.stringify(customerData)
            });

            if (response.ok) {
                form.reset();
                loadProjectsList(); // Refresh to show new customer in lists
            } else {
                alert('Error adding customer');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding customer');
        }
    });
}

async function loadProjectsList() {
    try {
        const [projectsResponse, customersResponse] = await Promise.all([
            fetch('/api/projects'),
            fetch('/api/customers')
        ]);
        
        const projects = await projectsResponse.json();
        const customers = await customersResponse.json();
        
        displayProjects(projects, customers);
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading projects and customers');
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

        if (response.ok) {
            loadProjectsList();
        } else {
            alert('Error adding release');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding release');
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

        if (response.ok) {
            loadProjectsList();
        } else {
            alert('Error deleting release');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting release');
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

        if (response.ok) {
            loadProjectsList();
        } else {
            alert('Error adding customer to project');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding customer to project');
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

        if (response.ok) {
            loadProjectsList();
        } else {
            alert('Error removing customer from project');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error removing customer from project');
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

        if (response.ok) {
            loadProjectsList();
        } else {
            alert('Error deleting project');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting project');
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