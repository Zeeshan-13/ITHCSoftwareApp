import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import * as projectsModule from '../static/js/projects.js';

describe('Project Management', () => {
    beforeEach(() => {
        document.body.innerHTML = `
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
            <div id="customersList"></div>
            <input id="version-1" />
            <textarea id="notes-1"></textarea>
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

    test('displayProjects renders projects list correctly', () => {
        const projectsList = [{
            id: 1,
            name: 'Test Project',
            description: 'Test Description',
            software_version: '1.0.0',
            customers: [{
                id: 1,
                name: 'Test Customer'
            }]
        }];

        projectsModule.displayProjects(projectsList);

        const tbody = document.getElementById('projectsList');
        expect(tbody.innerHTML).toContain('Test Project');
        expect(tbody.innerHTML).toContain('Test Description');
        expect(tbody.innerHTML).toContain('1.0.0');
        expect(tbody.innerHTML).toContain('Test Customer');
    });

    test('setupProjectForm handles form submission correctly', async () => {
        const formData = {
            name: 'Test Project',
            description: 'Test Description'
        };

        document.getElementById('projectName').value = formData.name;
        document.getElementById('projectDescription').value = formData.description;

        projectsModule.setupProjectForm();
        const form = document.getElementById('projectForm');
        fireEvent.submit(form);

        expect(fetch).toHaveBeenCalledWith('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
    });

    test('setupCustomerForm handles form submission correctly', async () => {
        const formData = {
            name: 'Test Customer',
            email: 'test@example.com',
            contact_person: 'Test Person'
        };

        document.getElementById('customerName').value = formData.name;
        document.getElementById('customerEmail').value = formData.email;
        document.getElementById('contactPerson').value = formData.contact_person;

        projectsModule.setupCustomerForm();
        const form = document.getElementById('customerForm');
        fireEvent.submit(form);

        expect(fetch).toHaveBeenCalledWith('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
    });

    test('addRelease handles release creation correctly', async () => {
        const releaseData = {
            version: '1.0.0',
            notes: 'Test Notes'
        };

        document.getElementById('version-1').value = releaseData.version;
        document.getElementById('notes-1').value = releaseData.notes;

        await projectsModule.addRelease(1);

        expect(fetch).toHaveBeenCalledWith('/api/projects/1/releases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(releaseData)
        });
    });

    test('deleteProject shows confirmation and handles deletion', async () => {
        await projectsModule.deleteProject(1);

        expect(confirm).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledWith('/api/projects/1', {
            method: 'DELETE'
        });
    });

    test('loadCustomers fetches and displays customers', async () => {
        const customers = [{
            id: 1,
            name: 'Test Customer',
            email: 'test@example.com',
            contact_person: 'Test Person'
        }];

        global.fetch.mockImplementationOnce(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(customers)
        }));

        await projectsModule.loadCustomers();

        const tbody = document.getElementById('customersList');
        expect(tbody.innerHTML).toContain('Test Customer');
        expect(tbody.innerHTML).toContain('test@example.com');
        expect(tbody.innerHTML).toContain('Test Person');
    });
});

describe('Projects Module', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="projectsList"></div>
            <button id="addProjectBtn" onclick="showProjectForm()">Add Project</button>
            <form id="projectForm" style="display: none;">
                <input type="text" id="projectName" />
                <input type="text" id="clientName" />
                <button type="submit">Save</button>
            </form>
        `;

        window.showProjectForm = () => {
            document.getElementById('projectForm').style.display = 'block';
        };

        window.handleProjectSubmit = (e) => {
            e.preventDefault();
            const form = e.target;
            form.style.display = 'none';
            form.reset();
        };

        const form = document.getElementById('projectForm');
        form.addEventListener('submit', window.handleProjectSubmit);
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