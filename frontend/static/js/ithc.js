document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    if (document.getElementById('ithcForm')) {
        console.log('ITHC.js initialized');
        initializeITHC();
        setupEventListeners();
    }
}

function initializeITHC() {
    loadProjects();
    setupProjectVersionSelect();
    loadSoftwareList();
}

function setupEventListeners() {
    // Project selection change
    document.getElementById('projectSelect').addEventListener('change', handleProjectChange);
    
    // Version selection change
    document.getElementById('projectVersionSelect').addEventListener('change', handleVersionChange);
    
    // Add ITHC button click
    document.getElementById('addITHCBtn').addEventListener('click', () => {
        // Reset form and preserve current project and version selections
        const projectId = document.getElementById('projectSelect').value;
        const projectVersion = document.getElementById('projectVersionSelect').value;
        
        document.getElementById('ithcForm').reset();
        document.getElementById('ithcId').value = '';
        
        // Re-populate project and version if they were selected
        if (projectId && projectVersion) {
            document.getElementById('projectSelect').value = projectId;
            document.getElementById('projectVersionSelect').value = projectVersion;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('ithcModal'));
        modal.show();
    });
    
    // Software selection change
    document.getElementById('softwareSelect').addEventListener('change', handleSoftwareChange);
    
    // Save ITHC button click
    document.getElementById('saveITHC').addEventListener('click', saveITHC);
}

async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        
        const select = document.getElementById('projectSelect');
        select.innerHTML = '<option value="">Select Project...</option>';
        
        // Group projects by name for the dropdown
        const projectsByName = {};
        projects.forEach(project => {
            if (!projectsByName[project.name]) {
                projectsByName[project.name] = [];
            }
            projectsByName[project.name].push(project);
        });
        
        // Create optgroup for each project name with multiple versions
        Object.entries(projectsByName).forEach(([name, versions]) => {
            if (versions.length > 1) {
                const group = document.createElement('optgroup');
                group.label = name;
                versions.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = `${project.name} (${project.software_version || 'No version'})`;
                    group.appendChild(option);
                });
                select.appendChild(group);
            } else {
                // Single version projects don't need a group
                const option = document.createElement('option');
                option.value = versions[0].id;
                option.textContent = `${versions[0].name} ${versions[0].software_version ? `(${versions[0].software_version})` : ''}`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        alert('Error loading projects: ' + error.message);
    }
}

async function loadSoftwareList() {
    try {
        const softwareSelect = document.getElementById('softwareSelect');
        if (!softwareSelect) {
            console.warn('Software select element not found - not on ITHC page');
            return;
        }

        const response = await fetch('/api/software');
        const software = await response.json();
        
        softwareSelect.innerHTML = '<option value="">Select Software...</option>';
        
        software.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.name;
            option.dataset.latestVersion = s.latest_version;
            softwareSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading software list:', error);
        if (document.getElementById('softwareSelect')) {
            // Only show alert if we're actually on the ITHC page
            alert('Error loading software list: ' + error.message);
        }
    }
}

function setupProjectVersionSelect() {
    const select = document.getElementById('projectVersionSelect');
    select.innerHTML = '<option value="">Select Version...</option>';
    select.disabled = true;
    document.getElementById('addITHCBtn').disabled = true;
}

async function handleProjectChange(event) {
    const projectId = event.target.value;
    const versionSelect = document.getElementById('projectVersionSelect');
    
    if (!projectId) {
        setupProjectVersionSelect();
        return;
    }
    
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        const project = await response.json();
        
        versionSelect.innerHTML = '<option value="">Select Version...</option>';
        
        // First add the project's own version if it exists
        if (project.software_version) {
            const option = document.createElement('option');
            option.value = project.software_version;
            option.textContent = project.software_version;
            versionSelect.appendChild(option);
        }
        
        // Then add all release versions
        if (project.releases && project.releases.length > 0) {
            project.releases.forEach(release => {
                // Check if this version already exists in the dropdown
                if (!Array.from(versionSelect.options).some(opt => opt.value === release.version)) {
                    const option = document.createElement('option');
                    option.value = release.version;
                    option.textContent = release.version;
                    versionSelect.appendChild(option);
                }
            });
        }
        
        // If no versions available, add a default "No Version" option
        if (versionSelect.options.length === 1) {
            const option = document.createElement('option');
            option.value = "N/A";
            option.textContent = "No Version";
            versionSelect.appendChild(option);
        }
        
        // Enable version select but keep Add button disabled until version is selected
        versionSelect.disabled = false;
        document.getElementById('addITHCBtn').disabled = true;
        await loadITHCList();
    } catch (error) {
        console.error('Error loading project versions:', error);
        alert('Error loading project versions: ' + error.message);
    }
}

function handleVersionChange() {
    const projectId = document.getElementById('projectSelect').value;
    const version = document.getElementById('projectVersionSelect').value;
    
    // Only disable the Add button if we don't have both project and version
    document.getElementById('addITHCBtn').disabled = !projectId || !version;
    loadITHCList();
}

async function handleSoftwareChange(event) {
    const softwareSelect = event.target;
    const selectedOption = softwareSelect.options[softwareSelect.selectedIndex];
    
    if (selectedOption) {
        const latestVersion = selectedOption.dataset.latestVersion;
        document.getElementById('latestVersion').value = latestVersion || '';
    } else {
        document.getElementById('latestVersion').value = '';
    }
}

async function loadITHCList() {
    const projectId = document.getElementById('projectSelect').value;
    const version = document.getElementById('projectVersionSelect').value;
    
    if (!projectId || !version) {
        document.getElementById('ithcTableBody').innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`/api/ithc/software?project_id=${projectId}&project_version=${version}`);
        const ithcList = await response.json();
        
        displayITHCList(ithcList);
    } catch (error) {
        console.error('Error loading ITHC list:', error);
        alert('Error loading ITHC list: ' + error.message);
    }
}

function displayITHCList(ithcList) {
    const tbody = document.getElementById('ithcTableBody');
    tbody.innerHTML = '';
    
    if (ithcList.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">No software versions found</td>';
        tbody.appendChild(row);
        return;
    }
    
    ithcList.forEach(ithc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ithc.software.name}</td>
            <td>${ithc.current_software_version}</td>
            <td>${ithc.software.latest_version}</td>
            <td>${new Date(ithc.updated_at).toLocaleString()}</td>
            <td>
                <div class="btn-group">
                    <button onclick="editITHC(${ithc.id})" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deleteITHC(${ithc.id})" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function saveITHC() {
    const ithcId = document.getElementById('ithcId').value;
    const projectId = document.getElementById('projectSelect').value;
    const projectVersion = document.getElementById('projectVersionSelect').value;
    const softwareId = document.getElementById('softwareSelect').value;
    const currentVersion = document.getElementById('currentVersion').value;
    
    if (!projectId || !projectVersion || !softwareId || !currentVersion) {
        alert('Please fill in all required fields');
        return;
    }
    
    const data = {
        project_id: parseInt(projectId),
        software_id: parseInt(softwareId),
        project_version: projectVersion,
        current_software_version: currentVersion
    };
    
    try {
        const url = ithcId ? `/api/ithc/software/${ithcId}` : '/api/ithc/software';
        const method = ithcId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('ithcModal'));
            if (modal) {
                modal.hide();
            }
            // Reset the form but don't disable controls
            document.getElementById('ithcForm').reset();
            document.getElementById('ithcId').value = '';
            
            // Refresh the list without disabling controls
            await loadITHCList();
            
            // Keep the project and version selections
            document.getElementById('projectSelect').value = projectId;
            document.getElementById('projectVersionSelect').value = projectVersion;
            
            // Keep the Add button enabled if we have both project and version selected
            document.getElementById('addITHCBtn').disabled = false;
            
            alert(ithcId ? 'Software version updated successfully' : 'Software version added successfully');
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error saving ITHC:', error);
        alert('Error saving software version: ' + error.message);
    }
}

async function editITHC(id) {
    try {
        const response = await fetch(`/api/ithc/software/${id}`);
        const ithc = await response.json();
        
        document.getElementById('ithcId').value = ithc.id;
        document.getElementById('softwareSelect').value = ithc.software_id;
        document.getElementById('currentVersion').value = ithc.current_software_version;
        document.getElementById('latestVersion').value = ithc.software.latest_version;
        
        const modal = new bootstrap.Modal(document.getElementById('ithcModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading ITHC details:', error);
        alert('Error loading software version details: ' + error.message);
    }
}

async function deleteITHC(id) {
    if (!confirm('Are you sure you want to delete this software version?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/ithc/software/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadITHCList();
            alert('Software version deleted successfully');
        } else {
            throw new Error('Failed to delete software version');
        }
    } catch (error) {
        console.error('Error deleting ITHC:', error);
        alert('Error deleting software version: ' + error.message);
    }
}

// Expose functions to global scope
window.editITHC = editITHC;
window.deleteITHC = deleteITHC;

export {
    loadProjects,
    handleProjectChange,
    saveITHC,
    displayITHCList,
    editITHC,
    deleteITHC,
    handleVersionChange,
    handleSoftwareChange,
    loadITHCList,
    initializeITHC,
    setupEventListeners
};