import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";

export interface Course {
  id: string;
  title: string;
  tag: string;
  category: "all" | "fluency" | "expression" | "foundations" | "signature";
  description: string;
  lessonsCount: number;
  durationLabel: string;
  levelLabel: string;
  thumbnail: string;
  progressPercent: number;
  badgeLabel: string;
  isExpired?: boolean;
  isFeatured?: boolean;
}

export const FIGMA_COURSES: Course[] = [
  {
    id: "think-in-english",
    title: "Think in English",
    tag: "FLUENCY & MINDSET",
    category: "fluency",
    description:
      "Train your brain to formulate thoughts directly in English without exhausting mental translation.",
    lessonsCount: 10,
    durationLabel: "2h 45m",
    levelLabel: "All levels",
    thumbnail: "/assets/communication-practice.jpg",
    progressPercent: 35,
    badgeLabel: "Included in your membership",
  },
  {
    id: "stories-worth-telling",
    title: "Stories Worth Telling",
    tag: "EXPRESSION",
    category: "expression",
    description:
      "Craft personal stories that connect, inspire, and keep any room engaged from beginning to end.",
    lessonsCount: 14,
    durationLabel: "3h 10m",
    levelLabel: "Intermediate",
    thumbnail: "/assets/community-learning-hero.jpg",
    progressPercent: 0,
    badgeLabel: "Included in your membership",
  },
  {
    id: "grammar-naturally",
    title: "Grammar, Naturally",
    tag: "FOUNDATIONS",
    category: "foundations",
    description:
      "Absorb grammar principles through real dialogue patterns rather than dry textbook memorization.",
    lessonsCount: 20,
    durationLabel: "3h 40m",
    levelLabel: "Foundation",
    thumbnail: "/assets/bhuvaneswari-mentor.jpg",
    progressPercent: 10,
    badgeLabel: "Included in your membership",
  },
  {
    id: "speak-with-confidence",
    title: "Speak with Confidence",
    tag: "SIGNATURE PROGRAM",
    category: "signature",
    description:
      "Overcome stage fright and boardroom anxiety with Bhuvaneswari's signature speaking toolkit.",
    lessonsCount: 20,
    durationLabel: "4h 30m",
    levelLabel: "All levels",
    thumbnail: "/assets/bhuvaneswari-portrait.jpg",
    progressPercent: 65,
    badgeLabel: "Signature program",
    isFeatured: true,
  },
];

@Component({
  selector: "fcc-courses",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./courses.component.html",
  styleUrls: ["./courses.component.css"],
})
export class CoursesComponent {
  private static readonly STORAGE_KEY = "fcc_courses_catalog";
  readonly auth = inject(AuthService);

  readonly isAdmin = computed(() => {
    const role = this.auth.user()?.role;
    return role === "Admin" || role === "SuperAdmin";
  });

  readonly courses = signal<Course[]>(this.loadCourses());
  readonly selectedCategory = signal<string>("all");
  readonly searchQuery = signal<string>("");

  // Modal and toast state for Admin course management
  readonly showModal = signal<"none" | "add" | "edit">("none");
  readonly editingCourseId = signal<string | null>(null);
  readonly toastMessage = signal<string>("");
  private toastTimer?: any;

  courseForm = {
    title: "",
    tag: "EXPRESSION",
    category: "expression" as Course["category"],
    description: "",
    lessonsCount: 10,
    durationLabel: "2h 30m",
    levelLabel: "All levels",
    thumbnail: "/assets/communication-practice.jpg",
    badgeLabel: "Included in your membership",
    isFeatured: false,
  };

  readonly categories = [
    { id: "all", label: "All Courses" },
    { id: "in-progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
    { id: "expired", label: "Expired" },
    { id: "paid-membership", label: "Paid membership" },
  ];

  /**
   * Filtered courses based on status, membership, and search input
   */
  readonly filteredCourses = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this.courses().filter((course) => {
      const matchesCat =
        cat === "all" ||
        (cat === "in-progress" &&
          course.progressPercent > 0 &&
          course.progressPercent < 100) ||
        (cat === "completed" && course.progressPercent >= 100) ||
        (cat === "expired" && course.isExpired === true) ||
        (cat === "paid-membership" &&
          course.badgeLabel.toLowerCase().includes("membership"));
      const matchesQuery =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tag.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  });

  /**
   * Overall member learning progress across all courses
   */
  readonly overallProgress = computed(() => {
    const list = this.courses();
    if (!list.length) return 0;
    const total = list.reduce((sum, c) => sum + c.progressPercent, 0);
    return Math.round(total / list.length);
  });

  selectCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
  }

  clearSearch() {
    this.searchQuery.set("");
  }

  getCategoryClass(tag: string): string {
    const normalized = (tag || "").toUpperCase().trim();
    if (normalized.includes("FLUENCY")) return "category-fluency";
    if (normalized.includes("EXPRESSION")) return "category-expression";
    if (normalized.includes("FOUNDATION")) return "category-foundations";
    if (normalized.includes("SIGNATURE")) return "category-signature";
    return "category-default";
  }

  // --- Admin Course Management Actions ---

  openAddModal() {
    this.courseForm = {
      title: "",
      tag: "EXPRESSION",
      category: "expression",
      description: "",
      lessonsCount: 10,
      durationLabel: "2h 30m",
      levelLabel: "All levels",
      thumbnail: "/assets/communication-practice.jpg",
      badgeLabel: "Included in your membership",
      isFeatured: false,
    };
    this.editingCourseId.set(null);
    this.showModal.set("add");
  }

  openEditModal(course: Course, event?: Event) {
    if (event) event.stopPropagation();
    this.courseForm = {
      title: course.title,
      tag: course.tag,
      category: course.category,
      description: course.description,
      lessonsCount: course.lessonsCount,
      durationLabel: course.durationLabel,
      levelLabel: course.levelLabel,
      thumbnail: course.thumbnail,
      badgeLabel: course.badgeLabel,
      isFeatured: !!course.isFeatured,
    };
    this.editingCourseId.set(course.id);
    this.showModal.set("edit");
  }

  closeModal() {
    this.showModal.set("none");
    this.editingCourseId.set(null);
  }

  onCategoryChange(newCategory: Course["category"]) {
    // If the tag matches one of the defaults, update it to match the new category
    if (newCategory === "fluency") this.courseForm.tag = "FLUENCY & MINDSET";
    else if (newCategory === "expression") this.courseForm.tag = "EXPRESSION";
    else if (newCategory === "foundations") this.courseForm.tag = "FOUNDATIONS";
    else if (newCategory === "signature") this.courseForm.tag = "SIGNATURE PROGRAM";
  }

  saveCourse() {
    const title = this.courseForm.title.trim();
    if (!title) return;

    if (this.showModal() === "add") {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const id = slug || `course-${Date.now()}`;

      let tag = this.courseForm.tag.trim();
      if (!tag) {
        tag = this.courseForm.category.toUpperCase();
      }

      const newCourse: Course = {
        id,
        title,
        tag,
        category: this.courseForm.category,
        description:
          this.courseForm.description.trim() ||
          "Curated lessons and speaking exercises designed to elevate your English confidence.",
        lessonsCount: Number(this.courseForm.lessonsCount) || 1,
        durationLabel: this.courseForm.durationLabel.trim() || "1h 00m",
        levelLabel: this.courseForm.levelLabel.trim() || "All levels",
        thumbnail:
          this.courseForm.thumbnail.trim() ||
          "/assets/communication-practice.jpg",
        progressPercent: 0,
        badgeLabel:
          this.courseForm.badgeLabel.trim() || "Included in your membership",
        isFeatured: this.courseForm.isFeatured,
      };

      this.courses.update((list) => [newCourse, ...list]);
      this.persistCourses();
      this.closeModal();
      this.showToast(`Course "${title}" added successfully!`);
    } else if (this.showModal() === "edit") {
      const editId = this.editingCourseId();
      if (!editId) return;

      this.courses.update((list) =>
        list.map((c) => {
          if (c.id !== editId) return c;
          return {
            ...c,
            title,
            tag: this.courseForm.tag.trim() || c.tag,
            category: this.courseForm.category,
            description: this.courseForm.description.trim() || c.description,
            lessonsCount: Number(this.courseForm.lessonsCount) || c.lessonsCount,
            durationLabel: this.courseForm.durationLabel.trim() || c.durationLabel,
            levelLabel: this.courseForm.levelLabel.trim() || c.levelLabel,
            thumbnail: this.courseForm.thumbnail.trim() || c.thumbnail,
            badgeLabel: this.courseForm.badgeLabel.trim() || c.badgeLabel,
            isFeatured: this.courseForm.isFeatured,
          };
        }),
      );
      this.persistCourses();
      this.closeModal();
      this.showToast(`Course "${title}" updated successfully!`);
    }
  }

  deleteCourse(courseId: string, event?: Event) {
    if (event) event.stopPropagation();
    const course = this.courses().find((c) => c.id === courseId);
    const name = course?.title || "this course";
    if (typeof window !== "undefined" && window.confirm) {
      if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    }

    this.courses.update((list) => list.filter((c) => c.id !== courseId));
    this.persistCourses();
    this.showToast(`Course "${name}" deleted.`);
  }

  private showToast(msg: string) {
    this.toastMessage.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set("");
    }, 3500);
  }

  private loadCourses(): Course[] {
    try {
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem(CoursesComponent.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {}
    return FIGMA_COURSES;
  }

  private persistCourses() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          CoursesComponent.STORAGE_KEY,
          JSON.stringify(this.courses()),
        );
      }
    } catch {}
  }
}
