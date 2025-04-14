// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    console.log('Document loaded, initializing app...');
    loadSoftwareList();
    setupForm();
    setupImportForm();
    setupCustomerImportForm();
    setupProjectImportForm();
    setupSoftwareSearch();
}

function setupSoftwareSearch() {
    const softwareSearch = document.getElementById('softwareSearch');
    if (softwareSearch) {
        softwareSearch.addEventListener('input', (e) => {
            filterSoftwareList(e.target.value.toLowerCase());
        });
    }
}

function filterSoftwareList(searchTerm) {
    const rows = document.querySelectorAll('#softwareTableBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function setupForm() {
    const form = document.getElementById('softwareForm');
    if (!form) {
        console.error('Software form not found in the DOM');
        return;
    }

    console.log('Setting up software form handler');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted');

        // Get form data
        const formData = {
            name: document.getElementById('name')?.value?.trim(),
            software_type: document.getElementById('software_type')?.value?.trim(),
            latest_version: document.getElementById('latest_version')?.value?.trim(),
            check_url: document.getElementById('check_url')?.value?.trim()
        };

        console.log('Form data:', formData);

        // Validate required fields
        if (!formData.name || !formData.software_type || !formData.latest_version) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            console.log('Sending POST request to /api/software');
            const response = await fetch('/api/software', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
            
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                form.reset();
                await loadSoftwareList();
                alert('Software added successfully');
            } else {
                alert('Error adding software: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error adding software: ' + error.message);
        }
    });
}

function setupImportForm() {
    const form = document.getElementById('importForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('excelFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/software/import', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Successfully imported ${result.imported} software entries`);
                form.reset();
                loadSoftwareList();
            } else {
                alert(result.error || 'Error importing software');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error importing software');
        }
    });
}

function setupCustomerImportForm() {
    const form = document.getElementById('importCustomersForm');
    if (!form) {
        console.error('Customer import form not found');
        return;
    }

    console.log('Setting up customer import form handler');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Customer import form submitted');
        
        const fileInput = document.getElementById('customerExcelFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Sending POST request to /api/customers/import');
            const response = await fetch('/api/customers/import', {
                method: 'POST',
                body: formData
            });

            console.log('Import response status:', response.status);
            const result = await response.json();
            console.log('Import response:', result);

            if (response.ok) {
                alert(`Successfully imported ${result.imported} customers and updated ${result.updated} existing customers`);
                form.reset();
            } else {
                alert(result.error || 'Error importing customers');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error importing customers: ' + error.message);
        }
    });
}

function setupProjectImportForm() {
    const form = document.getElementById('importProjectsForm');
    if (!form) {
        console.error('Project import form not found');
        return;
    }

    console.log('Setting up project import form handler');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Project import form submitted');
        
        const fileInput = document.getElementById('projectExcelFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Sending POST request to /api/projects/import');
            const response = await fetch('/api/projects/import', {
                method: 'POST',
                body: formData
            });

            console.log('Import response status:', response.status);
            const result = await response.json();
            console.log('Import response:', result);

            if (response.ok) {
                alert(`Successfully imported ${result.imported} projects, updated ${result.updated} existing projects, and skipped ${result.skipped} projects`);
                form.reset();
                // Refresh projects list if we're on the projects tab
                if (document.querySelector('#projects.active')) {
                    await loadProjectsList();
                }
            } else {
                alert(result.error || 'Error importing projects');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error importing projects: ' + error.message);
        }
    });
}

async function loadSoftwareList() {
    try {
        console.log('Fetching software list...');
        const response = await fetch('/api/software');
        console.log('Software list response status:', response.status);
        const software = await response.json();
        console.log('Received software list:', software);
        displaySoftware(software);
    } catch (error) {
        console.error('Error loading software list:', error);
        alert('Error loading software list: ' + error.message);
    }
}

function displaySoftware(softwareList) {
    console.log('Displaying software list:', softwareList);
    const tbody = document.getElementById('softwareTableBody');
    if (!tbody) {
        console.error('Could not find softwareTableBody element');
        return;
    }
    tbody.innerHTML = '';

    if (softwareList.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" class="text-center">No software entries found</td>';
        tbody.appendChild(emptyRow);
        return;
    }

    softwareList.forEach(software => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${software.name || ''}</td>
            <td>${software.software_type || ''}</td>
            <td>${software.latest_version || ''}</td>
            <td>${software.last_updated ? new Date(software.last_updated).toLocaleString() : ''}</td>
            <td>${software.check_url ? `<a href="${software.check_url}" target="_blank" class="text-decoration-none">${software.check_url}</a>` : ''}</td>
            <td>
                <div class="btn-group">
                    <button onclick="editSoftware(${software.id})" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deleteSoftware(${software.id})" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function editSoftware(id) {
    try {
        const response = await fetch(`/api/software/${id}`);
        const software = await response.json();
        
        // Fill form with existing data
        document.getElementById('name').value = software.name;
        document.getElementById('software_type').value = software.software_type;
        document.getElementById('latest_version').value = software.latest_version;
        document.getElementById('check_url').value = software.check_url || '';
        
        // Update form submit handler to handle edit
        const form = document.getElementById('softwareForm');
        const submitHandler = form.onsubmit;
        
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                software_type: document.getElementById('software_type').value.trim(),
                latest_version: document.getElementById('latest_version').value.trim(),
                check_url: document.getElementById('check_url').value.trim()
            };
            
            try {
                const response = await fetch(`/api/software/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    form.reset();
                    form.onsubmit = submitHandler;  // Restore original submit handler
                    await loadSoftwareList();
                    alert('Software updated successfully');
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to update software');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error updating software: ' + error.message);
            }
        };
    } catch (error) {
        console.error('Error loading software details:', error);
        alert('Error loading software details: ' + error.message);
    }
}

async function deleteSoftware(id) {
    if (!confirm('Are you sure you want to delete this software?')) {
        return;
    }

    try {
        const response = await fetch(`/api/software/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadSoftwareList();
        } else {
            alert('Error deleting software');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting software');
    }
}

// Expose functions to global scope
window.editSoftware = editSoftware;
window.deleteSoftware = deleteSoftware;

export {
    loadSoftwareList,
    displaySoftware,
    setupForm,
    setupImportForm,
    setupCustomerImportForm,
    setupProjectImportForm,
    setupSoftwareSearch,
    filterSoftwareList,
    deleteSoftware,
    initializeApp
};