export interface AuthCodeResponse {
  auth_code: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  role: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  pictureUrl: string | null;
  role: string;
  verified: boolean;
}