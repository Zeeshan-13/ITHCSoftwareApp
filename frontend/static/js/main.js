document.addEventListener('DOMContentLoaded', () => {
    loadSoftwareList();
    loadProjectsList();
    setupForm();
    setupImportForm();
    setupSearch();
});

function setupSearch() {
    const softwareSearch = document.getElementById('softwareSearch');
    const projectSearch = document.getElementById('projectSearch');

    softwareSearch?.addEventListener('input', (e) => {
        filterSoftwareList(e.target.value.toLowerCase());
    });

    projectSearch?.addEventListener('input', (e) => {
        filterProjectsList(e.target.value.toLowerCase());
    });
}

function filterSoftwareList(searchTerm) {
    const rows = document.querySelectorAll('#softwareTableBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function filterProjectsList(searchTerm) {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function setupForm() {
    const form = document.getElementById('softwareForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const softwareData = {
            name: document.getElementById('name').value,
            software_type: document.getElementById('software_type').value,
            latest_version: document.getElementById('latest_version').value,
            check_url: document.getElementById('check_url').value
        };

        try {
            const response = await fetch('/api/software', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(softwareData)
            });

            if (response.ok) {
                form.reset();
                loadSoftwareList();
            } else {
                alert('Error adding software');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding software');
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

async function loadSoftwareList() {
    try {
        const response = await fetch('/api/software');
        const software = await response.json();
        displaySoftware(software);
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading software list');
    }
}

function displaySoftware(softwareList) {
    const tbody = document.getElementById('softwareTableBody');
    tbody.innerHTML = '';

    softwareList.forEach(software => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${software.name}</td>
            <td>${software.software_type}</td>
            <td>${software.latest_version}</td>
            <td>${new Date(software.last_updated).toLocaleString()}</td>
            <td><a href="${software.check_url}" target="_blank" class="text-decoration-none">${software.check_url}</a></td>
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

function editSoftware(id) {
    // TODO: Implement edit functionality
    console.log('Edit software:', id);
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