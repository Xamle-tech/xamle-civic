import '@testing-library/jest-dom';

// Mock localStorage for Zustand persist middleware in jsdom
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem = (key: string) => this.store[key] ?? null;
  setItem = (key: string, value: string) => { this.store[key] = value; };
  removeItem = (key: string) => { delete this.store[key]; };
  clear = () => { this.store = {}; };
  get length() { return Object.keys(this.store).length; }
  key = (index: number) => Object.keys(this.store)[index] ?? null;
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true,
});
