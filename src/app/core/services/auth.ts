import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap, map } from 'rxjs';
import {
  AuthCodeResponse,
  TokenPair,
  LoginRequest,
  RegisterRequest,
  User,
  UserResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = 'http://localhost:8080/auth';
  private usersUrl = 'http://localhost:8080/users';
  private tokenUrl = 'http://localhost:8080/token';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private currentUserSignal = signal<User | null>(this.getUserFromStorage());

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<AuthCodeResponse>(`${this.authUrl}/login`, credentials).pipe(
      switchMap(response => this.exchangeCode(response.auth_code)),
      switchMap(tokens => {
        this.storeTokens(tokens);
        return this.fetchCurrentUser(tokens.access_token);
      }),
      tap(user => this.setCurrentUser(user))
    );
  }

  register(data: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/register`, data);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }

  refreshToken(): Observable<TokenPair> {
    const refreshToken = this.getRefreshToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`
    });
    return this.http.post<TokenPair>(`${this.tokenUrl}/refresh`, null, { headers }).pipe(
      tap(tokens => this.storeTokens(tokens))
    );
  }

  private exchangeCode(code: string): Observable<TokenPair> {
    return this.http.get<TokenPair>(`${this.authUrl}/code/exchange`, {
      params: { code }
    });
  }

  private fetchCurrentUser(accessToken: string): Observable<User> {
    const userId = this.extractUserIdFromToken(accessToken);
    return this.http.get<UserResponse>(`${this.usersUrl}/${userId}`).pipe(
      map(response => ({
        id: response.id,
        name: response.name,
        email: response.email
      }))
    );
  }

  private extractUserIdFromToken(token: string): string {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  }

  private storeTokens(tokens: TokenPair): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  private setCurrentUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUserSignal.set(user);
  }

  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
}