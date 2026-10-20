import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideZoneChangeDetection, signal } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { HomeComponent } from "./home.component";
import { AuthService } from "../../core/auth.service";
import { WEBINAR, webinarHasEnded } from "./webinar-content";

describe("FCC community homepage", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(
      Date.parse("2026-10-03T10:00:00+05:30"),
    );
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZoneChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: { user: signal(null) } },
      ],
    });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it("keeps registration in one webinar section and leads with the community", () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const links = [
      ...fixture.nativeElement.querySelectorAll("a.registration-cta"),
    ] as HTMLAnchorElement[];
    expect(links).toHaveLength(1);
    expect(links[0].closest("section")?.id).toBe("register");
    expect(fixture.nativeElement.querySelector("h1").textContent).toContain(
      "Communication",
    );
    expect(
      fixture.nativeElement.querySelector(".community-hero").textContent,
    ).not.toMatch(/webinar|register|workshop/i);
    expect(
      fixture.nativeElement
        .querySelector(".community-hero a")
        .getAttribute("href"),
    ).toBe("#community");
    expect(links.every((link) => link.href === WEBINAR.registrationUrl)).toBe(
      true,
    );
    expect(
      fixture.nativeElement.querySelector('a[href="/register"]'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelectorAll("#stories article"),
    ).toHaveLength(3);
  });

  it("stops offering the expired event and links to upcoming webinars", () => {
    vi.mocked(Date.now).mockReturnValue(Date.parse(WEBINAR.endsAt));
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const links = [
      ...fixture.nativeElement.querySelectorAll("a.registration-cta"),
    ] as HTMLAnchorElement[];
    expect(links.every((link) => link.href === WEBINAR.sourceUrl)).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      "This session has ended",
    );
    expect(fixture.nativeElement.textContent).not.toContain(
      "Register for FREE",
    );
  });

  it("exposes menu state and restores focus when dismissed with Escape", () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      ".menu-toggle",
    ) as HTMLButtonElement;
    const nav = fixture.nativeElement.querySelector(
      "#community-navigation",
    ) as HTMLElement;
    expect(button.getAttribute("aria-expanded")).toBe("false");
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(nav.classList.contains("is-open")).toBe(true);
    nav.querySelector<HTMLAnchorElement>("a")!.focus();
    nav.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    fixture.detectChanges();
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(button);
  });

  it("closes the menu and focuses the destination when a section is chosen", () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector(".menu-toggle").click();
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector(
      '#community-navigation a[href="#stories"]',
    );
    link.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.menuOpen()).toBe(false);
    expect(document.activeElement?.id).toBe("stories");
  });

  it("uses the India time offset at the end-of-session boundary", () => {
    expect(webinarHasEnded(Date.parse("2026-10-03T06:59:59Z"))).toBe(false);
    expect(webinarHasEnded(Date.parse("2026-10-03T07:00:00Z"))).toBe(true);
  });
});
