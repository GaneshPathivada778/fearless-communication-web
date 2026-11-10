import { describe, it, expect, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from "@angular/router";
import { AuthService } from "./auth.service";
import { coursesPageGuard } from "./guards";

describe("coursesPageGuard", () => {
  afterEach(() => TestBed.resetTestingModule());

  it("allows an Admin to access /courses directly", () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: () => ({ id: "1", role: "Admin", name: "Admin" }) },
        },
      ],
    });

    const route = { queryParamMap: { get: () => null, has: () => false } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      coursesPageGuard(route, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it("allows a SuperAdmin to access /courses directly", () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: () => ({ id: "2", role: "SuperAdmin", name: "Super" }) },
        },
      ],
    });

    const route = { queryParamMap: { get: () => null, has: () => false } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      coursesPageGuard(route, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it("allows a Student to access /courses", () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: () => ({ id: "3", role: "Student", name: "Student" }) },
        },
      ],
    });

    const route = { queryParamMap: { get: () => null, has: () => false } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      coursesPageGuard(route, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it("allows an Admin to preview student view when query param view=student is provided", () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: () => ({ id: "1", role: "Admin", name: "Admin" }) },
        },
      ],
    });

    const route = {
      queryParamMap: {
        get: (key: string) => (key === "view" ? "student" : null),
        has: (key: string) => key === "view",
      },
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() =>
      coursesPageGuard(route, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });
});

