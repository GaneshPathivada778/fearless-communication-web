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
  readonly auth = inject(AuthService);

  readonly courses = signal<Course[]>(FIGMA_COURSES);
  readonly selectedCategory = signal<string>("all");
  readonly searchQuery = signal<string>("");

  readonly categories = [
    { id: "all", label: "All courses" },
    { id: "fluency", label: "Fluency & Mindset" },
    { id: "expression", label: "Expression" },
    { id: "foundations", label: "Foundations" },
  ];

  /**
   * Filtered courses based on category pill and search input
   */
  readonly filteredCourses = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this.courses().filter((course) => {
      const matchesCat = cat === "all" || course.category === cat;
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
}
