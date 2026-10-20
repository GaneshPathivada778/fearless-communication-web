import { CallbackRequestsComponent } from "./callback-requests.component";
import { forkJoin, finalize } from "rxjs";
import { trackById } from "../../core/ui-utils";
import { Component, OnInit } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { NgFor, NgSwitch, NgSwitchCase } from "@angular/common";
import { ApiService } from "../../core/api.service";
@Component({
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    CallbackRequestsComponent,
  ],
  template: `<section class="page">
    @if (loading) {
      <p role="status">Loading academy data…</p>
    }
    @if (error) {
      <p class="error" role="alert">{{ error }}</p>
      <button class="btn" (click)="load()" [disabled]="loading">Reload</button>
    }
    @if (notice) {
      <p role="status">{{ notice }}</p>
    }
    <div class="welcome">
      <div>
        <span class="eyebrow">ADMIN CONTROL CENTER</span>
        <h1>Your academy</h1>
        <p>Manage students, memberships, videos, community and revenue.</p>
      </div>
    </div>
    <div class="stats">
      <div class="stat">
        <span>Students</span><strong>{{ students.length }}</strong>
      </div>
      <div class="stat">
        <span>Memberships</span><strong>{{ memberships.length }}</strong>
      </div>
      <div class="stat">
        <span>Videos</span><strong>{{ videos.length }}</strong>
      </div>
      <div class="stat">
        <span>Gross revenue</span><strong>₹{{ revenue.gross || 0 }}</strong>
      </div>
    </div>
    <div class="tabs" role="group" aria-label="Dashboard sections">
      <button
        type="button"
        aria-controls="dashboard-panel"
        [attr.aria-pressed]="tab === 'students'"
        [class.active]="tab === 'students'"
        (click)="tab = 'students'"
      >
        Students</button
      ><button
        type="button"
        aria-controls="dashboard-panel"
        [attr.aria-pressed]="tab === 'memberships'"
        [class.active]="tab === 'memberships'"
        (click)="tab = 'memberships'"
      >
        Memberships</button
      ><button
        type="button"
        aria-controls="dashboard-panel"
        [attr.aria-pressed]="tab === 'videos'"
        [class.active]="tab === 'videos'"
        (click)="tab = 'videos'"
      >
        Videos</button
      ><button
        type="button"
        aria-controls="dashboard-panel"
        [attr.aria-pressed]="tab === 'permissions'"
        [class.active]="tab === 'permissions'"
        (click)="tab = 'permissions'"
      >
        Permissions
      </button>
      <button
        type="button"
        aria-controls="dashboard-panel"
        [attr.aria-pressed]="tab === 'callbacks'"
        [class.active]="tab === 'callbacks'"
        (click)="tab = 'callbacks'"
      >
        Callback requests
      </button>
    </div>
    <div id="dashboard-panel" [ngSwitch]="tab">
      <fcc-callback-requests *ngSwitchCase="'callbacks'" />
      <div
        *ngSwitchCase="'students'"
        class="card table"
        tabindex="0"
        role="region"
        aria-label="Scrollable account table"
      >
        <h2>Students</h2>
        <table class="data-table">
          <caption class="sr-only">
            Students
          </caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of students; trackBy: trackById">
              <th scope="row">{{ s.name }}</th>
              <td>{{ s.email }}</td>
              <td>{{ s.isActive ? "Active" : "Suspended" }}</td>
              <td>
                <button
                  class="btn small"
                  [disabled]="pendingStudents.has(s.id)"
                  (click)="toggle(s)"
                  [attr.aria-label]="
                    (s.isActive ? 'Suspend ' : 'Activate ') + s.name
                  "
                >
                  {{ s.isActive ? "Suspend" : "Activate" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        @if (!loading && !students.length && !error) {
          <p>No students yet.</p>
        }
      </div>
      <div *ngSwitchCase="'memberships'" class="card">
        <h2>Membership plans</h2>
        <form
          class="inline-form"
          #membershipForm="ngForm"
          (ngSubmit)="createMembership(membershipForm)"
        >
          <label
            >Plan name<input
              name="name"
              [(ngModel)]="newPlan.name"
              placeholder="Plan name"
              [disabled]="saving"
              required /></label
          ><label
            >Membership level<select
              name="tier"
              [(ngModel)]="newPlan.tier"
              [disabled]="saving"
            >
              <option [ngValue]="1">Silver</option>
              <option [ngValue]="2">Gold</option>
              <option [ngValue]="3">Diamond</option>
            </select></label
          ><label
            >Price<input
              name="price"
              [(ngModel)]="newPlan.price"
              type="number"
              placeholder="Price"
              [disabled]="saving"
              required
              min="0" /></label
          ><label
            >Days<input
              name="durationDays"
              [(ngModel)]="newPlan.durationDays"
              type="number"
              placeholder="Days"
              [disabled]="saving"
              required
              min="1"
              step="1" /></label
          ><button
            class="btn primary"
            [disabled]="saving || membershipForm.invalid"
          >
            {{ saving ? "Saving…" : "Create" }}
          </button>
        </form>
        <div class="grid three mini">
          <div class="card inner" *ngFor="let p of memberships">
            <b>{{ p.name }}</b
            ><strong>₹{{ p.price }}</strong
            ><small>{{ p.durationDays }} days · {{ p.tier }}</small>
            <p>{{ p.description }}</p>
          </div>
        </div>
      </div>
      <div *ngSwitchCase="'videos'" class="card">
        <h2>Videos</h2>
        <form
          class="inline-form"
          #videoForm="ngForm"
          (ngSubmit)="createVideo(videoForm)"
        >
          <label
            >Video title<input
              name="title"
              [(ngModel)]="newVideo.title"
              placeholder="Video title"
              [disabled]="saving"
              required /></label
          ><label
            >Description<input
              name="description"
              [(ngModel)]="newVideo.description"
              placeholder="Description"
              [disabled]="saving" /></label
          ><label
            >Access level<select
              name="accessTier"
              [(ngModel)]="newVideo.accessTier"
              [disabled]="saving"
            >
              <option [ngValue]="0">Free</option>
              <option [ngValue]="1">Silver</option>
              <option [ngValue]="2">Gold</option>
              <option [ngValue]="3">Diamond</option>
            </select></label
          ><label
            >Media URL/key<input
              name="mediaKey"
              [(ngModel)]="newVideo.mediaKey"
              placeholder="Media URL/key"
              [disabled]="saving"
              required /></label
          ><button class="btn primary" [disabled]="saving || videoForm.invalid">
            {{ saving ? "Saving…" : "Add video" }}
          </button>
        </form>
        <div class="list">
          <div *ngFor="let v of videos" class="lesson-row">
            <div class="thumb">▶</div>
            <div>
              <b>{{ v.title }}</b
              ><small>{{ v.description }}</small>
            </div>
            <span class="pill">{{ v.accessTier }}</span>
          </div>
        </div>
      </div>
      <div *ngSwitchCase="'permissions'" class="card">
        <h2>Community permissions</h2>
        <p>
          Configure which membership levels can post, upload images, comment and
          message.
        </p>
        <div class="permission-grid">
          <label *ngFor="let p of permissions"
            ><input
              type="checkbox"
              [checked]="p.allowed"
              [disabled]="pendingPermissions.has(p.id)"
              (change)="setPermission(p, $event)"
            />
            {{ p.subjectKey }} · {{ p.permission }}</label
          >
        </div>
      </div>
    </div>
  </section>`,
})
export class AdminShellComponent implements OnInit {
  tab = "students";
  students: any[] = [];
  memberships: any[] = [];
  videos: any[] = [];
  permissions: any[] = [];
  revenue: any = {};
  loading = false;
  saving = false;
  error = "";
  notice = "";
  trackById = trackById;
  pendingStudents = new Set<string>();
  pendingPermissions = new Set<string>();
  newPlan = {
    name: "",
    tier: 1,
    price: 999,
    durationDays: 30,
    description: "Communication lessons and community access",
  };
  newVideo = { title: "", description: "", accessTier: 1, mediaKey: "" };
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.load();
  }
  load() {
    if (this.loading) return;
    this.loading = true;
    this.error = "";
    forkJoin({
      students: this.api.get<any[]>("/students"),
      memberships: this.api.get<any[]>("/memberships"),
      videos: this.api.get<any[]>("/videos/all"),
      revenue: this.api.get<any>("/revenue"),
      permissions: this.api.get<any[]>("/permissions"),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.students = data.students;
          this.memberships = data.memberships;
          this.videos = data.videos;
          this.revenue = data.revenue;
          this.permissions = data.permissions;
        },
        error: () =>
          (this.error = "Unable to load academy data. Please retry."),
      });
  }
  toggle(student: any) {
    if (this.pendingStudents.has(student.id)) return;
    this.pendingStudents.add(student.id);
    this.error = "";
    this.notice = "";
    this.api
      .patch<any>(
        "/students/" + student.id + "/status?active=" + !student.isActive,
        {},
      )
      .pipe(finalize(() => this.pendingStudents.delete(student.id)))
      .subscribe({
        next: (updated) => {
          this.students = this.students.map((item) =>
            item.id === updated.id ? updated : item,
          );
          this.notice = "Student status updated.";
        },
        error: () => (this.error = "Unable to update student status."),
      });
  }
  createMembership(form: NgForm) {
    if (this.saving || form.invalid || !this.newPlan.name.trim()) return;
    this.saving = true;
    this.error = "";
    this.notice = "";
    this.api
      .post<any>("/memberships", { ...this.newPlan })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (plan) => {
          this.memberships = [...this.memberships, plan];
          this.newPlan = { ...this.newPlan, name: "" };
          this.notice = "Membership plan created.";
        },
        error: () =>
          (this.error =
            "Unable to create this plan. Your entries have been kept."),
      });
  }
  createVideo(form: NgForm) {
    if (
      this.saving ||
      form.invalid ||
      !this.newVideo.title.trim() ||
      !this.newVideo.mediaKey.trim()
    )
      return;
    this.saving = true;
    this.error = "";
    this.notice = "";
    this.api
      .post<any>("/videos", { ...this.newVideo })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (video) => {
          this.videos = [...this.videos, video];
          this.newVideo = {
            ...this.newVideo,
            title: "",
            description: "",
            mediaKey: "",
          };
          this.notice = "Video added.";
        },
        error: () =>
          (this.error =
            "Unable to add this video. Your entries have been kept."),
      });
  }
  setPermission(permission: any, event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.pendingPermissions.has(permission.id)) {
      input.checked = permission.allowed;
      return;
    }
    const previous = permission.allowed;
    permission.allowed = input.checked;
    this.pendingPermissions.add(permission.id);
    this.error = "";
    this.notice = "";
    this.api
      .put("/permissions", { ...permission })
      .pipe(finalize(() => this.pendingPermissions.delete(permission.id)))
      .subscribe({
        next: () => (this.notice = "Permission updated."),
        error: () => {
          permission.allowed = previous;
          input.checked = previous;
          this.error =
            "Permission was not saved. The previous setting has been restored.";
        },
      });
  }
}
