import '@testing-library/jest-dom';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock FormData properly
global.FormData = jest.fn(() => ({
    append: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
    entries: jest.fn(),
    values: jest.fn(),
    keys: jest.fn(),
    [Symbol.iterator]: jest.fn()
}));

// Mock File and Blob
global.File = jest.fn();
global.Blob = jest.fn();

// Mock URL
global.URL = {
    createObjectURL: jest.fn(),
    revokeObjectURL: jest.fn()
};

// Mock bootstrap
global.bootstrap = {
    Modal: class {
        constructor() {
            this.show = jest.fn();
            this.hide = jest.fn();
        }
        static getInstance() {
            return new this();
        }
    }
};

// Mock fetch
global.fetch = jest.fn();

// Mock console methods
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

// Mock window.alert
global.alert = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
});