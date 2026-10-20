import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";

export interface CalendarDay {
  dateNumber: number;
  dayName: string;
  label: string;
  hasLiveClass: boolean;
  fullDate: string;
  isToday?: boolean;
}

export interface LiveClass {
  id: string;
  dateNumber: number;
  dateSub: string;
  tag: string;
  title: string;
  description: string;
  coach: string;
  coachAvatar: string;
  timeLabel: string;
  zoomUrl: string;
  isLive?: boolean;
}

const FIGMA_CALENDAR_DAYS: CalendarDay[] = [
  {
    dateNumber: 19,
    dayName: "MON",
    label: "A little room to practice",
    hasLiveClass: false,
    fullDate: "2026-10-19",
  },
  {
    dateNumber: 20,
    dayName: "TUE",
    label: "A little room to practice",
    hasLiveClass: true,
    fullDate: "2026-10-20",
    isToday: true,
  },
  {
    dateNumber: 21,
    dayName: "WED",
    label: "A little room to practice",
    hasLiveClass: false,
    fullDate: "2026-10-21",
  },
  {
    dateNumber: 22,
    dayName: "THU",
    label: "A little room to practice",
    hasLiveClass: true,
    fullDate: "2026-10-22",
  },
  {
    dateNumber: 23,
    dayName: "FRI",
    label: "Conversation Circle",
    hasLiveClass: true,
    fullDate: "2026-10-23",
  },
  {
    dateNumber: 24,
    dayName: "SAT",
    label: "Storytelling Studio",
    hasLiveClass: true,
    fullDate: "2026-10-24",
  },
  {
    dateNumber: 25,
    dayName: "SUN",
    label: "A little room to practice",
    hasLiveClass: true,
    fullDate: "2026-10-25",
  },
];

const FIGMA_CLASSES: LiveClass[] = [
  {
    id: "figma-1",
    dateNumber: 20,
    dateSub: "OCT · TUE",
    tag: "GUIDED PRACTICE",
    title: "Small Talk, Real Connections",
    description:
      "Turn everyday exchanges into meaningful conversations with simple, open-ended questions.",
    coach: "Bhuvaneswari Sistla",
    coachAvatar: "/assets/bhuvaneswari-mentor.jpg",
    timeLabel: "7:00–8:00 PM IST · 60 min",
    zoomUrl: "https://zoom.us/j/test-small-talk",
    isLive: false,
  },
  {
    id: "figma-2",
    dateNumber: 22,
    dateSub: "OCT · THU",
    tag: "ROLE-PLAY STUDIO",
    title: "Speak Up at Work",
    description:
      "Practice sharing an idea, asking for clarity, and finding your voice in your next meeting.",
    coach: "Bhuvaneswari Sistla",
    coachAvatar: "/assets/bhuvaneswari-mentor.jpg",
    timeLabel: "6:30–7:30 PM IST · 60 min",
    zoomUrl: "https://zoom.us/j/test-speak-up",
    isLive: false,
  },
  {
    id: "figma-3",
    dateNumber: 23,
    dateSub: "OCT · FRI",
    tag: "CONVERSATION CIRCLE",
    title: "The Friday Conversation Circle",
    description:
      "Bring a story, a question, or just yourself. An intimate, mentor-led hour of speaking and listening.",
    coach: "Bhuvaneswari Sistla",
    coachAvatar: "/assets/bhuvaneswari-mentor.jpg",
    timeLabel: "6:00–7:00 PM IST · 60 min",
    zoomUrl: "https://zoom.us/j/test-friday-circle",
    isLive: true,
  },
  {
    id: "figma-4",
    dateNumber: 24,
    dateSub: "OCT · SAT",
    tag: "STORYTELLING STUDIO",
    title: "Storytelling Studio",
    description:
      "Practice sharing a personal story with clarity, pacing, and presence.",
    coach: "Bhuvaneswari Sistla",
    coachAvatar: "/assets/bhuvaneswari-mentor.jpg",
    timeLabel: "5:00–6:00 PM IST · 60 min",
    zoomUrl: "https://zoom.us/j/test-storytelling",
    isLive: false,
  },
  {
    id: "figma-5",
    dateNumber: 25,
    dateSub: "OCT · SUN",
    tag: "GUIDED PRACTICE",
    title: "A Little Room to Practice",
    description:
      "A gentle, low-stakes space to warm up your voice and connect with others.",
    coach: "Bhuvaneswari Sistla",
    coachAvatar: "/assets/bhuvaneswari-mentor.jpg",
    timeLabel: "11:00 AM–12:00 PM IST · 60 min",
    zoomUrl: "https://zoom.us/j/test-sunday-practice",
    isLive: false,
  },
];

@Component({
  selector: "fcc-live-classes",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./live-classes.component.html",
  styleUrls: ["./live-classes.component.css"],
})
export class LiveClassesComponent {
  readonly auth = inject(AuthService);

  readonly isAdmin = computed(() => {
    const role = this.auth.user()?.role;
    return role === "Admin" || role === "SuperAdmin";
  });

  readonly currentMonthLabel = signal("October 2026");
  readonly calendarDays = signal<CalendarDay[]>(FIGMA_CALENDAR_DAYS);
  readonly selectedDay = signal<number | null>(null);

  readonly classes = signal<LiveClass[]>(this.loadClasses());
  readonly showAddModal = signal(false);

  /**
   * Filtered classes: if a day is clicked on the calendar strip, show that day's classes.
   * If no day is selected, show all classes.
   */
  readonly filteredClasses = computed(() => {
    const day = this.selectedDay();
    const list = this.classes();
    if (day === null) return list;
    return list.filter((c) => c.dateNumber === day);
  });

  /**
   * Active filter label formatted nicely for the UI (e.g., 'TUE 20 OCT')
   */
  readonly activeFilterLabel = computed(() => {
    const day = this.selectedDay();
    if (day === null) return null;
    const dayObj = this.calendarDays().find((d) => d.dateNumber === day);
    return dayObj ? `${dayObj.dayName} ${dayObj.dateNumber} OCT` : `OCT ${day}`;
  });

  readonly masterCalendarUrl =
    "https://calendar.google.com/calendar/r?cid=webcal://fcc.community/calendar.ics";

  newClassForm = {
    title: "",
    description: "",
    tag: "GUIDED PRACTICE",
    dateNumber: 26,
    dateSub: "OCT · MON",
    timeLabel: "7:00–8:00 PM IST · 60 min",
    zoomUrl: "https://zoom.us/j/",
  };

  selectDay(dayNumber: number) {
    if (this.selectedDay() === dayNumber) {
      this.selectedDay.set(null); // Deselect on second click
    } else {
      this.selectedDay.set(dayNumber);
    }
  }

  clearFilter() {
    this.selectedDay.set(null);
  }

  previousWeek() {
    this.currentMonthLabel.set("October 2026");
  }

  nextWeek() {
    this.currentMonthLabel.set("November 2026");
  }

  resetToCurrentWeek() {
    this.selectedDay.set(null);
    this.currentMonthLabel.set("October 2026");
  }

  showPastNotice() {
    alert("Past session video replays and lesson transcripts are available in the Courses library.");
  }

  /**
   * Returns a specific CSS class for the workshop category tag
   * to provide subtle, organic visual distinction (Editorial color palette).
   */
  getCategoryClass(tag: string): string {
    const normalized = (tag || "").toUpperCase().trim();
    if (normalized.includes("GUIDED")) return "category-guided";
    if (normalized.includes("ROLE-PLAY") || normalized.includes("ROLE PLAY")) return "category-roleplay";
    if (normalized.includes("CONVERSATION")) return "category-conversation";
    if (normalized.includes("STORYTELLING")) return "category-storytelling";
    return "category-default";
  }

  getGoogleCalendarUrl(item: LiveClass): string {
    const title = encodeURIComponent(`FCC Live: ${item.title}`);
    const details = encodeURIComponent(
      `${item.description}\n\nJoin Zoom: ${item.zoomUrl}\nCoach: ${item.coach}`,
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(item.zoomUrl)}`;
  }

  /**
   * Generates a standard .ICS file dynamically on the client side
   * and triggers a download for Apple Calendar, Outlook, and mobile devices.
   */
  downloadIcsFile(item: LiveClass) {
    const pad = (n: number) => (n < 10 ? "0" + n : n);
    const dayStr = pad(item.dateNumber);
    const dtstart = `202610${dayStr}T133000Z`; // UTC representation
    const dtend = `202610${dayStr}T143000Z`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Fearless Communication Club//Live Classes//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:fcc-live-${item.id}@fearlesscommunication.club`,
      `DTSTAMP:20261001T000000Z`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:FCC Live: ${item.title}`,
      `DESCRIPTION:${item.description}\\n\\nJoin Zoom: ${item.zoomUrl}\\nCoach: ${item.coach}`,
      `LOCATION:${item.zoomUrl}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const sanitizedTitle = item.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    link.setAttribute("download", `fcc_class_${sanitizedTitle}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  openAddModal() {
    this.newClassForm = {
      title: "",
      description: "",
      tag: "GUIDED PRACTICE",
      dateNumber: 26,
      dateSub: "OCT · MON",
      timeLabel: "7:00–8:00 PM IST · 60 min",
      zoomUrl: "https://zoom.us/j/",
    };
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  saveClass() {
    if (!this.newClassForm.title.trim()) return;

    const newClass: LiveClass = {
      id: "live-" + Date.now(),
      title: this.newClassForm.title.trim(),
      description: this.newClassForm.description.trim(),
      tag: this.newClassForm.tag.trim() || "GUIDED PRACTICE",
      dateNumber: Number(this.newClassForm.dateNumber) || 20,
      dateSub: this.newClassForm.dateSub.trim() || "OCT",
      coach: "Bhuvaneswari Sistla",
      coachAvatar: "/assets/bhuvaneswari-mentor.jpg",
      timeLabel: this.newClassForm.timeLabel.trim() || "7:00–8:00 PM IST",
      zoomUrl: this.newClassForm.zoomUrl.trim() || "https://zoom.us",
      isLive: false,
    };

    this.classes.update((list) => [newClass, ...list]);
    this.persistClasses();
    this.closeAddModal();
  }

  deleteClass(id: string) {
    this.classes.update((list) => list.filter((c) => c.id !== id));
    this.persistClasses();
  }

  toggleLiveStatus(id: string) {
    this.classes.update((list) =>
      list.map((c) => (c.id === id ? { ...c, isLive: !c.isLive } : c)),
    );
    this.persistClasses();
  }

  private loadClasses(): LiveClass[] {
    try {
      const stored = localStorage.getItem("fcc_figma_live_classes");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      // fallback
    }
    return FIGMA_CLASSES;
  }

  private persistClasses() {
    try {
      localStorage.setItem("fcc_figma_live_classes", JSON.stringify(this.classes()));
    } catch {
      // ignore
    }
  }
}
