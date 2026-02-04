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
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  getString(key: string): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(key);
  }

  set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  setString(key: string, value: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, value);
  }

  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
  }

  has(key: string): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem(key) !== null;
  }
}
