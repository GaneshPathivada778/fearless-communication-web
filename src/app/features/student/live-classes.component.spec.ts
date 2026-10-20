import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { LiveClassesComponent } from "./live-classes.component";
import { AuthService } from "../../core/auth.service";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";

describe("LiveClassesComponent (Figma Design)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders Figma title, weekly calendar strip, and initial class cards", () => {
    TestBed.configureTestingModule({
      imports: [LiveClassesComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user: signal({
              id: "student-1",
              name: "Student",
              email: "student@test.com",
              role: "Student",
            }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(LiveClassesComponent);
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector(".page-title");
    expect(titleEl.textContent).toContain("Your live class schedule");

    // Check calendar strip days (7 days)
    const dayCards = fixture.nativeElement.querySelectorAll(".day-card");
    expect(dayCards.length).toBe(7);

    // Check class cards (5 classes from Figma)
    const classCards = fixture.nativeElement.querySelectorAll(".class-row-card");
    expect(classCards.length).toBe(5);

    // Check Zoom buttons have new tab attributes
    const zoomButtons = fixture.nativeElement.querySelectorAll(".join-zoom-btn");
    zoomButtons.forEach((btn: HTMLAnchorElement) => {
      expect(btn.getAttribute("target")).toBe("_blank");
      expect(btn.getAttribute("rel")).toBe("noopener noreferrer");
    });
  });

  it("filters classes when a calendar day is clicked", () => {
    TestBed.configureTestingModule({
      imports: [LiveClassesComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user: signal({
              id: "student-1",
              name: "Student",
              role: "Student",
            }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(LiveClassesComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    // Select Tuesday 20
    comp.selectDay(20);
    fixture.detectChanges();

    expect(comp.filteredClasses().length).toBe(1);
    expect(comp.filteredClasses()[0].title).toBe("Small Talk, Real Connections");

    // Reset filter
    comp.resetToCurrentWeek();
    fixture.detectChanges();
    expect(comp.filteredClasses().length).toBe(5);
  });

  it("enables Admin to add a new class into the schedule", () => {
    TestBed.configureTestingModule({
      imports: [LiveClassesComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user: signal({
              id: "admin-1",
              name: "Admin",
              role: "Admin",
            }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(LiveClassesComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".admin-add-btn")).toBeTruthy();

    comp.openAddModal();
    comp.newClassForm.title = "Advanced Interview Speaking Workshop";
    comp.newClassForm.description = "Practice answering tough behavioral questions with confidence.";
    comp.newClassForm.dateNumber = 27;
    comp.newClassForm.dateSub = "OCT · TUE";
    comp.newClassForm.timeLabel = "8:00–9:00 PM IST · 60 min";
    comp.newClassForm.zoomUrl = "https://zoom.us/j/999888777";
    comp.saveClass();
    fixture.detectChanges();

    expect(comp.classes()[0].title).toBe("Advanced Interview Speaking Workshop");
  });

  it("displays TODAY badge, active filter status, and category classes accurately", () => {
    TestBed.configureTestingModule({
      imports: [LiveClassesComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user: signal({
              id: "student-1",
              name: "Student",
              role: "Student",
            }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(LiveClassesComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    // Check TODAY badge is rendered on Tuesday 20
    const todayBadge = fixture.nativeElement.querySelector(".today-badge");
    expect(todayBadge).toBeTruthy();
    expect(todayBadge.textContent.trim()).toBe("TODAY");

    // Category classes verification
    expect(comp.getCategoryClass("GUIDED PRACTICE")).toBe("category-guided");
    expect(comp.getCategoryClass("ROLE-PLAY STUDIO")).toBe("category-roleplay");
    expect(comp.getCategoryClass("CONVERSATION CIRCLE")).toBe("category-conversation");
    expect(comp.getCategoryClass("STORYTELLING STUDIO")).toBe("category-storytelling");

    // Test active filter label chip
    comp.selectDay(23);
    fixture.detectChanges();
    expect(comp.activeFilterLabel()).toBe("FRI 23 OCT");

    const chipEl = fixture.nativeElement.querySelector(".active-filter-chip");
    expect(chipEl).toBeTruthy();
    expect(chipEl.textContent).toContain("FRI 23 OCT");

    // Click clear button
    comp.clearFilter();
    fixture.detectChanges();
    expect(comp.activeFilterLabel()).toBeNull();
    expect(fixture.nativeElement.querySelector(".active-filter-chip")).toBeNull();
  });
});
