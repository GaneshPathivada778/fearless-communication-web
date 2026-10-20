import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { forkJoin, finalize } from "rxjs";
import { ApiService } from "../../core/api.service";
import { percent } from "../../core/ui-utils";
@Component({
  standalone: true,
  imports: [RouterLink],
  template: ` <section class="page">
    <div class="page-head">
      <div>
        <span class="eyebrow">MY LEARNING</span>
        <h1>Your lessons</h1>
        <p>Lessons available to your active membership.</p>
      </div>
      <div
        class="progress-ring"
        [attr.aria-label]="overall + '% overall progress'"
      >
        {{ overall }}%
      </div>
    </div>
    @if (loading) {
      <p role="status">Loading lessons…</p>
    }
    @if (error) {
      <p class="error" role="alert">{{ error }}</p>
      <button class="btn" (click)="load()">Retry</button>
    }
    <div class="grid three" [attr.aria-busy]="loading">
      @for (video of videos; track video.id) {
        <article class="card lesson">
          <div class="video-placeholder" aria-hidden="true">▶</div>
          <span class="pill">{{ video.accessTier }}</span>
          <h2>{{ video.title }}</h2>
          <p>{{ video.description }}</p>
          <progress
            max="100"
            [value]="pct(video.id)"
            [attr.aria-label]="video.title + ' progress'"
          ></progress
          ><small>{{ pct(video.id) }}% complete</small
          ><a class="btn primary" [routerLink]="['/learning', video.id]">{{
            pct(video.id) > 0 && pct(video.id) < 100
              ? "Continue"
              : "Watch lesson"
          }}</a>
        </article>
      }
    </div>
    @if (!loading && !error && !videos.length) {
      <p>No lessons are available for your membership yet.</p>
    }
  </section>`,
})
export class LearningComponent implements OnInit {
  videos: any[] = [];
  overall = 0;
  loading = false;
  error = "";
  private progressById = new Map<string, number>();
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.load();
  }
  load() {
    if (this.loading) return;
    this.loading = true;
    this.error = "";
    forkJoin({
      videos: this.api.get<any[]>("/videos"),
      progress: this.api.get<any[]>("/videos/progress"),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ videos, progress }) => {
          this.videos = videos;
          this.progressById = new Map(
            progress.map((row) => [row.videoId, percent(row.percentWatched)]),
          );
          this.overall = videos.length
            ? Math.round(
                videos.reduce((sum, video) => sum + this.pct(video.id), 0) /
                  videos.length,
              )
            : 0;
        },
        error: () =>
          (this.error = "Unable to load your lessons. Please try again."),
      });
  }
  pct(id: string) {
    return this.progressById.get(id) ?? 0;
  }
}
