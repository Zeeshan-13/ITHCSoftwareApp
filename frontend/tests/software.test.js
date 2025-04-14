import '@testing-library/jest-dom';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fireEvent } from '@testing-library/dom';

let dom;
let container;

describe('Software Management', () => {
    beforeEach(() => {
        // Create a fresh DOM for each test with all required elements
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
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
            </body>
            </html>
        `);
        global.document = dom.window.document;
        global.window = dom.window;
        container = document.body;

        // Mock fetch and other browser APIs
        global.fetch = jest.fn();
        global.alert = jest.fn();
        global.FormData = jest.fn(() => ({
            append: jest.fn()
        }));
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

        require('../static/js/main.js');
        window.displaySoftware(softwareList);

        const tbody = document.getElementById('softwareTableBody');
        expect(tbody.innerHTML).toContain('Test Software');
        expect(tbody.innerHTML).toContain('Test Type');
        expect(tbody.innerHTML).toContain('1.0.0');
        expect(tbody.innerHTML).toContain('http://test.com');
    });

    test('setupForm handles form submission correctly', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ id: 1, name: 'Test Software' })
        });

        require('../static/js/main.js');
        
        const form = document.getElementById('softwareForm');
        document.getElementById('name').value = 'Test Software';
        document.getElementById('software_type').value = 'Test Type';
        document.getElementById('latest_version').value = '1.0.0';
        document.getElementById('check_url').value = 'http://test.com';

        const event = new window.Event('submit');
        form.dispatchEvent(event);

        expect(fetch).toHaveBeenCalledWith('/api/software', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Software',
                software_type: 'Test Type',
                latest_version: '1.0.0',
                check_url: 'http://test.com'
            })
        });
    });

    test('filterSoftwareList filters correctly', () => {
        const softwareList = [{
            id: 1,
            name: 'Test Software',
            software_type: 'Test Type',
            latest_version: '1.0.0',
            last_updated: '2025-04-14T10:00:00',
            check_url: 'http://test.com'
        }];

        require('../static/js/main.js');
        window.displaySoftware(softwareList);
        window.filterSoftwareList('nonexistent');

        const tbody = document.getElementById('softwareTableBody');
        const rows = tbody.getElementsByTagName('tr');
        expect(rows[0].style.display).toBe('none');

        window.filterSoftwareList('test');
        expect(rows[0].style.display).toBe('');
    });

    test('setupImportForm handles file import correctly', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ imported: 2 })
        });

        require('../static/js/main.js');
        
        const form = document.getElementById('importForm');
        const fileInput = document.getElementById('excelFile');
        
        // Mock file input
        Object.defineProperty(fileInput, 'files', {
            value: [new File([''], 'test.xlsx')]
        });

        const event = new window.Event('submit');
        form.dispatchEvent(event);

        expect(fetch).toHaveBeenCalledWith('/api/software/import', {
            method: 'POST',
            body: expect.any(FormData)
        });
    });

    test('setupImportForm handles import error correctly', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error: 'Import failed' })
        });

        require('../static/js/main.js');
        
        const form = document.getElementById('importForm');
        const fileInput = document.getElementById('excelFile');
        
        Object.defineProperty(fileInput, 'files', {
            value: [new File([''], 'test.xlsx')]
        });

        const event = new window.Event('submit');
        form.dispatchEvent(event);

        await new Promise(process.nextTick); // Wait for async code
        expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
    });

    test('deleteSoftware shows confirmation and handles deletion', async () => {
        global.confirm = jest.fn(() => true);
        global.fetch.mockResolvedValueOnce({
            ok: true
        });

        require('../static/js/main.js');
        await window.deleteSoftware(1);

        expect(confirm).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledWith('/api/software/1', {
            method: 'DELETE'
        });
    });

    test('loadSoftwareList handles API error gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('API Error'));

        require('../static/js/main.js');
        await window.loadSoftwareList();

        expect(alert).toHaveBeenCalledWith('Error loading software list');
    });

    test('setupSearch initializes search functionality', () => {
        require('../static/js/main.js');
        
        const searchInput = document.getElementById('softwareSearch');
        const event = new window.Event('input');
        searchInput.value = 'test';
        searchInput.dispatchEvent(event);

        // Should not throw any errors
        expect(() => window.setupSearch()).not.toThrow();
    });
});

describe('Software Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="softwareList"></div>
      <form id="softwareForm">
        <input type="text" id="softwareName" />
        <input type="text" id="version" />
        <textarea id="description"></textarea>
        <input type="file" id="excelFile" />
        <button type="submit">Save</button>
      </form>
    `;
    
    // Mock fetch API
    global.fetch = jest.fn();
    global.FormData = jest.fn(() => ({
      append: jest.fn(),
    }));
  });

  test('should display software list correctly', async () => {
    const mockData = [
      { id: 1, name: 'Test Software', version: '1.0.0', description: 'Test Description' }
    ];
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    await window.loadSoftwareList();
    
    const softwareList = document.getElementById('softwareList');
    expect(softwareList.innerHTML).toContain('Test Software');
    expect(softwareList.innerHTML).toContain('1.0.0');
  });

  test('should handle form submission correctly', async () => {
    const form = document.getElementById('softwareForm');
    const nameInput = document.getElementById('softwareName');
    const versionInput = document.getElementById('version');
    const descInput = document.getElementById('description');
    
    nameInput.value = 'New Software';
    versionInput.value = '2.0.0';
    descInput.value = 'New Description';
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 2, name: 'New Software' })
    });
    
    fireEvent.submit(form);
    
    expect(fetch).toHaveBeenCalledWith('/api/software', expect.any(Object));
  });

  test('should handle Excel file upload', async () => {
    const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileInput = document.getElementById('excelFile');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'File uploaded successfully' })
    });
    
    fireEvent.change(fileInput);
    
    expect(fetch).toHaveBeenCalledWith('/api/software/import', expect.any(Object));
  });

  test('should handle errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    global.console.error = jest.fn();
    
    await window.loadSoftwareList();
    
    expect(console.error).toHaveBeenCalled();
  });
});