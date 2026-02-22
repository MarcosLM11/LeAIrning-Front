import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  describe('browser mode', () => {
    let service: StorageService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
      service = TestBed.inject(StorageService);
      localStorage.clear();
    });

    afterEach(() => localStorage.clear());

    it('should set and get JSON values', () => {
      service.set('key', { a: 1 });
      expect(service.get<{ a: number }>('key')).toEqual({ a: 1 });
    });

    it('should return null for missing key', () => {
      expect(service.get('missing')).toBeNull();
    });

    it('should set and get string values', () => {
      service.setString('token', 'abc');
      expect(service.getString('token')).toBe('abc');
    });

    it('should remove a key', () => {
      service.setString('token', 'abc');
      service.remove('token');
      expect(service.getString('token')).toBeNull();
    });

    it('should clear all keys', () => {
      service.setString('a', '1');
      service.setString('b', '2');
      service.clear();
      expect(service.getString('a')).toBeNull();
      expect(service.getString('b')).toBeNull();
    });

    it('should check if key exists', () => {
      expect(service.has('key')).toBe(false);
      service.setString('key', 'val');
      expect(service.has('key')).toBe(true);
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem('bad', 'not json{');
      expect(service.get('bad')).toBeNull();
    });
  });

  describe('server mode', () => {
    let service: StorageService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });
      service = TestBed.inject(StorageService);
    });

    it('should return null for get', () => {
      expect(service.get('key')).toBeNull();
    });

    it('should return null for getString', () => {
      expect(service.getString('key')).toBeNull();
    });

    it('should return false for has', () => {
      expect(service.has('key')).toBe(false);
    });
  });
});
