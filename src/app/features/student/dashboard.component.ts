import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { forkJoin, finalize } from "rxjs";
import { ApiService } from "../../core/api.service";
import { AuthService } from "../../core/auth.service";
import { percent } from "../../core/ui-utils";
@Component({
  standalone: true,
  imports: [],
  template: `<div class="post-login-canvas"></div>`,
})
export class DashboardComponent implements OnInit {
  videos: any[] = [];
  progress = 0;
  completed = 0;
  watchTime = "0 min";
  loading = false;
  error = "";
  constructor(
    public auth: AuthService,
    private api: ApiService,
  ) {}
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
          const ids = new Set(videos.map((video) => video.id));
          const visibleProgress = progress.filter((row) =>
            ids.has(row.videoId),
          );
          this.videos = videos.slice(0, 3);
          this.completed = visibleProgress.filter(
            (row) => row.completed,
          ).length;
          this.progress = videos.length
            ? Math.round(
                visibleProgress.reduce(
                  (sum, row) => sum + percent(row.percentWatched),
                  0,
                ) / videos.length,
              )
            : 0;
          this.watchTime =
            Math.round(
              visibleProgress.reduce(
                (sum, row) => sum + Number(row.positionSeconds ?? 0),
                0,
              ) / 60,
            ) + " min";
        },
        error: () =>
          (this.error = "Unable to load your dashboard. Please try again."),
      });
  }
}
