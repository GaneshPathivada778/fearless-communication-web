import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";

export interface Lesson {
  id: string;
  numberLabel: string;
  title: string;
  duration: string;
  completed: boolean;
  description: string;
  quote?: string;
  videoUrl?: string;
  videoPlaceholderUrl?: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: string;
  title: string;
  summary: string;
  completed: boolean;
  expanded: boolean;
  lessons: Lesson[];
}

export interface DiscussionComment {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  text: string;
  likes: number;
  timeAgo: string;
}

export interface PracticeResource {
  id: string;
  title: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
}

@Component({
  selector: "fcc-course-player",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./course-player.component.html",
  styleUrls: ["./course-player.component.css"],
})
export class CoursePlayerComponent {
  @ViewChild("videoPlayer") videoPlayer?: ElementRef<HTMLVideoElement>;

  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);

  // Program header state
  readonly courseTitle = signal<string>("Speak with Confidence");
  readonly kicker = signal<string>("YOUR SIGNATURE PROGRAM · ALL LEVELS");
  readonly mentorName = signal<string>("Bhuvaneswari Sistla");
  readonly mentorRole = signal<string>("Mentor & Founder");
  readonly mentorAvatar = signal<string>("/assets/bhuvaneswari-mentor.jpg");
  readonly isSaved = signal<boolean>(false);

  // Active Tab: 'notes' | 'resources' | 'discussion' | 'assignment'
  readonly activeTab = signal<"notes" | "resources" | "discussion" | "assignment">("notes");

  // Video playback state
  readonly isPlaying = signal<boolean>(false);
  readonly currentTime = signal<string>("00:00");
  readonly totalTime = signal<string>("05:52");
  readonly progressPercent = signal<number>(0);
  readonly playbackSpeed = signal<string>("1x");
  readonly isMuted = signal<boolean>(false);

  // Active module & lesson (defaults to Module 01, Lesson 01: Daily Practice)
  readonly currentModuleId = signal<string>("mod-01");
  readonly currentLessonId = signal<string>("les-01");

  // Notes state
  readonly noteText = signal<string>(
    'Focus on dropping shoulder tension before speaking. Breathe deeply into the lower diaphragm and let words flow with natural rhythm.'
  );
  readonly noteSavedStatus = signal<string>("All changes saved");

  // Assignment modal / audio recorder simulation
  readonly isRecording = signal<boolean>(false);
  readonly recordingSeconds = signal<number>(0);
  readonly assignmentSubmitted = signal<boolean>(false);
  private recordingTimer?: any;

  // New discussion comment
  newCommentText = "";

  // Course Curriculum Structure
  readonly modules = signal<CourseModule[]>([
    {
      id: "mod-01",
      moduleNumber: "01",
      title: "Find your voice",
      summary: "4 lessons · In progress",
      completed: false,
      expanded: true,
      lessons: [
        {
          id: "les-01",
          numberLabel: "01",
          title: "Daily Practice Speaking Like This!",
          duration: "05:52",
          completed: false,
          description:
            "Bhuvaneswari's foundational daily speaking workout to cultivate vocal ease, resonance, and natural confidence.",
          quote: "A little practice. A little courage. Every day.",
          videoUrl: "/assets/daily-practice-speaking.mp4",
        },
        {
          id: "les-02",
          numberLabel: "02",
          title: "Breath, body & grounding",
          duration: "14:20",
          completed: false,
          description: "Physical exercises to steady your nervous system.",
          quote: "A steady breath creates a steady voice.",
          videoUrl: "/assets/daily-practice-speaking.mp4",
        },
        {
          id: "les-03",
          numberLabel: "03",
          title: "Owning your space",
          duration: "11:50",
          completed: false,
          description: "How posture and eye contact communicate authority.",
          quote: "Take up space with kindness and conviction.",
          videoUrl: "/assets/daily-practice-speaking.mp4",
        },
        {
          id: "les-04",
          numberLabel: "04",
          title: "Vocal resonance & pacing",
          duration: "12:30",
          completed: false,
          description: "Learning to slow down and let your words land.",
          quote: "When you slow down, the room leans in.",
          videoUrl: "/assets/daily-practice-speaking.mp4",
        },
      ],
    },
    {
      id: "mod-02",
      moduleNumber: "02",
      title: "Build your foundation",
      summary: "4 lessons · Completed",
      completed: true,
      expanded: false,
      lessons: [
        {
          id: "les-05",
          numberLabel: "05",
          title: "Structuring your thoughts",
          duration: "13:00",
          completed: true,
          description: "The 3-point framework for impromptu speaking.",
          quote: "Clear thinking precedes compelling speaking.",
        },
        {
          id: "les-06",
          numberLabel: "06",
          title: "Eliminating filler words",
          duration: "09:40",
          completed: true,
          description: "Replacing 'um', 'like', and 'basically' with intentional pauses.",
          quote: "A pause is not empty; it is punctuation.",
        },
        {
          id: "les-07",
          numberLabel: "07",
          title: "Storytelling essentials",
          duration: "16:10",
          completed: true,
          description: "Hooks, conflicts, and emotional connection.",
          quote: "People forget data; they remember stories.",
        },
        {
          id: "les-08",
          numberLabel: "08",
          title: "Answering difficult questions",
          duration: "11:15",
          completed: true,
          description: "Staying composed when caught off guard.",
          quote: "You don't need all the answers, just genuine presence.",
        },
      ],
    },
    {
      id: "mod-03",
      moduleNumber: "03",
      title: "The conversation",
      summary: "4 lessons · In progress",
      completed: false,
      expanded: false,
      lessons: [
        {
          id: "les-09",
          numberLabel: "09",
          title: "The art of a good question",
          duration: "12:00",
          completed: false,
          description: 'Move beyond "How are you?" and invite stories, not just answers.',
          quote: "Curiosity is the beginning of a good conversation.",
        },
        {
          id: "les-10",
          numberLabel: "10",
          title: "Listen to connect",
          duration: "15:20",
          completed: false,
          description: "Active empathetic listening that makes others feel seen.",
          quote: "Listening is an act of deep hospitality.",
        },
        {
          id: "les-11",
          numberLabel: "11",
          title: "Keep the conversation flowing",
          duration: "13:45",
          completed: false,
          description: "Seamless transitions and finding shared common ground.",
          quote: "Flow happens when you stop planning your next response.",
        },
        {
          id: "les-12",
          numberLabel: "12",
          title: "Practice: a real conversation",
          duration: "10:00",
          completed: false,
          description: "Guided rehearsal exercise with peer feedback guidance.",
          quote: "Real practice with real courage builds lasting ease.",
        },
      ],
    },
    {
      id: "mod-04",
      moduleNumber: "04",
      title: "Speak in the real world",
      summary: "4 lessons · 58 min",
      completed: false,
      expanded: false,
      lessons: [
        {
          id: "les-13",
          numberLabel: "13",
          title: "Mastering team meetings",
          duration: "14:00",
          completed: false,
          description: "How to intervene gracefully and make your point heard.",
          quote: "Your input matters to the conversation.",
        },
        {
          id: "les-14",
          numberLabel: "14",
          title: "Presenting with slides without reading them",
          duration: "16:20",
          completed: false,
          description: "Connecting with human eyes rather than digital bullet points.",
          quote: "You are the presentation; slides are just the backdrop.",
        },
        {
          id: "les-15",
          numberLabel: "15",
          title: "Navigating disagreements calmly",
          duration: "13:10",
          completed: false,
          description: "De-escalating tension while standing firm in your message.",
          quote: "Firm on values, gentle in tone.",
        },
        {
          id: "les-16",
          numberLabel: "16",
          title: "Delivering feedback that elevates",
          duration: "14:30",
          completed: false,
          description: "Kind, constructive, and direct communication.",
          quote: "Feedback given with care builds lasting trust.",
        },
      ],
    },
    {
      id: "mod-05",
      moduleNumber: "05",
      title: "Your confident self",
      summary: "4 lessons · 52 min",
      completed: false,
      expanded: false,
      lessons: [
        {
          id: "les-17",
          numberLabel: "17",
          title: "Creating your signature talk",
          duration: "15:00",
          completed: false,
          description: "Drafting the story you want to be known for.",
          quote: "Your life journey is your strongest credibility.",
        },
        {
          id: "les-18",
          numberLabel: "18",
          title: "Overcoming perfectionism",
          duration: "12:15",
          completed: false,
          description: "Embracing spontaneous slips with grace and humor.",
          quote: "Authenticity will always beat sterile perfection.",
        },
        {
          id: "les-19",
          numberLabel: "19",
          title: "Handling high-stakes pressure",
          duration: "14:00",
          completed: false,
          description: "Anchor rituals for keynote stages and interviews.",
          quote: "Preparation turns pressure into performance.",
        },
        {
          id: "les-20",
          numberLabel: "20",
          title: "The lifelong journey of fearless speech",
          duration: "10:45",
          completed: false,
          description: "Staying engaged with your community and continuing to grow.",
          quote: "A little practice. A little courage. Every day.",
        },
      ],
    },
  ]);

  // Downloadable resources
  readonly resources = signal<PracticeResource[]>([
    {
      id: "res-01",
      title: "Question bank",
      fileType: "PDF",
      fileSize: "1.2 MB",
      downloadUrl: "#",
    },
    {
      id: "res-02",
      title: "Conversation journal",
      fileType: "PDF",
      fileSize: "840 KB",
      downloadUrl: "#",
    },
    {
      id: "res-03",
      title: "Lesson transcript",
      fileType: "PDF",
      fileSize: "620 KB",
      downloadUrl: "#",
    },
  ]);

  // Discussion comments matching Figma
  readonly comments = signal<DiscussionComment[]>([
    {
      id: "comm-01",
      authorName: "Bhuvaneswari Sistla",
      authorRole: "Mentor",
      authorAvatar: "/assets/bhuvaneswari-mentor.jpg",
      text: "What's one question you could ask a colleague tomorrow? Share it here — let's make it feel natural together.",
      likes: 24,
      timeAgo: "1 day ago",
    },
    {
      id: "comm-02",
      authorName: "Aarav Sharma",
      authorRole: "Student",
      authorAvatar: "/assets/communication-practice.jpg",
      text: 'I used "What part of this project brought you the most energy?" in our morning standup. The response was completely different from our usual dry updates!',
      likes: 8,
      timeAgo: "18 hours ago",
    },
  ]);

  /**
   * Currently selected lesson derived from currentLessonId
   */
  readonly currentLesson = computed(() => {
    const id = this.currentLessonId();
    for (const mod of this.modules()) {
      const match = mod.lessons.find((l) => l.id === id);
      if (match) return match;
    }
    return this.modules()[2].lessons[0];
  });

  /**
   * Currently active module derived from currentLesson
   */
  readonly activeModule = computed(() => {
    const lesson = this.currentLesson();
    for (const mod of this.modules()) {
      if (mod.lessons.some((l) => l.id === lesson.id)) {
        return mod;
      }
    }
    return this.modules()[2];
  });

  /**
   * Overall progress percentage calculated across all 20 lessons
   */
  readonly progressStats = computed(() => {
    let total = 0;
    let completed = 0;
    for (const mod of this.modules()) {
      for (const les of mod.lessons) {
        total++;
        if (les.completed) completed++;
      }
    }
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      completed,
      percent,
    };
  });

  toggleSaveProgram() {
    this.isSaved.update((val) => !val);
  }

  togglePlay() {
    const el = this.videoPlayer?.nativeElement;
    if (el) {
      if (el.paused) {
        el.play().catch(() => {});
        this.isPlaying.set(true);
      } else {
        el.pause();
        this.isPlaying.set(false);
      }
    } else {
      this.isPlaying.update((val) => !val);
    }
  }

  toggleMute() {
    const el = this.videoPlayer?.nativeElement;
    if (el) {
      el.muted = !el.muted;
      this.isMuted.set(el.muted);
    } else {
      this.isMuted.update((val) => !val);
    }
  }

  toggleSpeed() {
    const speeds = ["1x", "1.25x", "1.5x", "2x"];
    const curr = this.playbackSpeed();
    const nextIdx = (speeds.indexOf(curr) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    this.playbackSpeed.set(nextSpeed);

    const el = this.videoPlayer?.nativeElement;
    if (el) {
      el.playbackRate = parseFloat(nextSpeed);
    }
  }

  toggleModule(moduleId: string) {
    this.modules.update((list) =>
      list.map((m) =>
        m.id === moduleId ? { ...m, expanded: !m.expanded } : m
      )
    );
  }

  selectLesson(modId: string, lessonId: string) {
    this.currentLessonId.set(lessonId);
    this.currentModuleId.set(modId);
    // Ensure the module is expanded
    this.modules.update((list) =>
      list.map((m) => (m.id === modId ? { ...m, expanded: true } : m))
    );

    // Reset video player time for the newly chosen lesson
    const el = this.videoPlayer?.nativeElement;
    if (el) {
      el.currentTime = 0;
      el.pause();
      this.isPlaying.set(false);
      this.progressPercent.set(0);
    }
  }

  onTimeUpdate(video: HTMLVideoElement) {
    if (!video) return;
    const cur = Math.floor(video.currentTime);
    const dur = Math.floor(video.duration || 0);

    const formatSecs = (totalSecs: number) => {
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
    };

    this.currentTime.set(formatSecs(cur));
    if (dur > 0) {
      this.totalTime.set(formatSecs(dur));
      this.progressPercent.set(Math.min(100, (video.currentTime / video.duration) * 100));
    }
  }

  seek(event: MouseEvent) {
    const el = this.videoPlayer?.nativeElement;
    const target = event.currentTarget as HTMLElement;
    if (!el || !target || !el.duration) return;
    const rect = target.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    el.currentTime = pos * el.duration;
  }

  toggleFullscreen() {
    const container =
      (this.videoPlayer?.nativeElement.closest(".video-container") as HTMLElement) ||
      this.videoPlayer?.nativeElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  toggleLessonComplete() {
    const lesson = this.currentLesson();
    const newStatus = !lesson.completed;

    this.modules.update((mods) =>
      mods.map((m) => {
        const updatedLessons = m.lessons.map((l) =>
          l.id === lesson.id ? { ...l, completed: newStatus } : l
        );
        const allDone = updatedLessons.every((l) => l.completed);
        return {
          ...m,
          lessons: updatedLessons,
          completed: allDone,
        };
      })
    );
  }

  onNoteChange(text: string) {
    this.noteText.set(text);
    this.noteSavedStatus.set("Saving…");
    setTimeout(() => {
      this.noteSavedStatus.set("All changes saved");
    }, 600);
  }

  jumpToTimestamp(time: string) {
    this.currentTime.set(time);
    const parts = time.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    }
    const el = this.videoPlayer?.nativeElement;
    if (el) {
      el.currentTime = seconds;
      el.play().catch(() => {});
    }
    this.isPlaying.set(true);
  }

  postComment() {
    const text = this.newCommentText.trim();
    if (!text) return;

    const user = this.auth.user();
    const newComment: DiscussionComment = {
      id: "comm-" + Date.now(),
      authorName: user?.name || "You",
      authorRole: user?.role || "Student",
      authorAvatar: "/assets/communication-practice.jpg",
      text,
      likes: 0,
      timeAgo: "Just now",
    };

    this.comments.update((list) => [newComment, ...list]);
    this.newCommentText = "";
  }

  startRecording() {
    if (this.isRecording()) {
      this.stopRecording();
      return;
    }
    this.isRecording.set(true);
    this.recordingSeconds.set(0);
    this.recordingTimer = setInterval(() => {
      this.recordingSeconds.update((s) => s + 1);
    }, 1000);
  }

  stopRecording() {
    this.isRecording.set(false);
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
    this.assignmentSubmitted.set(true);
  }

  downloadResource(res: PracticeResource, event: Event) {
    event.preventDefault();
    // Simulate instantaneous safe client download or trigger notification
    const blob = new Blob(
      [
        `Fearless Communication Club - ${res.title}\nModule: The Conversation\nDuration: 12m\nMentor: Bhuvaneswari Sistla`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${res.title.toLowerCase().replace(/\\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
