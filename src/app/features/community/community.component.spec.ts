import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { CommunityComponent } from "./community.component";
import { AuthService } from "../../core/auth.service";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";

describe("CommunityComponent (Figma Community & Practice Circles)", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommunityComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user: signal({
              id: "student-1",
              name: "Ananya Kapoor",
              email: "ananya@test.com",
              role: "Student",
            }),
          },
        },
      ],
    });
  });

  it("renders page title, kicker, composer, and initial posts", () => {
    const fixture = TestBed.createComponent(CommunityComponent);
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector(".page-title");
    expect(titleEl.textContent).toContain("Good conversations start here.");

    const kickerEl = fixture.nativeElement.querySelector(".section-kicker");
    expect(kickerEl.textContent).toContain("YOUR PEOPLE. YOUR PLACE.");

    // Check composer
    const composer = fixture.nativeElement.querySelector(".composer-card");
    expect(composer).toBeTruthy();

    // Check feed posts (initial 4 Figma posts)
    const posts = fixture.nativeElement.querySelectorAll(".post-card");
    expect(posts.length).toBe(4);

    // Check right sidebar next event card
    const nextCircleCard = fixture.nativeElement.querySelector(".next-circle-card");
    expect(nextCircleCard).toBeTruthy();
    expect(nextCircleCard.textContent).toContain("The Friday Conversation Circle");
  });

  it("filters posts by category tab", () => {
    const fixture = TestBed.createComponent(CommunityComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.filteredPosts().length).toBe(4);

    // Filter to wins
    comp.selectFilter("wins");
    fixture.detectChanges();
    expect(comp.filteredPosts().length).toBe(1);
    expect(comp.filteredPosts()[0].authorName).toBe("Priya Menon");

    // Reset to all
    comp.selectFilter("all");
    fixture.detectChanges();
    expect(comp.filteredPosts().length).toBe(4);
  });

  it("toggles likes on a post", () => {
    const fixture = TestBed.createComponent(CommunityComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    const targetPost = comp.posts()[0];
    const initialLikes = targetPost.likes;
    expect(targetPost.isLiked).toBe(false);

    comp.toggleLike(targetPost.id);
    fixture.detectChanges();

    const updated = comp.posts().find((p) => p.id === targetPost.id);
    expect(updated?.isLiked).toBe(true);
    expect(updated?.likes).toBe(initialLikes + 1);
  });

  it("submits a new post through createPost()", () => {
    const fixture = TestBed.createComponent(CommunityComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    const initialCount = comp.posts().length;
    comp.newPostText = "Practicing my pause before answering difficult questions!";
    comp.createPost();
    fixture.detectChanges();

    expect(comp.posts().length).toBe(initialCount + 1);
    expect(comp.posts()[0].text).toContain("Practicing my pause");
    expect(comp.newPostText).toBe("");
  });

  it("allows voting on the interactive poll", () => {
    const fixture = TestBed.createComponent(CommunityComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    const pollPost = comp.posts().find((p) => !!p.poll);
    expect(pollPost).toBeTruthy();

    // Vote on option 1
    comp.votePoll(pollPost!.id, "opt-1");
    fixture.detectChanges();

    const updatedPost = comp.posts().find((p) => p.id === pollPost!.id);
    const opt1 = updatedPost?.poll?.options.find((o) => o.id === "opt-1");
    expect(opt1?.selected).toBe(true);
  });
});
