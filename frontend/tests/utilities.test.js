import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import * as utilitiesModule from '../static/js/utilities.js';

describe('Utilities Management', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <form id="softwareImportForm">
                <input type="file" id="softwareFile" />
            </form>
            <form id="projectsImportForm">
                <input type="file" id="projectsFile" />
            </form>
            <form id="ithcImportForm">
                <input type="file" id="ithcFile" />
            </form>
            <button id="downloadSoftwareTemplate">Download Software Template</button>
            <button id="downloadProjectTemplate">Download Project Template</button>
            <button id="downloadITHCTemplate">Download ITHC Template</button>
        `;

        // Mock fetch responses
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ imported: 5, updated: 2 })
        }));
    });

    test('handleImport processes file upload correctly', async () => {
        const form = document.getElementById('softwareImportForm');
        
        await utilitiesModule.handleImport(form, '/api/software/import', 'Software');

        const lastCall = fetch.mock.calls[fetch.mock.calls.length - 1];
        expect(lastCall[0]).toBe('/api/software/import');
        expect(lastCall[1].method).toBe('POST');
        expect(lastCall[1].body).toBeTruthy();
        expect(typeof lastCall[1].body.append).toBe('function');
    });

    test('handleImport handles API errors gracefully', async () => {
        const error = new Error('Network error');
        global.fetch = jest.fn().mockRejectedValue(error);
        const form = document.getElementById('softwareImportForm');
        
        await utilitiesModule.handleImport(form, '/api/software/import', 'Software');

        expect(global.console.error).toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
    });

    test('downloadTemplate fetches and downloads template', async () => {
        const blob = new Blob(['test content'], { type: 'application/vnd.ms-excel' });
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            blob: () => Promise.resolve(blob)
        });

        await utilitiesModule.downloadTemplate('/api/templates/software', 'software_template.xlsx');

        expect(fetch).toHaveBeenCalledWith('/api/templates/software');
        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('downloadTemplate handles download errors gracefully', async () => {
        const error = new Error('Download failed');
        global.fetch = jest.fn().mockRejectedValue(error);
        
        await utilitiesModule.downloadTemplate('/api/templates/software', 'software_template.xlsx');

        expect(global.console.error).toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
    });
});