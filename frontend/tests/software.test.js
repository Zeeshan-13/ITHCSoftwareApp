import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import * as mainModule from '../static/js/main.js';
import * as ithcModule from '../static/js/ithc.js';

describe('Software Management', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="softwareTableBody"></div>
            <form id="softwareForm">
                <input id="name" />
                <input id="software_type" />
                <input id="latest_version" />
                <input id="check_url" />
            </form>
            <form id="importForm">
                <input type="file" id="excelFile" />
            </form>
            <input type="text" id="softwareSearch" />
        `;

        // Mock fetch responses
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
        }));

        // Mock alert and console.error
        global.alert = jest.fn();
        global.console.error = jest.fn();
        global.confirm = jest.fn(() => true);
    });

    test('displaySoftware renders software list correctly', () => {
        const softwareList = [{
            id: 1,
            name: 'Test Software',
            software_type: 'Test Type',
            latest_version: '1.0.0',
            last_updated: '2025-04-14T10:00:00',
            check_url: 'http://test.com'
        }];

        mainModule.displaySoftware(softwareList);

        const tbody = document.getElementById('softwareTableBody');
        expect(tbody.innerHTML).toContain('Test Software');
        expect(tbody.innerHTML).toContain('Test Type');
        expect(tbody.innerHTML).toContain('1.0.0');
        expect(tbody.innerHTML).toContain('http://test.com');
    });

    test('setupForm handles form submission correctly', async () => {
        const formData = {
            name: 'Test Software',
            software_type: 'Test Type',
            latest_version: '1.0.0',
            check_url: 'http://test.com'
        };

        document.getElementById('name').value = formData.name;
        document.getElementById('software_type').value = formData.software_type;
        document.getElementById('latest_version').value = formData.latest_version;
        document.getElementById('check_url').value = formData.check_url;

        mainModule.setupForm();

        const form = document.getElementById('softwareForm');
        fireEvent.submit(form);

        expect(fetch).toHaveBeenCalledWith('/api/software', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
    });

    test('loadSoftwareList handles API error gracefully', async () => {
        const error = new Error('API Error');
        global.fetch.mockRejectedValueOnce(error);

        await mainModule.loadSoftwareList();

        expect(console.error).toHaveBeenCalled();
        expect(alert).toHaveBeenCalledWith('Error loading software list: API Error');
    });

    test('setupImportForm handles file upload correctly', async () => {
        const file = new File(['test content'], 'test.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const fileInput = document.getElementById('excelFile');
        Object.defineProperty(fileInput, 'files', {
            value: [file],
            writable: true
        });

        mainModule.setupImportForm();
        const form = document.getElementById('importForm');
        fireEvent.submit(form);

        const lastCall = fetch.mock.calls[fetch.mock.calls.length - 1];
        expect(lastCall[0]).toBe('/api/software/import');
        expect(lastCall[1].method).toBe('POST');
        expect(lastCall[1].body).toBeTruthy();
        expect(typeof lastCall[1].body.append).toBe('function');
    });
});

describe('ITHC Software Management', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="ithcTableBody"></div>
            <select id="projectSelect"></select>
            <select id="projectVersionSelect"></select>
            <select id="softwareSelect"></select>
            <input id="currentVersion" />
            <input id="latestVersion" />
            <button id="addITHCBtn">Add Software</button>
            <form id="ithcForm">
                <input id="ithcId" type="hidden" />
            </form>
            <div id="ithcModal"></div>
        `;

        // Mock fetch responses
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                id: 1,
                project_id: 1,
                software_id: 1,
                project_version: '1.0.0',
                current_software_version: '1.0.0'
            })
        }));

        // Mock bootstrap
        global.bootstrap = {
            Modal: jest.fn().mockImplementation(() => ({
                show: jest.fn(),
                hide: jest.fn()
            }))
        };
    });

    test('loadProjects fetches and displays projects correctly', async () => {
        global.fetch.mockImplementationOnce(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve([{
                id: 1,
                name: 'Test Project',
                software_version: '1.0.0'
            }])
        }));

        await ithcModule.loadProjects();

        expect(fetch).toHaveBeenCalledWith('/api/projects');
        const projectSelect = document.getElementById('projectSelect');
        expect(projectSelect.innerHTML).toContain('Test Project');
        expect(projectSelect.innerHTML).toContain('1.0.0');
    });

    test('displayITHCList renders entries correctly', () => {
        const ithcList = [{
            id: 1,
            software: {
                name: 'Test Software',
                latest_version: '2.0.0'
            },
            current_software_version: '1.0.0',
            updated_at: '2025-04-14T10:00:00'
        }];

        ithcModule.displayITHCList(ithcList);

        const tbody = document.getElementById('ithcTableBody');
        expect(tbody.innerHTML).toContain('Test Software');
        expect(tbody.innerHTML).toContain('1.0.0');
        expect(tbody.innerHTML).toContain('2.0.0');
    });
});