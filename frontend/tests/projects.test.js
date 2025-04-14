import '@testing-library/jest-dom';
import { JSDOM } from 'jsdom';
import { fireEvent, screen } from '@testing-library/dom';

let dom;
let container;

describe('Project Management', () => {
    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="projectsList"></div>
                <form id="projectForm">
                    <input id="projectName" />
                    <textarea id="projectDescription"></textarea>
                </form>
                <form id="customerForm">
                    <input id="customerName" />
                    <input id="customerEmail" />
                    <input id="contactPerson" />
                </form>
            </body>
            </html>
        `);
        global.document = dom.window.document;
        global.window = dom.window;
        container = document.body;

        // Mock fetch and other browser APIs
        global.fetch = jest.fn();
        global.alert = jest.fn();
    });

    test('displayProjects renders projects list correctly', () => {
        const projectsList = [{
            id: 1,
            name: 'Test Project',
            description: 'Test Description',
            releases: [{
                id: 1,
                version: '1.0.0',
                release_date: '2025-04-14T10:00:00',
                notes: 'Test Release'
            }],
            customers: [{
                id: 1,
                name: 'Test Customer',
                email: 'test@example.com'
            }]
        }];

        const customers = [{
            id: 2,
            name: 'Available Customer',
            email: 'available@example.com'
        }];

        require('../static/js/projects.js');
        window.displayProjects(projectsList, customers);

        const projectsDiv = document.getElementById('projectsList');
        expect(projectsDiv.innerHTML).toContain('Test Project');
        expect(projectsDiv.innerHTML).toContain('Test Description');
        expect(projectsDiv.innerHTML).toContain('1.0.0');
        expect(projectsDiv.innerHTML).toContain('Test Customer');
        expect(projectsDiv.innerHTML).toContain('Available Customer');
    });

    test('setupProjectForm handles form submission correctly', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ id: 1, name: 'Test Project' })
        });

        require('../static/js/projects.js');
        
        const form = document.getElementById('projectForm');
        document.getElementById('projectName').value = 'Test Project';
        document.getElementById('projectDescription').value = 'Test Description';

        const event = new window.Event('submit');
        form.dispatchEvent(event);

        expect(fetch).toHaveBeenCalledWith('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Project',
                description: 'Test Description'
            })
        });
    });

    test('setupCustomerForm handles form submission correctly', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ id: 1, name: 'Test Customer' })
        });

        require('../static/js/projects.js');
        
        const form = document.getElementById('customerForm');
        document.getElementById('customerName').value = 'Test Customer';
        document.getElementById('customerEmail').value = 'test@example.com';
        document.getElementById('contactPerson').value = 'Test Person';

        const event = new window.Event('submit');
        form.dispatchEvent(event);

        expect(fetch).toHaveBeenCalledWith('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Customer',
                email: 'test@example.com',
                contact_person: 'Test Person'
            })
        });
    });

    test('addRelease handles release creation correctly', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ id: 1, version: '1.0.0' })
        });

        require('../static/js/projects.js');
        
        // Add version input and notes textarea to the DOM
        const versionInput = document.createElement('input');
        versionInput.id = 'version-1';
        versionInput.value = '1.0.0';
        document.body.appendChild(versionInput);

        const notesInput = document.createElement('textarea');
        notesInput.id = 'notes-1';
        notesInput.value = 'Test Notes';
        document.body.appendChild(notesInput);

        await window.addRelease(1);

        expect(fetch).toHaveBeenCalledWith('/api/projects/1/releases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: '1.0.0',
                notes: 'Test Notes'
            })
        });
    });

    test('deleteProject shows confirmation and handles deletion', async () => {
        global.confirm = jest.fn(() => true);
        global.fetch.mockResolvedValueOnce({
            ok: true
        });

        require('../static/js/projects.js');
        
        await window.deleteProject(1);

        expect(confirm).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledWith('/api/projects/1', {
            method: 'DELETE'
        });
    });
});

describe('Projects Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="projectsList"></div>
      <button id="addProjectBtn">Add Project</button>
      <form id="projectForm" style="display: none;">
        <input type="text" id="projectName" />
        <input type="text" id="clientName" />
        <button type="submit">Save</button>
      </form>
    `;
  });

  test('should show project form when add button is clicked', () => {
    const addButton = document.getElementById('addProjectBtn');
    const projectForm = document.getElementById('projectForm');
    
    fireEvent.click(addButton);
    expect(projectForm.style.display).toBe('block');
  });

  test('should hide form and clear inputs after submission', () => {
    const form = document.getElementById('projectForm');
    const nameInput = document.getElementById('projectName');
    const clientInput = document.getElementById('clientName');
    
    nameInput.value = 'Test Project';
    clientInput.value = 'Test Client';
    
    fireEvent.submit(form);
    
    expect(form.style.display).toBe('none');
    expect(nameInput.value).toBe('');
    expect(clientInput.value).toBe('');
  });
});