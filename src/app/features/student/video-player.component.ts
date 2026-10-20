import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  EMPTY,
  Subject,
  Subscription,
  catchError,
  concatMap,
  finalize,
  forkJoin,
  of,
  switchMap,
} from "rxjs";
import { ApiService } from "../../core/api.service";
import { percent } from "../../core/ui-utils";
interface ProgressSave {
  id: string;
  positionSeconds: number;
  durationSeconds: number;
}
@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink],
  template: ` <section class="page narrow">
    <a routerLink="/learning" class="back">← Back to lessons</a>
    @if (loading) {
      <div class="player-loading" role="status">Loading lesson…</div>
    }
    @if (error) {
      <p class="error" role="alert">{{ error }}</p>
    }
    @if (video) {
      <div class="card player">
        <video
          #player
          controls
          preload="metadata"
          [src]="video.mediaKey"
          [poster]="video.thumbnailUrl ?? ''"
          (loadedmetadata)="restorePosition()"
          (timeupdate)="saveProgress()"
          (pause)="saveProgress(true)"
          (ended)="saveProgress(true)"
          (error)="
            mediaError =
              'This video could not be loaded. Please try again later.'
          "
          [attr.aria-label]="video.title"
        ></video>
        @if (mediaError) {
          <p class="error" role="alert">{{ mediaError }}</p>
        }
        <span class="pill">{{ video.accessTier }}</span>
        <h1>{{ video.title }}</h1>
        <p>{{ video.description }}</p>
        <progress
          max="100"
          [value]="percent"
          aria-label="Lesson progress"
        ></progress>
        <div class="player-meta">
          <b>{{ percent }}% complete</b
          ><span
            >Completion threshold {{ video.completionThresholdPercent }}%</span
          >
        </div>
        @if (progressError) {
          <p class="error" role="alert">{{ progressError }}</p>
        }
      </div>
      <div class="card">
        <h2>Lesson comments</h2>
        @if (commentError) {
          <p class="error" role="alert">{{ commentError }}</p>
        }
        <form class="comment-box" (ngSubmit)="addComment()">
          <label class="sr-only" for="lesson-comment">Lesson comment</label
          ><textarea
            id="lesson-comment"
            name="comment"
            [(ngModel)]="comment"
            [disabled]="posting"
            placeholder="Ask a question or share your takeaway…"
          ></textarea
          ><button class="btn primary" [disabled]="posting || !comment.trim()">
            {{ posting ? "Posting…" : "Comment" }}
          </button>
        </form>
        @for (item of comments; track item.id) {
          <div class="comment">
            <div class="avatar" aria-hidden="true">
              {{ item.authorId?.[0] ?? "U" }}
            </div>
            <p>
              {{ item.text
              }}<small>{{ item.createdAtUtc | date: "medium" }}</small>
            </p>
          </div>
        }
        @if (!comments.length && !commentError) {
          <p>No comments yet.</p>
        }
      </div>
    }
  </section>`,
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild("player") player?: ElementRef<HTMLVideoElement>;
  video: any;
  comments: any[] = [];
  comment = "";
  percent = 0;
  lastSave = 0;
  resumeAt: number | null = null;
  loading = true;
  posting = false;
  error = "";
  mediaError = "";
  progressError = "";
  commentError = "";
  private saves = new Subject<ProgressSave>();
  private subscriptions = new Subscription();
  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {}
  ngOnInit() {
    // Serialize writes so a slower old position cannot overwrite a newer position.
    this.subscriptions.add(
      this.saves
        .pipe(
          concatMap(({ id, ...body }) =>
            this.api.post("/videos/" + id + "/progress", body).pipe(
              catchError(() => {
                this.progressError =
                  "Your latest progress could not be saved. Playback can continue.";
                return EMPTY;
              }),
            ),
          ),
        )
        .subscribe(() => (this.progressError = "")),
    );
    this.subscriptions.add(
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            const id = params.get("id");
            this.video = undefined;
            this.loading = true;
            this.error = "";
            this.mediaError = "";
            this.progressError = "";
            this.commentError = "";
            this.comment = "";
            this.comments = [];
            this.percent = 0;
            this.lastSave = 0;
            this.resumeAt = null;
            if (!id) {
              this.loading = false;
              this.error = "Lesson not found.";
              return EMPTY;
            }
            return forkJoin({
              videos: this.api.get<any[]>("/videos"),
              progress: this.api.get<any[]>("/videos/progress").pipe(
                catchError(() => {
                  this.progressError = "Saved progress could not be loaded.";
                  return of([]);
                }),
              ),
              comments: this.api
                .get<any[]>("/community/videos/" + id + "/comments")
                .pipe(
                  catchError(() => {
                    this.commentError = "Comments could not be loaded.";
                    return of([]);
                  }),
                ),
            }).pipe(
              concatMap((result) => of({ ...result, id })),
              catchError(() => {
                this.error =
                  "Unable to load this lesson. Return to lessons and try again.";
                return EMPTY;
              }),
              finalize(() => (this.loading = false)),
            );
          }),
        )
        .subscribe(({ videos, progress, comments, id }) => {
          this.video = videos.find((video) => video.id === id);
          if (!this.video) {
            this.error = "This lesson is unavailable for your membership.";
            return;
          }
          this.comments = comments;
          const saved = progress.find((row) => row.videoId === id);
          if (saved) {
            this.percent = percent(saved.percentWatched);
            this.resumeAt = Math.max(0, Number(saved.positionSeconds) || 0);
          }
        }),
    );
  }
  restorePosition() {
    const player = this.player?.nativeElement;
    if (!player || player.readyState < 1 || this.resumeAt === null) return;
    player.currentTime = Number.isFinite(player.duration)
      ? Math.min(this.resumeAt, player.duration)
      : this.resumeAt;
    this.resumeAt = null;
  }
  saveProgress(force = false) {
    const player = this.player?.nativeElement;
    if (
      !player ||
      !this.video ||
      this.resumeAt !== null ||
      !Number.isFinite(player.duration) ||
      player.duration <= 0
    )
      return;
    const now = Date.now();
    if (!force && now - this.lastSave < 3000) return;
    this.lastSave = now;
    this.percent = percent((player.currentTime / player.duration) * 100);
    this.saves.next({
      id: this.video.id,
      positionSeconds: Math.floor(player.currentTime),
      durationSeconds: Math.floor(player.duration),
    });
  }
  addComment() {
    if (this.posting || !this.video || !this.comment.trim()) return;
    const videoId = this.video.id;
    const text = this.comment;
    this.posting = true;
    this.commentError = "";
    this.subscriptions.add(
      this.api
        .post<any>("/community/comments", {
          videoId,
          text,
          parentCommentId: null,
        })
        .pipe(finalize(() => (this.posting = false)))
        .subscribe({
          next: (comment) => {
            if (this.video?.id !== videoId) return;
            this.comments = [...this.comments, comment];
            if (this.comment === text) this.comment = "";
          },
          error: () =>
            (this.commentError =
              "Your comment could not be posted. Please try again."),
        }),
    );
  }
  ngOnDestroy() {
    this.saves.complete();
    this.subscriptions.unsubscribe();
  }
}
