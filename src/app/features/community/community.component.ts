import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  selected?: boolean;
}

export interface CommunityReply {
  id: string;
  authorName: string;
  authorInitials: string;
  text: string;
  timeAgo: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorInitials: string;
  authorRole?: string; // e.g. 'MENTOR'
  authorAvatar?: string;
  timeAgo: string;
  circleName: string;
  kicker?: string;
  title?: string;
  text: string;
  tag?: string;
  isPinned?: boolean;
  workshopCard?: {
    thumbnail: string;
    title: string;
    time: string;
    actionUrl: string;
  };
  poll?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
    userVotedOptionId?: string;
  };
  audioNote?: {
    duration: string;
    transcript: string;
    isPlaying?: boolean;
  };
  highlightedReply?: CommunityReply;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  isSaved?: boolean;
  category: "all" | "circles" | "saved" | "wins";
}

export interface CircleGroup {
  id: string;
  name: string;
  newConversations: number;
}

export interface FamiliarMember {
  id: string;
  name: string;
  initials: string;
  status: string;
}

@Component({
  selector: "fcc-community",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./community.component.html",
  styleUrls: ["./community.component.css"],
})
export class CommunityComponent {
  readonly auth = inject(AuthService);

  // Active filter tab: 'all' | 'circles' | 'saved' | 'wins'
  readonly activeFilter = signal<"all" | "circles" | "saved" | "wins">("all");
  readonly activeCircleTag = signal<string | null>(null);

  // Sorting
  readonly sortOrder = signal<"recent" | "popular">("recent");

  // Post composer state
  newPostText = "";
  composerMode = signal<"thought" | "voice" | "question" | "poll">("thought");
  showTranscript = signal<boolean>(false);

  // Audio simulation state
  readonly isAudioPlaying = signal<boolean>(false);

  // Left Sidebar Data
  readonly circles = signal<CircleGroup[]>([
    { id: "c-1", name: "Morning Practice", newConversations: 12 },
    { id: "c-2", name: "Speak with Confidence", newConversations: 5 },
    { id: "c-3", name: "Working Professionals", newConversations: 3 },
  ]);

  readonly conversationStarters = [
    "#MyFirstBraveStep",
    "#EnglishEveryday",
    "#AskYourMentor",
    "#SmallWins",
  ];

  // Right Sidebar Data
  readonly familiarFaces = signal<FamiliarMember[]>([
    {
      id: "m-1",
      name: "Priya Menon",
      initials: "PM",
      status: "Celebrating a brave step",
    },
    {
      id: "m-2",
      name: "Rahul Sharma",
      initials: "RS",
      status: "Practicing every day",
    },
    {
      id: "m-3",
      name: "Meera Reddy",
      initials: "MR",
      status: "Finding her rhythm",
    },
  ]);

  // Feed Posts Data matching Figma
  readonly posts = signal<CommunityPost[]>([
    {
      id: "post-1",
      authorName: "Bhuvaneswari Sistla",
      authorInitials: "BS",
      authorRole: "MENTOR",
      authorAvatar: "/assets/bhuvaneswari-mentor.jpg",
      timeAgo: "2 hours ago",
      circleName: "Club announcements",
      isPinned: true,
      kicker: "PINNED · A NOTE FROM YOUR MENTOR",
      title: "Your ordinary story might be someone’s inspiration.",
      text: "Tomorrow in The Storytelling Studio, we'll turn everyday moments into stories worth sharing. No grand adventures needed — just a moment that meant something to you.",
      workshopCard: {
        thumbnail: "/assets/community-learning-hero.jpg",
        title: "The Storytelling Studio",
        time: "Sat, 17 Oct · 11:00 AM IST · 90 min",
        actionUrl: "/live-classes",
      },
      likes: 32,
      isLiked: false,
      commentsCount: 8,
      isSaved: false,
      category: "all",
    },
    {
      id: "post-2",
      authorName: "Priya Menon",
      authorInitials: "PM",
      timeAgo: "2 hours ago",
      circleName: "Our little wins",
      kicker: "A MOMENT WORTH CELEBRATING",
      text: "I led my first team presentation in English today. Without a script! I stumbled a little, took a breath, and kept going. Two months ago, I wouldn’t have imagined this. Thank you for being my practice people. ♡",
      tag: "MY FIRST BRAVE STEP",
      highlightedReply: {
        id: "rep-1",
        authorName: "Ananya Kapoor",
        authorInitials: "AK",
        text: "This is the little push I needed today. So proud of you, Priya!",
        timeAgo: "1 hour ago",
      },
      likes: 18,
      isLiked: false,
      commentsCount: 6,
      isSaved: false,
      category: "wins",
    },
    {
      id: "post-3",
      authorName: "Rahul Sharma",
      authorInitials: "RS",
      timeAgo: "4 hours ago",
      circleName: "Everyday English",
      kicker: "A QUESTION FOR THE CIRCLE",
      title: "Where does your confidence need a little company?",
      text: "I find it hardest to keep a conversation going after introductions. What about you?",
      poll: {
        question: "Where does your confidence need a little company?",
        options: [
          { id: "opt-1", label: "Starting a conversation", votes: 12 },
          { id: "opt-2", label: "Keeping it going", votes: 23, selected: true },
          { id: "opt-3", label: "Speaking in a group", votes: 15 },
        ],
        totalVotes: 50,
        userVotedOptionId: "opt-2",
      },
      likes: 12,
      isLiked: false,
      commentsCount: 12,
      isSaved: false,
      category: "all",
    },
    {
      id: "post-4",
      authorName: "Meera Reddy",
      authorInitials: "MR",
      timeAgo: "5 hours ago",
      circleName: "Morning Practice",
      kicker: "TODAY'S ONE-MINUTE STORY",
      text: "A small story about the day I finally asked for directions instead of opening my phone. Sharing my brave minute for today's challenge!",
      audioNote: {
        duration: "0:58",
        transcript:
          "I was standing at the corner of Brigade Road... instead of searching Google Maps, I smiled and asked the shopkeeper in English. He was so warm! It made my whole afternoon.",
      },
      likes: 21,
      isLiked: false,
      commentsCount: 4,
      isSaved: false,
      category: "circles",
    },
  ]);

  /**
   * Filtered posts derived from active filter, active tag, and sort order
   */
  readonly filteredPosts = computed(() => {
    const filter = this.activeFilter();
    const tag = this.activeCircleTag();
    let list = this.posts();

    if (filter === "circles") {
      list = list.filter((p) => p.circleName !== "Club announcements");
    } else if (filter === "saved") {
      list = list.filter((p) => p.isSaved);
    } else if (filter === "wins") {
      list = list.filter(
        (p) => p.category === "wins" || p.circleName.includes("wins")
      );
    }

    if (tag) {
      list = list.filter(
        (p) =>
          p.text.toLowerCase().includes(tag.toLowerCase()) ||
          (p.tag && p.tag.toLowerCase().includes(tag.replace("#", "").toLowerCase()))
      );
    }

    if (this.sortOrder() === "popular") {
      list = [...list].sort((a, b) => b.likes - a.likes);
    }

    return list;
  });

  selectFilter(filter: "all" | "circles" | "saved" | "wins") {
    this.activeFilter.set(filter);
    this.activeCircleTag.set(null);
  }

  filterByTag(tag: string) {
    if (this.activeCircleTag() === tag) {
      this.activeCircleTag.set(null);
    } else {
      this.activeCircleTag.set(tag);
    }
  }

  toggleLike(postId: string) {
    this.posts.update((list) =>
      list.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  }

  toggleSave(postId: string) {
    this.posts.update((list) =>
      list.map((p) =>
        p.id === postId ? { ...p, isSaved: !p.isSaved } : p
      )
    );
  }

  votePoll(postId: string, optionId: string) {
    this.posts.update((list) =>
      list.map((p) => {
        if (p.id === postId && p.poll) {
          const updatedOptions = p.poll.options.map((opt) => {
            if (opt.id === optionId) {
              return { ...opt, votes: opt.votes + 1, selected: true };
            }
            if (opt.selected) {
              return { ...opt, votes: Math.max(0, opt.votes - 1), selected: false };
            }
            return opt;
          });
          return {
            ...p,
            poll: {
              ...p.poll,
              options: updatedOptions,
              userVotedOptionId: optionId,
            },
          };
        }
        return p;
      })
    );
  }

  toggleAudio() {
    this.isAudioPlaying.update((val) => !val);
  }

  createPost() {
    const text = this.newPostText.trim();
    if (!text) return;

    const user = this.auth.user();
    const initials = user?.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "AK";

    const newPost: CommunityPost = {
      id: "post-" + Date.now(),
      authorName: user?.name || "Ananya Kapoor",
      authorInitials: initials,
      authorRole: user?.role === "Admin" ? "ADMIN" : undefined,
      timeAgo: "Just now",
      circleName: "Everyday English",
      text,
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      isSaved: false,
      category: "all",
    };

    this.posts.update((list) => [newPost, ...list]);
    this.newPostText = "";
  }

  getPollPercentage(votes: number, total: number): number {
    if (!total) return 0;
    return Math.round((votes / total) * 100);
  }
}
