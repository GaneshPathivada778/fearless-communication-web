import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { CoursesComponent } from "./courses.component";
import { AuthService } from "../../../core/auth.service";
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

  it("renders page title, requested status categories, and all course cards", () => {
    const fixture = TestBed.createComponent(CoursesComponent);
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector(".page-title");
    expect(titleEl.textContent).toContain("Courses");

    const pills = fixture.nativeElement.querySelectorAll(".filter-pill");
    expect(
      Array.from(pills, (pill: Element) => pill.textContent?.trim()),
    ).toEqual([
      "ALL Courses",
      "In Progress",
      "Completed",
      "Expired",
      "Paid membership",
    ]);

    const cards = fixture.nativeElement.querySelectorAll(".course-card");
    expect(cards.length).toBe(4);

    // Check mentor guidance card exists
    const guidanceCard = fixture.nativeElement.querySelector(".mentor-guidance-card");
    expect(guidanceCard).toBeTruthy();
    expect(guidanceCard.textContent).toContain("Not sure where to begin?");
    expect(guidanceCard.textContent).toContain("Ask your mentor");
  });

  it("filters courses by progress, expiry, and paid membership", () => {
    const fixture = TestBed.createComponent(CoursesComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.selectCategory("in-progress");
    fixture.detectChanges();
    expect(comp.filteredCourses().map((course) => course.title)).toEqual([
      "Think in English",
      "Grammar, Naturally",
      "Speak with Confidence",
    ]);

    comp.courses.update((courses) =>
      courses.map((course) =>
        course.id === "think-in-english"
          ? { ...course, progressPercent: 100 }
          : course.id === "stories-worth-telling"
            ? { ...course, isExpired: true }
            : course,
      ),
    );
    comp.selectCategory("completed");
    fixture.detectChanges();
    expect(comp.filteredCourses().map((course) => course.title)).toEqual([
      "Think in English",
    ]);

    comp.selectCategory("expired");
    fixture.detectChanges();
    expect(comp.filteredCourses().map((course) => course.title)).toEqual([
      "Stories Worth Telling",
    ]);

    comp.selectCategory("paid-membership");
    fixture.detectChanges();
    expect(comp.filteredCourses().map((course) => course.title)).toEqual([
      "Think in English",
      "Stories Worth Telling",
      "Grammar, Naturally",
    ]);

    comp.selectCategory("all");
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
    expect(comp.overallProgress()).toBe(28);
  });

  it("shows Start / Continue course buttons and progress bar when user is a Student", () => {
    const fixture = TestBed.createComponent(CoursesComponent);
    fixture.detectChanges();

    const addBtn = fixture.nativeElement.querySelector(".btn-add-course");
    expect(addBtn).toBeNull();

    const adminEditBtns = fixture.nativeElement.querySelectorAll(".admin-edit-course-btn");
    expect(adminEditBtns.length).toBe(0);

    const progressTracks = fixture.nativeElement.querySelectorAll(".progress-track");
    expect(progressTracks.length).toBeGreaterThan(0);

    const courseBtns = fixture.nativeElement.querySelectorAll(".course-btn");
    expect(courseBtns.length).toBeGreaterThan(0);
    const firstBtnText = courseBtns[0].textContent;
    expect(firstBtnText.includes("Start course") || firstBtnText.includes("Continue course")).toBe(true);
  });
});

describe("CoursesComponent (Admin Mode)", () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [CoursesComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user: signal({
              id: "admin-1",
              name: "Academy Admin",
              email: "admin@test.com",
              role: "Admin",
            }),
          },
        },
      ],
    });
  });

  it("renders Add Course button and Edit Course buttons when user is Admin", () => {
    const fixture = TestBed.createComponent(CoursesComponent);
    fixture.detectChanges();

    const addBtn = fixture.nativeElement.querySelector(".btn-add-course");
    expect(addBtn).toBeTruthy();
    expect(addBtn.textContent).toContain("Add Course");

    // Admin cards have primary "Edit Course" button
    const adminEditBtns = fixture.nativeElement.querySelectorAll(".admin-edit-course-btn");
    expect(adminEditBtns.length).toBeGreaterThan(0);
    expect(adminEditBtns[0].textContent).toContain("Edit Course");

    // Student progress track is not rendered in Admin mode
    const progressTracks = fixture.nativeElement.querySelectorAll(".progress-track");
    expect(progressTracks.length).toBe(0);
  });

  it("allows Admin to add a new course", () => {
    const fixture = TestBed.createComponent(CoursesComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.openAddModal();
    expect(comp.showModal()).toBe("add");

    comp.courseForm.title = "Master Business Presentations";
    comp.courseForm.description = "Pitch with confidence and poise.";
    comp.courseForm.category = "signature";

    comp.saveCourse();

    expect(comp.showModal()).toBe("none");
    expect(comp.courses().some((c) => c.title === "Master Business Presentations")).toBe(true);
  });

  it("allows Admin to edit an existing course", () => {
    const fixture = TestBed.createComponent(CoursesComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    const initial = comp.courses()[0];
    comp.openEditModal(initial);
    expect(comp.showModal()).toBe("edit");
    expect(comp.courseForm.title).toBe(initial.title);

    comp.courseForm.title = "Updated Course Title";
    comp.saveCourse();

    expect(comp.showModal()).toBe("none");
    expect(comp.courses().some((c) => c.title === "Updated Course Title")).toBe(true);
  });
});
