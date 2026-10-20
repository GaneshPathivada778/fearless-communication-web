import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { CoursePlayerComponent } from "./course-player.component";
import { AuthService } from "../../core/auth.service";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { of } from "rxjs";
import { signal } from "@angular/core";

describe("CoursePlayerComponent (Figma Speak with Confidence)", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoursePlayerComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([["id", "speak-with-confidence"]])),
            snapshot: {
              paramMap: new Map([["id", "speak-with-confidence"]]),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            user: signal({
              id: "student-1",
              name: "Student Tester",
              email: "student@test.com",
              role: "Student",
            }),
          },
        },
      ],
    });
  });

  it("renders course header, mentor info, and initial active lesson", () => {
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector(".program-title");
    expect(titleEl.textContent).toContain("Speak with Confidence");

    const kickerEl = fixture.nativeElement.querySelector(".program-kicker");
    expect(kickerEl.textContent).toContain("YOUR SIGNATURE PROGRAM");

    const authorText = fixture.nativeElement.querySelector(".author-details");
    expect(authorText.textContent).toContain("Bhuvaneswari Sistla");
    expect(authorText.textContent).toContain("20 lessons");

    // Check active lesson is Daily Practice Speaking Like This!
    const lessonTitle = fixture.nativeElement.querySelector(".lesson-main-title");
    expect(lessonTitle.textContent).toContain("Daily Practice Speaking Like This!");

    // Check video element exists with the local mp4
    const videoEl: HTMLVideoElement = fixture.nativeElement.querySelector(".video-element");
    expect(videoEl).toBeTruthy();
    expect(videoEl.src).toContain("daily-practice-speaking.mp4");

    // Check quote overlay
    const quoteEl = fixture.nativeElement.querySelector(".quote-text");
    expect(quoteEl.textContent).toContain("A little practice. A little courage. Every day.");
  });

  it("switches active tabs (My notes, Resources, Discussion, Speaking assignment)", () => {
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.activeTab()).toBe("notes");
    expect(fixture.nativeElement.querySelector(".notes-panel")).toBeTruthy();

    // Switch to Resources
    comp.activeTab.set("resources");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".resources-panel")).toBeTruthy();

    // Switch to Discussion
    comp.activeTab.set("discussion");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".discussion-panel")).toBeTruthy();

    // Switch to Speaking assignment
    comp.activeTab.set("assignment");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".assignment-panel")).toBeTruthy();
  });

  it("allows selecting a different lesson and updates active lesson state", () => {
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.currentLesson().id).toBe("les-01");

    // Select lesson 09 in module 03
    comp.selectLesson("mod-03", "les-09");
    fixture.detectChanges();

    expect(comp.currentLesson().id).toBe("les-09");
    expect(comp.currentLesson().title).toBe("The art of a good question");

    const lessonTitle = fixture.nativeElement.querySelector(".lesson-main-title");
    expect(lessonTitle.textContent).toContain("The art of a good question");
  });

  it("toggles lesson completion and recalculates overall progress stats", () => {
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    const initialPercent = comp.progressStats().percent;
    expect(comp.currentLesson().completed).toBe(false);

    // Toggle complete
    comp.toggleLessonComplete();
    fixture.detectChanges();

    expect(comp.currentLesson().completed).toBe(true);
    expect(comp.progressStats().percent).toBeGreaterThan(initialPercent);
  });

  it("toggles program bookmark save button", () => {
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.isSaved()).toBe(false);
    comp.toggleSaveProgram();
    fixture.detectChanges();
    expect(comp.isSaved()).toBe(true);
  });

  it("posts a comment to discussion", () => {
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    const initialCount = comp.comments().length;
    comp.newCommentText = "A wonderful lesson on opening questions.";
    comp.postComment();
    fixture.detectChanges();

    expect(comp.comments().length).toBe(initialCount + 1);
    expect(comp.comments()[0].text).toBe("A wonderful lesson on opening questions.");
  });
});
