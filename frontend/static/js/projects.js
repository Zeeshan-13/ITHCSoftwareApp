document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupProjectForm();
    setupCustomerForm();
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
                loadProjects();
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
                loadProjects(); // Refresh to show new customer in lists
            } else {
                alert('Error adding customer');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding customer');
        }
    });
}

async function loadProjects() {
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
        const projectDiv = document.createElement('div');
        projectDiv.className = 'project-card';
        
        const releasesList = project.releases.map(release => `
            <li class="release-item">
                ${release.version} (${new Date(release.release_date).toLocaleDateString()})
                <button onclick="deleteRelease(${release.id})" class="delete-btn small">Delete</button>
            </li>
        `).join('');

        const customersList = project.customers.map(customer => `
            <li class="customer-item">
                ${customer.name}
                <button onclick="removeCustomerFromProject(${project.id}, ${customer.id})" class="delete-btn small">Remove</button>
            </li>
        `).join('');

        const availableCustomers = customers.filter(customer => 
            !project.customers.some(pc => pc.id === customer.id)
        );

        const customerOptions = availableCustomers.map(customer =>
            `<option value="${customer.id}">${customer.name}</option>`
        ).join('');

        projectDiv.innerHTML = `
            <h3>${project.name}</h3>
            <p>${project.description || 'No description'}</p>
            
            <div class="releases-section">
                <h4>Releases</h4>
                <ul class="releases-list">${releasesList}</ul>
                <div class="add-release-form">
                    <input type="text" id="version-${project.id}" placeholder="Version number">
                    <textarea id="notes-${project.id}" placeholder="Release notes"></textarea>
                    <button onclick="addRelease(${project.id})">Add Release</button>
                </div>
            </div>

            <div class="customers-section">
                <h4>Customers</h4>
                <ul class="customers-list">${customersList}</ul>
                <div class="add-customer-to-project">
                    <select id="customer-select-${project.id}">
                        <option value="">Select customer...</option>
                        ${customerOptions}
                    </select>
                    <button onclick="addCustomerToProject(${project.id})">Add Customer to Project</button>
                </div>
            </div>

            <button onclick="deleteProject(${project.id})" class="delete-btn">Delete Project</button>
        `;
        
        projectsList.appendChild(projectDiv);
    });
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
            loadProjects();
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
            loadProjects();
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
            loadProjects();
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
            loadProjects();
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
            loadProjects();
        } else {
            alert('Error deleting project');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting project');
    }
}