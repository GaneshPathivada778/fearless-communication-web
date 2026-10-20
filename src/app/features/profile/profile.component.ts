import { Component, OnInit } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { finalize } from "rxjs";
import { ApiService } from "../../core/api.service";
import { AuthService } from "../../core/auth.service";
import { errorMessage } from "../../core/ui-utils";
@Component({
  standalone: true,
  imports: [FormsModule],
  template: ` <section class="page narrow">
    <div class="page-head"><h1>Your profile</h1></div>
    @if (loading) {
      <p role="status">Loading profile…</p>
    }
    @if (loadError) {
      <p class="error" role="alert">{{ loadError }}</p>
      <button class="btn" (click)="load()">Retry</button>
    }
    @if (!loading && !loadError) {
      <form
        class="card form"
        #form="ngForm"
        (ngSubmit)="save(form)"
        [attr.aria-busy]="saving"
      >
        <fieldset [disabled]="saving">
          <label
            >Name<input
              name="name"
              [(ngModel)]="model.name"
              (ngModelChange)="saved = false"
              autocomplete="name"
              required /></label
          ><label
            >Email<input [value]="model.email" type="email" readonly /></label
          ><label
            >Bio<textarea
              name="bio"
              [(ngModel)]="model.bio"
              (ngModelChange)="saved = false"
            ></textarea></label
          ><label
            >Avatar URL<input
              name="avatarUrl"
              [(ngModel)]="model.avatarUrl"
              (ngModelChange)="saved = false"
              type="url" /></label
          ><button class="btn primary" [disabled]="form.invalid || saving">
            {{ saving ? "Saving…" : "Save changes" }}
          </button>
        </fieldset>
        @if (saved) {
          <p class="success" role="status">Profile saved.</p>
        }
        @if (error) {
          <p class="error" role="alert">{{ error }}</p>
        }
      </form>

      <div class="card profile-account-card">
        <div class="profile-account-info">
          <h3>Account &amp; Session</h3>
          <p>
            Signed in as
            <strong>{{ auth.user()?.email || model.email }}</strong>.
            Sign out of your session on this device.
          </p>
        </div>
        <button
          type="button"
          class="profile-account-logout-btn"
          (click)="logout()"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Log out</span>
        </button>
      </div>
    }
  </section>`,
})
export class ProfileComponent implements OnInit {
  model = { name: "", email: "", bio: "", avatarUrl: "" };
  saved = false;
  loading = false;
  saving = false;
  error = "";
  loadError = "";
  constructor(
    private api: ApiService,
    public auth: AuthService,
  ) {}
  logout() {
    this.auth.logout();
  }
  ngOnInit() {
    this.load();
  }
  load() {
    if (this.loading) return;
    this.loading = true;
    this.loadError = "";
    this.api
      .get<typeof this.model>("/me")
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (profile) => (this.model = profile),
        error: () => (this.loadError = "Unable to load your profile."),
      });
  }
  save(form: NgForm) {
    if (this.saving || form.invalid) return;
    this.saving = true;
    this.saved = false;
    this.error = "";
    const model = { ...this.model, name: this.model.name.trim() };
    this.api
      .put("/me", model)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.saved = true;
          const user = this.auth.user();
          if (user)
            this.auth.save({
              user: { ...user, name: model.name },
              accessToken: this.auth.token(),
            });
        },
        error: (error) =>
          (this.error = errorMessage(error, "Unable to save your profile.")),
      });
  }
}
