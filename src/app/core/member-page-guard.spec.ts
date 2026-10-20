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
import { memberPageGuard } from "./guards";
import { routes } from "../app.routes";

describe("Retired public pages", () => {
  afterEach(() => TestBed.resetTestingModule());
  it.each([
    null,
    { role: "Student" },
    { role: "Admin" },
    { role: "SuperAdmin" },
  ])("preserves access only for an existing session: %j", (user) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: () => user } },
      ],
    });
    const result = TestBed.runInInjectionContext(() =>
      memberPageGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    if (user) expect(result).toBe(true);
    else
      expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe("/");
  });
  it("retires public signup and plan routes without removing protected learning areas", () => {
    expect(routes.find((route) => route.path === "register")?.redirectTo).toBe(
      "",
    );
    expect(
      routes.find((route) => route.path === "platform-plans")?.redirectTo,
    ).toBe("");
    expect(
      routes.find((route) => route.path === "memberships")?.canActivate,
    ).toContain(memberPageGuard);
    for (const path of [
      "learning",
      "learning/:id",
      "community",
      "messages",
      "admin",
      "super-admin",
    ]) {
      expect(
        routes.find((route) => route.path === path)?.canActivate?.length,
      ).toBeGreaterThan(0);
    }
  });
});
