import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  private constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (e) {
        localStorage.removeItem('userData');
      }
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    const data: AuthResponse = await response.json();
    
    this.token = data.token;
    this.user = data.user;
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    return data;
  }

  async register(userData: { username: string; email: string; password: string; role?: string }): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    const data: AuthResponse = await response.json();
    
    this.token = data.token;
    this.user = data.user;
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    return data;
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

export const authService = AuthService.getInstance();
