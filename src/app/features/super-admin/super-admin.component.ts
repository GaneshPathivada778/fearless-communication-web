import { CallbackRequestsComponent } from "../admin/callback-requests.component";
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
        <span class="eyebrow">FCC PLATFORM OWNER</span>
        <h1>Super Admin dashboard</h1>
        <p>Monitor every academy, payment and FCC commission.</p>
      </div>
    </div>
    <div class="stats">
      <div class="stat">
        <span>Admins</span><strong>{{ admins.length }}</strong>
      </div>
      <div class="stat">
        <span>Platform gross</span><strong>₹{{ revenue.gross || 0 }}</strong>
      </div>
      <div class="stat">
        <span>FCC commission</span
        ><strong>₹{{ revenue.commission || 0 }}</strong>
      </div>
      <div class="stat">
        <span>Admin net</span><strong>₹{{ revenue.net || 0 }}</strong>
      </div>
    </div>
    <div class="tabs" role="group" aria-label="Dashboard sections">
      <button
        type="button"
        aria-controls="dashboard-panel"
        [attr.aria-pressed]="tab === 'admins'"
        [class.active]="tab === 'admins'"
        (click)="tab = 'admins'"
      >
        Admins</button
      ><button
        type="button"
        aria-controls="dashboard-panel"
        [attr.aria-pressed]="tab === 'plans'"
        [class.active]="tab === 'plans'"
        (click)="tab = 'plans'"
      >
        Platform plans
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
        *ngSwitchCase="'admins'"
        class="card table"
        tabindex="0"
        role="region"
        aria-label="Scrollable account table"
      >
        <h2>All Admins</h2>
        <table class="data-table">
          <caption class="sr-only">
            Academy administrators
          </caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Academy</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of admins; trackBy: trackById">
              <th scope="row">{{ a.name }}</th>
              <td>{{ a.email }}</td>
              <td>{{ a.tenantId }}</td>
              <td>{{ a.isActive ? "Active" : "Suspended" }}</td>
            </tr>
          </tbody>
        </table>
        @if (!loading && !admins.length && !error) {
          <p>No administrators yet.</p>
        }
      </div>
      <div *ngSwitchCase="'plans'" class="card">
        <h2>FCC platform plans</h2>
        <form
          class="inline-form"
          #planForm="ngForm"
          (ngSubmit)="createPlan(planForm)"
        >
          <label
            >Plan name<input
              name="name"
              [(ngModel)]="plan.name"
              placeholder="Plan name"
              [disabled]="saving"
              required /></label
          ><label
            >Price<input
              name="price"
              [(ngModel)]="plan.price"
              type="number"
              placeholder="Price"
              [disabled]="saving"
              required
              min="0" /></label
          ><label
            >Duration<input
              name="days"
              [(ngModel)]="plan.durationDays"
              type="number"
              placeholder="Duration"
              [disabled]="saving"
              required
              min="1"
              step="1" /></label
          ><label
            >Commission %<input
              name="commission"
              [(ngModel)]="plan.commissionPercent"
              type="number"
              step="0.1"
              placeholder="Commission %"
              [disabled]="saving"
              required
              min="0"
              max="100" /></label
          ><button class="btn primary" [disabled]="saving || planForm.invalid">
            {{ saving ? "Saving…" : "Create plan" }}
          </button>
        </form>
        <div class="grid three mini">
          <div class="card inner" *ngFor="let p of plans">
            <b>{{ p.name }}</b
            ><strong>₹{{ p.price }}</strong
            ><small
              >{{ p.durationDays }} days · FCC {{ p.commissionPercent }}%</small
            >
          </div>
        </div>
      </div>
    </div>
  </section>`,
})
export class SuperAdminComponent implements OnInit {
  tab = "admins";
  admins: any[] = [];
  plans: any[] = [];
  revenue: any = {};
  loading = false;
  saving = false;
  error = "";
  notice = "";
  trackById = trackById;
  plan = { name: "", price: 9999, durationDays: 365, commissionPercent: 10 };
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.load();
  }
  load() {
    if (this.loading) return;
    this.loading = true;
    this.error = "";
    forkJoin({
      admins: this.api.get<any[]>("/admins"),
      plans: this.api.get<any[]>("/platform-plans"),
      revenue: this.api.get<any>("/revenue"),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.admins = data.admins;
          this.plans = data.plans;
          this.revenue = data.revenue;
        },
        error: () =>
          (this.error = "Unable to load platform data. Please retry."),
      });
  }
  createPlan(form: NgForm) {
    if (this.saving || form.invalid || !this.plan.name.trim()) return;
    this.saving = true;
    this.error = "";
    this.notice = "";
    this.api
      .post<any>("/platform-plans", { ...this.plan })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (plan) => {
          this.plans = [...this.plans, plan];
          this.plan = { ...this.plan, name: "" };
          this.notice = "Platform plan created.";
        },
        error: () =>
          (this.error =
            "Unable to create this plan. Your entries have been kept."),
      });
  }
}
