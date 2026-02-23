import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;

    try {
      const item = sessionStorage.getItem(key) || localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  getString(key: string): string | null {
    if (!this.isBrowser) return null;
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  }

  isSession(key: string): boolean {
    if (!this.isBrowser) return false;
    return sessionStorage.getItem(key) !== null;
  }

  set<T>(key: string, value: T, sessionOnly: boolean = false): void {
    if (!this.isBrowser) return;
    const storage = sessionOnly ? sessionStorage : localStorage;
    storage.setItem(key, JSON.stringify(value));
  }

  setString(key: string, value: string, sessionOnly: boolean = false): void {
    if (!this.isBrowser) return;
    const storage = sessionOnly ? sessionStorage : localStorage;
    storage.setItem(key, value);
  }

  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  clear(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
    sessionStorage.clear();
  }

  has(key: string): boolean {
    if (!this.isBrowser) return false;
    return sessionStorage.getItem(key) !== null || localStorage.getItem(key) !== null;
  }
}
