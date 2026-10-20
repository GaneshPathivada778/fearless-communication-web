import { Subscription } from "rxjs";
import {
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  HostListener,
} from "@angular/core";
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
  NavigationEnd,
} from "@angular/router";
import { NgIf } from "@angular/common";
import { AuthService } from "./core/auth.service";
@Component({
  selector: "fcc-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  template: `<a
      class="skip-link"
      href="#main-content"
      (click)="skipToContent($event)"
      >Skip to content</a
    >
    <div class="top-nav-shell" *ngIf="!isStandalonePublicPage">
      <header class="top top-nav-pill">
        <a
          routerLink="/dashboard"
          class="brand"
          aria-label="Fearless Communication Club"
        >
          <span class="brand-circle" aria-hidden="true">fcc<span>.</span></span>
          <div class="brand-text">
            <span class="brand-name">FearlessCommunication Club</span>
            <span class="brand-sub">THE SPEAKING CLUB</span>
          </div>
        </a>

      <nav aria-label="Main navigation" class="nav-links">
        <a
          routerLink="/dashboard"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          >Discover</a
        >
        <a routerLink="/courses" routerLinkActive="active">Courses</a>
        <a routerLink="/live-classes" routerLinkActive="active">Live Classes</a>
        <!-- <a routerLink="/events" routerLinkActive="active">Events</a> -->
        <a routerLink="/community" routerLinkActive="active">Community</a>
        <a routerLink="/messages" routerLinkActive="active">Chat</a>
        <a
          routerLink="/admin"
          routerLinkActive="active"
          *ngIf="auth.user()?.role === 'Admin'"
          >Admin</a
        >
        <a
          routerLink="/super-admin"
          routerLinkActive="active"
          *ngIf="auth.user()?.role === 'SuperAdmin'"
          >Super Admin</a
        >
      </nav>

      <div class="nav-actions">
        <button type="button" class="action-icon-btn" aria-label="Search">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button
          type="button"
          class="action-icon-btn"
          aria-label="Notifications"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="notification-badge" aria-hidden="true"></span>
        </button>
        <div
          class="user-action profile-dropdown-container"
          *ngIf="auth.user()"
          #profileMenuContainer
        >
          <button
            type="button"
            class="user-avatar-btn"
            [class.active]="isProfileMenuOpen"
            (click)="toggleProfileMenu($event)"
            [attr.aria-expanded]="isProfileMenuOpen"
            aria-haspopup="menu"
            [attr.aria-label]="'Account menu for ' + (auth.user()?.name || 'User')"
            [title]="auth.user()?.name || 'User'"
          >
            <span class="user-avatar-text">{{ userInitials }}</span>
          </button>

          <div
            class="profile-dropdown-menu"
            *ngIf="isProfileMenuOpen"
            role="menu"
            aria-label="User account options"
          >
            <div class="profile-dropdown-header">
              <div class="profile-dropdown-avatar" aria-hidden="true">
                {{ userInitials }}
              </div>
              <div class="profile-dropdown-details">
                <span class="profile-dropdown-name">{{
                  auth.user()?.name || "Member"
                }}</span>
                <span class="profile-dropdown-email">{{
                  auth.user()?.email
                }}</span>
                <span class="profile-dropdown-badge">{{
                  auth.user()?.role || "Student"
                }}</span>
              </div>
            </div>

            <div class="profile-dropdown-divider"></div>

            <nav class="profile-dropdown-nav">
              <a
                routerLink="/profile"
                class="profile-dropdown-item"
                role="menuitem"
                (click)="closeProfileMenu()"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Your Profile</span>
              </a>

              <a
                routerLink="/courses"
                class="profile-dropdown-item"
                role="menuitem"
                (click)="closeProfileMenu()"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path
                    d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                  ></path>
                  <path
                    d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                  ></path>
                </svg>
                <span>Learning Library</span>
              </a>

              <a
                routerLink="/community"
                class="profile-dropdown-item"
                role="menuitem"
                (click)="closeProfileMenu()"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Your Circles</span>
              </a>

              <a
                *ngIf="
                  auth.user()?.role === 'Admin' ||
                  auth.user()?.role === 'SuperAdmin'
                "
                routerLink="/admin"
                class="profile-dropdown-item"
                role="menuitem"
                (click)="closeProfileMenu()"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  ></path>
                </svg>
                <span>Admin Console</span>
              </a>
            </nav>

            <div class="profile-dropdown-divider"></div>

            <div class="profile-dropdown-footer">
              <button
                type="button"
                class="profile-dropdown-logout-btn"
                role="menuitem"
                (click)="logout()"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
        <a routerLink="/login" *ngIf="!auth.user()" class="sign-in-btn"
          >Sign in</a
        >
      </div>
    </header>
  </div>
  <main #mainContent id="main-content" tabindex="-1"><router-outlet /></main>`,
})
export class AppComponent implements OnDestroy {
  private navigation: Subscription;
  private previousPath = "";
  isProfileMenuOpen = false;

  get isHomepage() {
    return this.router.url.split(/[?#]/)[0] === "/";
  }
  get isStandalonePublicPage() {
    return ["/", "/contact"].includes(this.router.url.split(/[?#]/)[0]);
  }
  @ViewChild("mainContent") mainContent?: ElementRef<HTMLElement>;
  @ViewChild("profileMenuContainer")
  profileMenuContainer?: ElementRef<HTMLElement>;

  get userInitials(): string {
    const name = this.auth.user()?.name?.trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  toggleProfileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  logout() {
    this.closeProfileMenu();
    this.auth.logout();
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    if (!this.isProfileMenuOpen) return;
    const container = this.profileMenuContainer?.nativeElement;
    if (container && !container.contains(event.target as Node)) {
      this.closeProfileMenu();
    }
  }

  @HostListener("document:keydown.escape")
  onEscapeKey() {
    if (this.isProfileMenuOpen) {
      this.closeProfileMenu();
    }
  }

  skipToContent(event: Event) {
    event.preventDefault();
    const main = this.mainContent?.nativeElement;
    const target = this.isStandalonePublicPage
      ? main?.querySelector<HTMLElement>("h1")
      : main;
    (target ?? main)?.focus();
  }
  year = new Date().getFullYear();
  constructor(
    public auth: AuthService,
    private router: Router,
  ) {
    this.navigation = router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) return;
      this.closeProfileMenu();
      const path = event.urlAfterRedirects.split(/[?#]/)[0];
      if (path !== this.previousPath) {
        this.previousPath = path;
        queueMicrotask(() =>
          this.mainContent?.nativeElement.focus({ preventScroll: true }),
        );
      }
    });
  }
  ngOnDestroy() {
    this.navigation.unsubscribe();
  }
}
