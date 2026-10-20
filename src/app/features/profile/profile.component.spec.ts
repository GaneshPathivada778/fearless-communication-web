import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { ProfileComponent } from "./profile.component";
import { AuthService } from "../../core/auth.service";
import { ApiService } from "../../core/api.service";
import { of } from "rxjs";
import { signal } from "@angular/core";

describe("ProfileComponent (Session & Logout under Profile)", () => {
  let mockAuth: {
    user: ReturnType<typeof signal<{ id: string; name: string; email: string; role: string } | null>>;
    token: ReturnType<typeof signal<string | null>>;
    logout: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAuth = {
      user: signal({
        id: "student-1",
        name: "Aarav Kumar",
        email: "aarav@fcc.club",
        role: "Student",
      }),
      token: signal("mock-jwt-token"),
      logout: vi.fn(),
      save: vi.fn(),
    };

    mockApi = {
      get: vi.fn().mockReturnValue(
        of({
          name: "Aarav Kumar",
          email: "aarav@fcc.club",
          bio: "Passionate public speaker",
          avatarUrl: "",
        })
      ),
      put: vi.fn().mockReturnValue(of({})),
    };

    TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: ApiService, useValue: mockApi },
      ],
    });
  });

  it("renders profile details and session sign-out card under profile form", () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector("h1");
    expect(titleEl.textContent).toContain("Your profile");

    const sessionCard = fixture.nativeElement.querySelector(".profile-account-card");
    expect(sessionCard).toBeTruthy();
    expect(sessionCard.textContent).toContain("Account & Session");
    expect(sessionCard.textContent).toContain("aarav@fcc.club");

    const logoutBtn = fixture.nativeElement.querySelector(".profile-account-logout-btn");
    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn.textContent).toContain("Log out");
  });

  it("calls auth.logout when the profile session logout button is clicked", () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    const logoutBtn = fixture.nativeElement.querySelector(".profile-account-logout-btn");
    logoutBtn.click();
    fixture.detectChanges();

    expect(mockAuth.logout).toHaveBeenCalledTimes(1);
  });
});
