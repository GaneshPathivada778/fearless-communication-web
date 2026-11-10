import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AdminCourseComponent } from "./admin-course.component";
import { AuthService } from "../../core/auth.service";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("AdminCourseComponent", () => {
  let component: AdminCourseComponent;
  let fixture: ComponentFixture<AdminCourseComponent>;

  const authServiceStub = {
    user: vi.fn(() => ({
      id: "admin-1",
      name: "Bhuvaneswari Sistla",
      email: "mentor@fcc.org",
      role: "Admin",
    })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCourseComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should initialize with Speak with Confidence flagship course", () => {
    expect(component.currentCourse().title).toBe("Speak with Confidence");
    expect(component.currentCourse().badgeLabel).toBe("SIGNATURE PROGRAM");
    expect(component.totalModulesCount).toBe(4);
    expect(component.totalLessonsCount).toBeGreaterThan(10);
  });

  it("should toggle module expansion", () => {
    const mod1 = component.currentCourse().modules[0];
    expect(mod1.expanded).toBe(true);

    component.toggleModule(mod1.id);
    const updatedMod1 = component.currentCourse().modules[0];
    expect(updatedMod1.expanded).toBe(false);

    component.toggleModule(mod1.id);
    expect(component.currentCourse().modules[0].expanded).toBe(true);
  });

  it("should select a lesson and populate the inspector drawer", () => {
    const mod1 = component.currentCourse().modules[0];
    const lesson2 = mod1.lessons[1];

    component.selectLesson(mod1.id, lesson2);

    expect(component.selectedLessonId()).toBe(lesson2.id);
    expect(component.activeLessonDraft().title).toBe(lesson2.title);
    expect(component.isDrawerOpen()).toBe(true);
  });

  it("should update and save lesson draft changes", () => {
    component.activeLessonDraft.update((draft) => ({
      ...draft,
      title: "Updated Vocal Resonance Drill",
      duration: "08:15",
    }));

    component.saveLessonDraft();

    const mod1 = component.currentCourse().modules[0];
    const savedLesson = mod1.lessons.find((l) => l.id === component.selectedLessonId());
    expect(savedLesson?.title).toBe("Updated Vocal Resonance Drill");
    expect(savedLesson?.duration).toBe("08:15");
    expect(component.toastMessage()).toContain("updated successfully");
  });

  it("should toggle lesson published / draft status", () => {
    const initialStatus = component.activeLessonDraft().status;
    component.toggleLessonStatus();
    expect(component.activeLessonDraft().status).not.toBe(initialStatus);
  });

  it("should add a new lesson to a module", () => {
    const mod1 = component.currentCourse().modules[0];
    const initialCount = mod1.lessons.length;

    component.addLessonToModule(mod1.id);

    const updatedMod1 = component.currentCourse().modules[0];
    expect(updatedMod1.lessons.length).toBe(initialCount + 1);
    expect(component.toastMessage()).toContain("Created new lesson");
  });

  it("should open modal and add a new module", () => {
    component.openAddModuleModal();
    expect(component.isAddModuleModalOpen()).toBe(true);

    component.newModuleTitle = "Stage Presence Masterclass";
    component.submitAddModule();

    expect(component.isAddModuleModalOpen()).toBe(false);
    const lastModule = component.currentCourse().modules[component.currentCourse().modules.length - 1];
    expect(lastModule.title).toBe("Stage Presence Masterclass");
    expect(component.toastMessage()).toContain("added");
  });

  it("should delete a lesson from the module", () => {
    const mod1 = component.currentCourse().modules[0];
    const countBefore = mod1.lessons.length;

    component.deleteCurrentLesson();

    const mod1After = component.currentCourse().modules[0];
    expect(mod1After.lessons.length).toBe(countBefore - 1);
    expect(component.toastMessage()).toContain("deleted");
  });
});

