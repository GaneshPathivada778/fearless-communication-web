import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZoneChangeDetection, NgZone } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { LoginComponent } from "./login.component";
describe("Authentication form feedback", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideZoneChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }),
  );
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.resetTestingModule();
  });
  it("blocks an empty form even when its submit event is dispatched", async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const form = fixture.nativeElement.querySelector("form");
    expect(fixture.nativeElement.querySelector("button").disabled).toBe(true);
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    TestBed.inject(HttpTestingController).expectNone("/api/auth/login");
  });
  it("renders a failed asynchronous login and releases pending state", async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const email = fixture.nativeElement.querySelector('[name="email"]');
    const password = fixture.nativeElement.querySelector('[name="password"]');
    email.value = "review@example.test";
    email.dispatchEvent(new Event("input"));
    password.value = "test-password";
    password.dispatchEvent(new Event("input"));
    await fixture.whenStable();
    fixture.nativeElement
      .querySelector("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    const request = TestBed.inject(HttpTestingController).expectOne(
      "/api/auth/login",
    );
    expect(fixture.componentInstance.pending).toBe(true);
    TestBed.inject(NgZone).run(() =>
      request.flush("Invalid credentials", {
        status: 401,
        statusText: "Unauthorized",
      }),
    );
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[role="alert"]').textContent,
    ).toContain("Invalid credentials");
    expect(fixture.componentInstance.pending).toBe(false);
  });
});
