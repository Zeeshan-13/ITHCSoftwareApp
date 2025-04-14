// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupImportForms();
    setupTemplateDownloads();
});

function setupImportForms() {
    // Software Import
    document.getElementById('softwareImportForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleImport(e.target, '/api/software/import', 'Software');
    });

    // Projects Import
    document.getElementById('projectsImportForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleImport(e.target, '/api/projects/import', 'Projects');
    });

    // ITHC Import
    document.getElementById('ithcImportForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleImport(e.target, '/api/ithc/software/import', 'ITHC');
    });
}

async function handleImport(form, url, type) {
    try {
        const formData = new FormData(form);
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`${type} import successful!\n` + 
                  `Imported: ${result.imported}\n` + 
                  (result.updated ? `Updated: ${result.updated}\n` : '') +
                  (result.skipped ? `Skipped: ${result.skipped}` : ''));
            form.reset();
        } else {
            throw new Error(result.error || `Failed to import ${type.toLowerCase()}`);
        }
    } catch (error) {
        console.error(`Error importing ${type.toLowerCase()}:`, error);
        alert(`Error importing ${type.toLowerCase()}: ${error.message}`);
    }
}

function setupTemplateDownloads() {
    // Software Template
    document.getElementById('downloadSoftwareTemplate')?.addEventListener('click', () => {
        downloadTemplate('/api/templates/software', 'software_template.xlsx');
    });

    // Project Template
    document.getElementById('downloadProjectTemplate')?.addEventListener('click', () => {
        downloadTemplate('/api/templates/project', 'project_template.xlsx');
    });

    // ITHC Template
    document.getElementById('downloadITHCTemplate')?.addEventListener('click', () => {
        downloadTemplate('/api/templates/ithc', 'ithc_template.xlsx');
    });
}

async function downloadTemplate(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Template download failed');
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading template:', error);
        alert('Error downloading template: ' + error.message);
    }
}

// Export functions for testing
export {
    handleImport,
    downloadTemplate,
    setupImportForms,
    setupTemplateDownloads
};