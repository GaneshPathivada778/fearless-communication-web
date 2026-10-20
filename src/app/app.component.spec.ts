import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { AuthService } from "./core/auth.service";
import { provideRouter, Router } from "@angular/router";
import { Component, signal } from "@angular/core";

@Component({ standalone: true, template: "<div>Dashboard</div>" })
class DummyDashboardComponent {}

describe("AppComponent (Profile Dropdown & Logout)", () => {
  let mockAuth: {
    user: ReturnType<typeof signal<{ id: string; name: string; email: string; role: string } | null>>;
    token: ReturnType<typeof signal<string | null>>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAuth = {
      user: signal({
        id: "student-1",
        name: "Aarav Kumar",
        email: "aarav@fcc.club",
        role: "Student",
      }),
      token: signal("mock-jwt-token"),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          { path: "dashboard", component: DummyDashboardComponent },
          { path: "profile", component: DummyDashboardComponent },
        ]),
        { provide: AuthService, useValue: mockAuth },
      ],
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl("/dashboard");
  });

  it("renders user avatar button with initials and closed dropdown initially", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const avatarBtn = fixture.nativeElement.querySelector(".user-avatar-btn");
    expect(avatarBtn).toBeTruthy();
    expect(avatarBtn.textContent).toContain("AK");

    const menu = fixture.nativeElement.querySelector(".profile-dropdown-menu");
    expect(menu).toBeNull();
  });

  it("opens profile dropdown menu when avatar button is clicked", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const avatarBtn = fixture.nativeElement.querySelector(".user-avatar-btn");
    avatarBtn.click();
    fixture.detectChanges();

    const menu = fixture.nativeElement.querySelector(".profile-dropdown-menu");
    expect(menu).toBeTruthy();
    expect(menu.textContent).toContain("Aarav Kumar");
    expect(menu.textContent).toContain("aarav@fcc.club");
    expect(menu.textContent).toContain("Student");
    expect(menu.textContent).toContain("Log out");
  });

  it("calls auth.logout and closes menu when Log out button in dropdown is clicked", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const avatarBtn = fixture.nativeElement.querySelector(".user-avatar-btn");
    avatarBtn.click();
    fixture.detectChanges();

    const logoutBtn = fixture.nativeElement.querySelector(".profile-dropdown-logout-btn");
    expect(logoutBtn).toBeTruthy();
    logoutBtn.click();
    fixture.detectChanges();

    expect(mockAuth.logout).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.isProfileMenuOpen).toBe(false);
  });

  it("closes profile menu when Escape key is pressed", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.componentInstance.isProfileMenuOpen = true;
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();

    expect(fixture.componentInstance.isProfileMenuOpen).toBe(false);
  });
});
