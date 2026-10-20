import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { CoursesComponent } from "./courses.component";
import { AuthService } from "../../core/auth.service";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";

describe("CoursesComponent (Figma Learning Library)", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoursesComponent],
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
  });

  it("renders page title, category pills, and all course cards", () => {
    const fixture = TestBed.createComponent(CoursesComponent);
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector(".page-title");
    expect(titleEl.textContent).toContain("Courses & practice paths");

    const kickerEl = fixture.nativeElement.querySelector(".section-kicker");
    expect(kickerEl.textContent).toContain("YOUR LEARNING LIBRARY");

    // Check category pills (4 pills: All, Fluency, Expression, Foundations)
    const pills = fixture.nativeElement.querySelectorAll(".filter-pill");
    expect(pills.length).toBe(4);

    // Check course cards (4 initial cards from Figma)
    const cards = fixture.nativeElement.querySelectorAll(".course-card");
    expect(cards.length).toBe(4);

    // Check mentor guidance card exists
    const guidanceCard = fixture.nativeElement.querySelector(".mentor-guidance-card");
    expect(guidanceCard).toBeTruthy();
    expect(guidanceCard.textContent).toContain("Not sure where to begin?");
    expect(guidanceCard.textContent).toContain("Ask your mentor");
  });

  it("filters courses when a category pill is selected", () => {
    const fixture = TestBed.createComponent(CoursesComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    // Select Fluency & Mindset
    comp.selectCategory("fluency");
    fixture.detectChanges();

    expect(comp.filteredCourses().length).toBe(1);
    expect(comp.filteredCourses()[0].title).toBe("Think in English");

    // Select Expression
    comp.selectCategory("expression");
    fixture.detectChanges();
    expect(comp.filteredCourses().length).toBe(1);
    expect(comp.filteredCourses()[0].title).toBe("Stories Worth Telling");

    // Reset to All
    comp.selectCategory("all");
    fixture.detectChanges();
    expect(comp.filteredCourses().length).toBe(4);
  });

  it("filters courses based on search query", () => {
    const fixture = TestBed.createComponent(CoursesComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.searchQuery.set("grammar");
    fixture.detectChanges();

    expect(comp.filteredCourses().length).toBe(1);
    expect(comp.filteredCourses()[0].title).toBe("Grammar, Naturally");

    comp.clearSearch();
    fixture.detectChanges();
    expect(comp.filteredCourses().length).toBe(4);
  });

  it("calculates overall learning progress", () => {
    const fixture = TestBed.createComponent(CoursesComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.overallProgress()).toBeGreaterThanOrEqual(0);
    const progressEl = fixture.nativeElement.querySelector(".progress-number");
    expect(progressEl.textContent).toContain("%");
  });
});
