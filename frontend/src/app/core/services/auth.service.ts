import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  status: string;
  role: string;
  createdAt: string;
}

interface LoginResponse {
  token: string;
  user: PublicUser;
}

interface RegisterResponse {
  user: PublicUser;
}

const TOKEN_KEY = "control_gastos_token";
const USER_KEY = "control_gastos_user";
const EXPIRY_KEY = "control_gastos_token_exp";
const API_URL = "http://localhost:3000";

@Injectable({ providedIn: "root" })
export class AuthService {
  currentUser = signal<PublicUser | null>(this.readStoredUser());
  private tokenExpiryMs = signal<number | null>(this.readStoredExpiry());

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          const expiry = this.decodeExpiry(response.token);

          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          if (expiry) {
            localStorage.setItem(EXPIRY_KEY, String(expiry));
          }

          this.currentUser.set(response.user);
          this.tokenExpiryMs.set(expiry);
        })
      );
  }

  register(name: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    this.currentUser.set(null);
    this.tokenExpiryMs.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const exp = this.tokenExpiryMs();
    return exp !== null && Date.now() >= exp;
  }

  getTokenExpiryMs(): number | null {
    return this.tokenExpiryMs();
  }

  private decodeExpiry(token: string): number | null {
    try {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64));
      return typeof payload.exp === "number" ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private readStoredUser(): PublicUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private readStoredExpiry(): number | null {
    const raw = localStorage.getItem(EXPIRY_KEY);
    return raw ? Number(raw) : null;
  }
}
