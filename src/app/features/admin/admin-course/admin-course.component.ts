import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/auth.service";

export interface AdminLesson {
  id: string;
  numberLabel: string;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  quote?: string;
  isFreePreview: boolean;
  hasResources: boolean;
  discussionsEnabled: boolean;
  status: "published" | "draft";
  accessTier: "all" | "free" | "diamond";
}

export interface AdminModule {
  id: string;
  moduleNumber: string;
  title: string;
  summary: string;
  expanded: boolean;
  status: "published" | "draft";
  lessons: AdminLesson[];
}

export interface AdminCourseDetail {
  id: string;
  title: string;
  tagline: string;
  badgeLabel: string;
  category: "signature" | "fluency" | "expression" | "foundations";
  level: string;
  mentorName: string;
  mentorRole: string;
  mentorAvatar: string;
  description: string;
  thumbnail: string;
  status: "published" | "draft";
  studentsEnrolled: number;
  avgCompletionRate: number;
  modules: AdminModule[];
}

export const INITIAL_ADMIN_COURSES: AdminCourseDetail[] = [
  {
    id: "speak-with-confidence",
    title: "Speak with Confidence",
    tagline: "Signature Speaking Toolkit for Boardrooms and Public Stages",
    badgeLabel: "SIGNATURE PROGRAM",
    category: "signature",
    level: "All levels",
    mentorName: "Bhuvaneswari Sistla",
    mentorRole: "Mentor & Founder",
    mentorAvatar: "/assets/bhuvaneswari-mentor.jpg",
    description:
      "Overcome stage fright and boardroom anxiety with Bhuvaneswari's signature speaking toolkit. Master vocal resonance, structure thoughts under pressure, and captivate any audience.",
    thumbnail: "/assets/bhuvaneswari-portrait.jpg",
    status: "published",
    studentsEnrolled: 1280,
    avgCompletionRate: 94,
    modules: [
      {
        id: "mod-01",
        moduleNumber: "01",
        title: "Find your voice",
        summary: "4 lessons · 44m 32s · Published",
        expanded: true,
        status: "published",
        lessons: [
          {
            id: "les-01",
            numberLabel: "01",
            title: "Daily Practice Speaking Like This!",
            duration: "05:52",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Bhuvaneswari's foundational daily speaking workout to cultivate vocal ease, resonance, and natural confidence.",
            quote: "A little practice. A little courage. Every day.",
            isFreePreview: true,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-02",
            numberLabel: "02",
            title: "Breath, body & grounding",
            duration: "14:20",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Physical exercises to steady your nervous system and speak with composed presence.",
            quote: "A steady breath creates a steady voice.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-03",
            numberLabel: "03",
            title: "Owning your space",
            duration: "11:50",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "How posture, eye contact, and stage movements communicate natural authority without arrogance.",
            quote: "Take up space with kindness and conviction.",
            isFreePreview: false,
            hasResources: false,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-04",
            numberLabel: "04",
            title: "Vocal resonance & pacing",
            duration: "12:30",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Learning to slow down intentionally and let key words land in the listener's mind.",
            quote: "When you slow down, the room leans in.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
        ],
      },
      {
        id: "mod-02",
        moduleNumber: "02",
        title: "Build your foundation",
        summary: "4 lessons · 50m 05s · Published",
        expanded: false,
        status: "published",
        lessons: [
          {
            id: "les-05",
            numberLabel: "05",
            title: "Structuring your thoughts",
            duration: "13:00",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "The 3-point framework for impromptu speaking, meeting contributions, and concise updates.",
            quote: "Clear thinking precedes compelling speaking.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-06",
            numberLabel: "06",
            title: "Eliminating filler words",
            duration: "09:40",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Replacing 'um', 'like', and 'basically' with intentional pauses that project authority.",
            quote: "A pause is not empty; it is punctuation.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-07",
            numberLabel: "07",
            title: "Storytelling essentials",
            duration: "16:10",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Crafting relatable character hooks, stakes, and emotional resolution in professional narratives.",
            quote: "People forget data; they remember stories.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-08",
            numberLabel: "08",
            title: "Answering difficult questions",
            duration: "11:15",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Staying calm and articulate under scrutiny or unexpected interruptions.",
            quote: "You don't need all the answers, just genuine presence.",
            isFreePreview: false,
            hasResources: false,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
        ],
      },
      {
        id: "mod-03",
        moduleNumber: "03",
        title: "Mastering Delivery & Presence",
        summary: "4 lessons · 48m 10s · Published",
        expanded: false,
        status: "published",
        lessons: [
          {
            id: "les-09",
            numberLabel: "09",
            title: "Vocal pitch and emotional range",
            duration: "10:45",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Avoiding monotony by modulating pitch to emphasize key insights.",
            quote: "Your tone tells the real story.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-10",
            numberLabel: "10",
            title: "Pacing under boardroom pressure",
            duration: "15:20",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Tactics to prevent fast-talking when stakes are elevated.",
            quote: "Speed indicates rushing; steady rhythm signals command.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-11",
            numberLabel: "11",
            title: "Non-verbal presence & posture",
            duration: "12:10",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Aligning shoulders, hands, and facial openness with spoken words.",
            quote: "Body language speaks before your voice begins.",
            isFreePreview: false,
            hasResources: false,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-12",
            numberLabel: "12",
            title: "Audience engagement hooks",
            duration: "14:30",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Opening hooks and rhetorical techniques that instantly win audience attention.",
            quote: "Earn their attention in the first 30 seconds.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
        ],
      },
      {
        id: "mod-04",
        moduleNumber: "04",
        title: "The Fearless Speaker Toolkit",
        summary: "4 lessons · 54m 30s · Published",
        expanded: false,
        status: "published",
        lessons: [
          {
            id: "les-13",
            numberLabel: "13",
            title: "Overcoming stage anxiety in real time",
            duration: "18:00",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Neuroscience-backed reframing techniques for stage fright and trembling hands.",
            quote: "Nerves are energy waiting to be directed.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-14",
            numberLabel: "14",
            title: "The 60-second elevator pitch",
            duration: "08:50",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Condensing complex ideas into a crisp, memorable introductory pitch.",
            quote: "Simplicity is the ultimate sophistication in speech.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-15",
            numberLabel: "15",
            title: "Handling tough Q&A sessions",
            duration: "16:40",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Bridging techniques when answering hostile or off-topic questions.",
            quote: "A question is an opportunity to clarify, not a challenge.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
          {
            id: "les-16",
            numberLabel: "16",
            title: "Your personal speaking compass",
            duration: "20:15",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description:
              "Developing your authentic speaking identity and long-term daily practice routine.",
            quote: "True communication is a lifelong circle of connection.",
            isFreePreview: false,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
        ],
      },
    ],
  },
  {
    id: "think-in-english",
    title: "Think in English",
    tagline: "Break mental translation habits and build rapid speech fluency",
    badgeLabel: "FLUENCY & MINDSET",
    category: "fluency",
    level: "All levels",
    mentorName: "Bhuvaneswari Sistla",
    mentorRole: "Mentor & Founder",
    mentorAvatar: "/assets/bhuvaneswari-mentor.jpg",
    description:
      "Train your brain to formulate thoughts directly in English without exhausting mental translation.",
    thumbnail: "/assets/communication-practice.jpg",
    status: "published",
    studentsEnrolled: 840,
    avgCompletionRate: 88,
    modules: [
      {
        id: "mod-tie-01",
        moduleNumber: "01",
        title: "Rewiring Internal Monologue",
        summary: "3 lessons · 32m · Published",
        expanded: true,
        status: "published",
        lessons: [
          {
            id: "les-tie-01",
            numberLabel: "01",
            title: "Stopping the native tongue detour",
            duration: "10:15",
            videoUrl: "/assets/daily-practice-speaking.mp4",
            description: "Why translation delays your words and how to disrupt the loop.",
            quote: "Think first, polish later.",
            isFreePreview: true,
            hasResources: true,
            discussionsEnabled: true,
            status: "published",
            accessTier: "all",
          },
        ],
      },
    ],
  },
  {
    id: "stories-worth-telling",
    title: "Stories Worth Telling",
    tagline: "Craft personal stories that connect, inspire, and engage",
    badgeLabel: "EXPRESSION",
    category: "expression",
    level: "Intermediate",
    mentorName: "Bhuvaneswari Sistla",
    mentorRole: "Mentor & Founder",
    mentorAvatar: "/assets/bhuvaneswari-mentor.jpg",
    description:
      "Craft personal stories that connect, inspire, and keep any room engaged from beginning to end.",
    thumbnail: "/assets/community-learning-hero.jpg",
    status: "published",
    studentsEnrolled: 620,
    avgCompletionRate: 91,
    modules: [],
  },
  {
    id: "grammar-naturally",
    title: "Grammar, Naturally",
    tagline: "Absorb grammar principles through real dialogue patterns",
    badgeLabel: "FOUNDATIONS",
    category: "foundations",
    level: "Foundation",
    mentorName: "Bhuvaneswari Sistla",
    mentorRole: "Mentor & Founder",
    mentorAvatar: "/assets/bhuvaneswari-mentor.jpg",
    description:
      "Absorb grammar principles through real dialogue patterns rather than dry textbook memorization.",
    thumbnail: "/assets/bhuvaneswari-mentor.jpg",
    status: "published",
    studentsEnrolled: 710,
    avgCompletionRate: 86,
    modules: [],
  },
];

@Component({
  selector: "fcc-admin-course",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./admin-course.component.html",
  styleUrls: ["./admin-course.component.scss"],
})
export class AdminCourseComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  // Courses list
  readonly courses = signal<AdminCourseDetail[]>(INITIAL_ADMIN_COURSES);
  readonly selectedCourseId = signal<string>("speak-with-confidence");

  // Active view tab in editor
  readonly activeTab = signal<"curriculum" | "settings" | "pricing" | "students">("curriculum");

  // Search filter
  readonly searchQuery = signal<string>("");

  // Current course computed
  readonly currentCourse = computed(() => {
    const list = this.courses();
    const id = this.selectedCourseId();
    return list.find((c) => c.id === id) || list[0];
  });

  // Selected Lesson in Inspector Drawer
  readonly selectedModuleId = signal<string>("mod-01");
  readonly selectedLessonId = signal<string>("les-01");
  readonly isDrawerOpen = signal<boolean>(true);

  // Edited Lesson Draft (for two-way form binding)
  readonly activeLessonDraft = signal<AdminLesson>({
    id: "les-01",
    numberLabel: "01",
    title: "Daily Practice Speaking Like This!",
    duration: "05:52",
    videoUrl: "/assets/daily-practice-speaking.mp4",
    description:
      "Bhuvaneswari's foundational daily speaking workout to cultivate vocal ease, resonance, and natural confidence.",
    quote: "A little practice. A little courage. Every day.",
    isFreePreview: true,
    hasResources: true,
    discussionsEnabled: true,
    status: "published",
    accessTier: "all",
  });

  // Notification Toast
  readonly toastMessage = signal<string>("");
  private toastTimer?: any;

  // New Module Modal
  readonly isAddModuleModalOpen = signal<boolean>(false);
  newModuleTitle = "";
  newModuleSummary = "";

  // New Course Modal
  readonly isAddCourseModalOpen = signal<boolean>(false);
  newCourseTitle = "";
  newCourseCategory: AdminCourseDetail["category"] = "signature";
  newCourseDescription = "";

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id");
      if (id) {
        if (!this.courses().some((c) => c.id === id)) {
          this.ensureCourseExists(id);
        }
        this.selectedCourseId.set(id);
        const course = this.courses().find((c) => c.id === id);
        if (course && course.modules.length > 0) {
          const firstMod = course.modules[0];
          this.selectedModuleId.set(firstMod.id);
          if (firstMod.lessons.length > 0) {
            this.selectLesson(firstMod.id, firstMod.lessons[0]);
          }
        }
      }
    });
  }

  private ensureCourseExists(id: string) {
    let title = id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    let desc = "Curated lessons and speaking workouts.";
    let category: AdminCourseDetail["category"] = "expression";
    let thumb = "/assets/communication-practice.jpg";

    try {
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem("fcc_courses_catalog");
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find((c: any) => c.id === id);
          if (found) {
            title = found.title;
            desc = found.description;
            category = found.category || "expression";
            thumb = found.thumbnail || thumb;
          }
        }
      }
    } catch {}

    const newDetail: AdminCourseDetail = {
      id,
      title,
      tagline: title + " - Interactive Speaking Curriculum",
      badgeLabel: category.toUpperCase(),
      category,
      level: "All levels",
      mentorName: "Bhuvaneswari Sistla",
      mentorRole: "Mentor & Founder",
      mentorAvatar: "/assets/bhuvaneswari-mentor.jpg",
      description: desc,
      thumbnail: thumb,
      status: "published",
      studentsEnrolled: 0,
      avgCompletionRate: 0,
      modules: [
        {
          id: "mod-01",
          moduleNumber: "01",
          title: "Foundations & Orientation",
          summary: "1 lesson · Published",
          expanded: true,
          status: "published",
          lessons: [
            {
              id: "les-01",
              numberLabel: "01",
              title: "Welcome & Course Overview",
              duration: "04:30",
              videoUrl: "/assets/daily-practice-speaking.mp4",
              description: "Getting started with your course practice workouts.",
              quote: "A little practice. A little courage. Every day.",
              isFreePreview: true,
              hasResources: true,
              discussionsEnabled: true,
              status: "published",
              accessTier: "all",
            },
          ],
        },
      ],
    };

    this.courses.update((list) => [...list, newDetail]);
  }

  // Course Stats
  get totalModulesCount(): number {
    return this.currentCourse().modules.length;
  }

  get totalLessonsCount(): number {
    return this.currentCourse().modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0
    );
  }

  // Switch Selected Course
  switchCourse(courseId: string) {
    this.selectedCourseId.set(courseId);
    const course = this.currentCourse();
    if (course.modules.length > 0) {
      const firstMod = course.modules[0];
      this.selectedModuleId.set(firstMod.id);
      if (firstMod.lessons.length > 0) {
        this.selectLesson(firstMod.id, firstMod.lessons[0]);
      }
    }
  }

  // Toggle Module Accordion
  toggleModule(modId: string) {
    this.courses.update((list) =>
      list.map((c) => {
        if (c.id !== this.selectedCourseId()) return c;
        return {
          ...c,
          modules: c.modules.map((m) =>
            m.id === modId ? { ...m, expanded: !m.expanded } : m
          ),
        };
      })
    );
  }

  // Select Lesson to inspect in drawer
  selectLesson(modId: string, lesson: AdminLesson) {
    this.selectedModuleId.set(modId);
    this.selectedLessonId.set(lesson.id);
    this.activeLessonDraft.set({ ...lesson });
    this.isDrawerOpen.set(true);
  }

  // Save current lesson draft back into module list
  saveLessonDraft() {
    const draft = this.activeLessonDraft();
    const modId = this.selectedModuleId();
    this.courses.update((list) =>
      list.map((c) => {
        if (c.id !== this.selectedCourseId()) return c;
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id !== modId) return m;
            return {
              ...m,
              lessons: m.lessons.map((l) => (l.id === draft.id ? { ...draft } : l)),
            };
          }),
        };
      })
    );
    this.showToast("Lesson '" + draft.title + "' updated successfully.");
  }

  // Toggle Lesson Published Status
  toggleLessonStatus() {
    const current = this.activeLessonDraft();
    const nextStatus = current.status === "published" ? "draft" : "published";
    this.activeLessonDraft.update((d) => ({ ...d, status: nextStatus }));
    this.saveLessonDraft();
  }

  // Add a new lesson to a specific module
  addLessonToModule(modId: string) {
    const course = this.currentCourse();
    const mod = course.modules.find((m) => m.id === modId);
    if (!mod) return;

    const newIndex = mod.lessons.length + 1;
    const formattedNum = (newIndex < 10 ? "0" : "") + newIndex;
    const newLessonId = "les-" + Date.now();

    const newLesson: AdminLesson = {
      id: newLessonId,
      numberLabel: formattedNum,
      title: "New Lesson " + formattedNum,
      duration: "10:00",
      videoUrl: "/assets/daily-practice-speaking.mp4",
      description: "Enter lesson description and practice breakdown here.",
      quote: "Speak clearly and let your voice breathe.",
      isFreePreview: false,
      hasResources: false,
      discussionsEnabled: true,
      status: "draft",
      accessTier: "all",
    };

    this.courses.update((list) =>
      list.map((c) => {
        if (c.id !== this.selectedCourseId()) return c;
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id !== modId) return m;
            return {
              ...m,
              expanded: true,
              lessons: [...m.lessons, newLesson],
            };
          }),
        };
      })
    );

    this.selectLesson(modId, newLesson);
    this.showToast("Created new lesson in " + mod.title);
  }

  // Delete current lesson
  deleteCurrentLesson() {
    const modId = this.selectedModuleId();
    const lessonId = this.selectedLessonId();

    this.courses.update((list) =>
      list.map((c) => {
        if (c.id !== this.selectedCourseId()) return c;
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id !== modId) return m;
            return {
              ...m,
              lessons: m.lessons.filter((l) => l.id !== lessonId),
            };
          }),
        };
      })
    );

    const mod = this.currentCourse().modules.find((m) => m.id === modId);
    if (mod && mod.lessons.length > 0) {
      this.selectLesson(modId, mod.lessons[0]);
    } else {
      this.isDrawerOpen.set(false);
    }

    this.showToast("Lesson deleted.");
  }

  // Duplicate lesson
  duplicateCurrentLesson() {
    const draft = this.activeLessonDraft();
    const modId = this.selectedModuleId();
    const copyId = "les-copy-" + Date.now();

    const copyLesson: AdminLesson = {
      ...draft,
      id: copyId,
      title: draft.title + " (Copy)",
      status: "draft",
    };

    this.courses.update((list) =>
      list.map((c) => {
        if (c.id !== this.selectedCourseId()) return c;
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id !== modId) return m;
            return {
              ...m,
              lessons: [...m.lessons, copyLesson],
            };
          }),
        };
      })
    );

    this.selectLesson(modId, copyLesson);
    this.showToast("Duplicated lesson: " + copyLesson.title);
  }

  // Open Add Module Modal
  openAddModuleModal() {
    this.newModuleTitle = "";
    this.newModuleSummary = "";
    this.isAddModuleModalOpen.set(true);
  }

  // Submit Add Module
  submitAddModule() {
    if (!this.newModuleTitle.trim()) return;

    const course = this.currentCourse();
    const nextNum = course.modules.length + 1;
    const formattedNum = (nextNum < 10 ? "0" : "") + nextNum;
    const newModId = "mod-" + Date.now();

    const newModule: AdminModule = {
      id: newModId,
      moduleNumber: formattedNum,
      title: this.newModuleTitle.trim(),
      summary: "0 lessons · Published",
      expanded: true,
      status: "published",
      lessons: [],
    };

    this.courses.update((list) =>
      list.map((c) => {
        if (c.id !== this.selectedCourseId()) return c;
        return {
          ...c,
          modules: [...c.modules, newModule],
        };
      })
    );

    this.isAddModuleModalOpen.set(false);
    this.showToast("Module '" + newModule.title + "' added.");
  }

  // Delete Module
  deleteModule(modId: string) {
    this.courses.update((list) =>
      list.map((c) => {
        if (c.id !== this.selectedCourseId()) return c;
        return {
          ...c,
          modules: c.modules.filter((m) => m.id !== modId),
        };
      })
    );
    this.showToast("Module removed.");
  }

  // Save entire course
  saveAndPublishCourse() {
    this.showToast("All changes published to student library.");
  }

  // Show Toast
  private showToast(msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(msg);
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set("");
    }, 3500);
  }
}

