import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { TestBed, ComponentFixture } from "@angular/core/testing";
import { provideZoneChangeDetection } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { CallbackRequestComponent } from "./callback-request.component";

describe("Callback request", () => {
  let fixture: ComponentFixture<CallbackRequestComponent>;
  let http: HttpTestingController;
  beforeEach(async () => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute("open");
      },
    });
    TestBed.configureTestingModule({
      imports: [CallbackRequestComponent],
      providers: [
        provideZoneChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    fixture = TestBed.createComponent(CallbackRequestComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  async function fill() {
    fixture.componentInstance.name = "Test Learner";
    fixture.componentInstance.phone = "+1 (202) 555-0100";
    fixture.componentInstance.preferredTime = "Evening IST";
    fixture.detectChanges();
    await fixture.whenStable();
  }
  function submit() {
    fixture.nativeElement
      .querySelector("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it("rejects empty details without sending a request", () => {
    submit();
    http.expectNone("/api/public/callback-requests");
    expect(fixture.componentInstance.error()).toContain("check your name");
  });
  it("prevents duplicate submissions and only confirms after persistence", async () => {
    await fill();
    submit();
    submit();
    const request = http.expectOne("/api/public/callback-requests");
    expect(request.request.body.phone).toBe("+12025550100");
    expect(fixture.componentInstance.sending()).toBe(true);
    expect(fixture.componentInstance.sent()).toBe(false);
    request.flush({ received: true });
    fixture.detectChanges();
    expect(fixture.componentInstance.sent()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      "Your callback request is saved",
    );
  });
  it("preserves details and retry identity when a submission fails", async () => {
    await fill();
    submit();
    const failed = http.expectOne("/api/public/callback-requests");
    const id = failed.request.body.requestId;
    failed.flush({}, { status: 503, statusText: "Unavailable" });
    fixture.detectChanges();
    expect(fixture.componentInstance.sent()).toBe(false);
    expect(fixture.componentInstance.name).toBe("Test Learner");
    expect(fixture.componentInstance.error()).toContain("try again");
    submit();
    const retry = http.expectOne("/api/public/callback-requests");
    expect(retry.request.body.requestId).toBe(id);
    retry.flush({ received: true });
  });
  it("opens the form with keyboard focus and returns focus on Escape", async () => {
    fixture.nativeElement.querySelector(".help-action button").click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe("callback-name");
    fixture.nativeElement
      .querySelector("dialog")
      .dispatchEvent(new Event("cancel", { cancelable: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector(".help-action button"),
    );
  });
});
