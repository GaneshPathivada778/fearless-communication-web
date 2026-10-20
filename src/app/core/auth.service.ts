import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { tap } from "rxjs";
export type Role = "SuperAdmin" | "Admin" | "Student";
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId?: string | null;
}
export interface Session {
  user: SessionUser;
  accessToken: string;
}
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly key = "fcc_session";
  readonly user = signal<SessionUser | null>(this.read()?.user ?? null);
  readonly token = signal(this.read()?.accessToken ?? "");
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}
  login(email: string, password: string) {
    return this.http
      .post<Session>("/api/auth/login", { email, password })
      .pipe(tap((session) => this.save(session)));
  }
  register(name: string, email: string, password: string) {
    return this.http
      .post<Session>("/api/auth/register", { name, email, password })
      .pipe(tap((session) => this.save(session)));
  }
  joinCommunity() {
    return this.http
      .post<Session>("/api/auth/join-community", {})
      .pipe(tap((session) => this.save(session)));
  }
  save(session: Session) {
    localStorage.setItem(this.key, JSON.stringify(session));
    this.user.set(session.user);
    this.token.set(session.accessToken);
  }
  private read(): Session | null {
    try {
      const session = JSON.parse(localStorage.getItem(this.key) ?? "null");
      return session?.user?.id && typeof session.accessToken === "string"
        ? session
        : null;
    } catch {
      return null;
    }
  }
  logout() {
    localStorage.removeItem(this.key);
    this.user.set(null);
    this.token.set("");
    void this.router.navigateByUrl("/login", { replaceUrl: true });
  }
}
