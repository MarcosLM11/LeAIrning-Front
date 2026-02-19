import { Injectable, signal, inject } from '@angular/core';
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
import { StorageService } from '../../shared/services/storage.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly authUrl = `${this.baseUrl}/auth`;
  private readonly usersUrl = `${this.baseUrl}/users`;
  private readonly tokenUrl = `${this.baseUrl}/token`;

  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);

  private currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    const user = this.storage.get<User>(this.USER_KEY);
    if (user) {
      this.currentUserSignal.set(user);
    }
  }

  isAuthenticated(): boolean {
    if (this.currentUserSignal() !== null) {
      return true;
    }
    const token = this.getToken();
    if (token && !this.isTokenExpired()) {
      const user = this.storage.get<User>(this.USER_KEY);
      if (user) {
        this.currentUserSignal.set(user);
        return true;
      }
    }
    return false;
  }

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

  verifyEmail(token: string): Observable<User> {
    return this.http.get<AuthCodeResponse>(`${this.authUrl}/verify`, {
      params: { token }
    }).pipe(
      switchMap(response => this.exchangeCode(response.auth_code)),
      switchMap(tokens => {
        this.storeTokens(tokens);
        return this.fetchCurrentUser(tokens.access_token);
      }),
      tap(user => this.setCurrentUser(user))
    );
  }

  logout(): void {
    this.storage.remove(this.TOKEN_KEY);
    this.storage.remove(this.REFRESH_TOKEN_KEY);
    this.storage.remove(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.storage.getString(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storage.getString(this.REFRESH_TOKEN_KEY);
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

  exchangeCodeFromOAuth(code: string): Observable<User> {
    return this.exchangeCode(code).pipe(
      switchMap(tokens => {
        this.storeTokens(tokens);
        return this.fetchCurrentUser(tokens.access_token);
      }),
      tap(user => this.setCurrentUser(user))
    );
  }

  private exchangeCode(code: string): Observable<TokenPair> {
    return this.http.get<TokenPair>(`${this.authUrl}/code/exchange`, {
      params: { code }
    });
  }

  private fetchCurrentUser(accessToken: string): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.get<UserResponse>(`${this.usersUrl}/me`, { headers }).pipe(
      map(response => ({
        id: response.id,
        name: response.name,
        email: response.email
      }))
    );
  }

  private storeTokens(tokens: TokenPair): void {
    this.storage.setString(this.TOKEN_KEY, tokens.access_token);
    this.storage.setString(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  private setCurrentUser(user: User): void {
    this.storage.set(this.USER_KEY, user);
    this.currentUserSignal.set(user);
  }
}