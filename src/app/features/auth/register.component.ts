import {
  authDestination,
  membershipReturnUrl,
} from "../../core/auth-navigation";
import { Component } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { Router, RouterLink, ActivatedRoute } from "@angular/router";
import { finalize } from "rxjs";
import { AuthService } from "../../core/auth.service";
import { errorMessage } from "../../core/ui-utils";
@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: ` <div class="auth-wrap">
    <form
      class="auth-card"
      #form="ngForm"
      (ngSubmit)="submit(form)"
      [attr.aria-busy]="pending"
    >
      <span class="eyebrow">JOIN FCC</span>
      <h1>Join the FCC community</h1>
      <p>
        One community for learning and practicing spoken English. Create your
        learner account to get started.
      </p>
      @if (returnUrl) {
        <p class="auth-context">
          Your membership selection is saved. After creating your account,
          you’ll return to review the offer.
        </p>
        <a class="fcc-back" [routerLink]="returnTree">Compare memberships</a>
      }
      <fieldset [disabled]="pending">
        <label
          >Full name<input
            name="name"
            [(ngModel)]="name"
            required
            autocomplete="name"
        /></label>
        <label
          >Email<input
            name="email"
            [(ngModel)]="email"
            type="email"
            required
            email
            autocomplete="email"
            #emailField="ngModel"
            [attr.aria-invalid]="emailField.touched && emailField.invalid"
            aria-describedby="email-error"
        /></label>
        @if (emailField.touched && emailField.invalid) {
          <p id="email-error" class="error">Enter a valid email address.</p>
        }
        <label
          >Password<input
            name="password"
            [(ngModel)]="password"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            #passwordField="ngModel"
            [attr.aria-invalid]="passwordField.touched && passwordField.invalid"
            aria-describedby="password-error"
        /></label>
        @if (passwordField.touched && passwordField.invalid) {
          <p id="password-error" class="error">Use at least 8 characters.</p>
        }
        <button
          class="btn primary full"
          type="submit"
          [disabled]="form.invalid || pending"
        >
          {{ pending ? "Please wait…" : "Create account" }}
        </button>
      </fieldset>
      @if (error) {
        <div class="error" role="alert">{{ error }}</div>
      }
      <p class="center">
        Already registered?
        <a routerLink="/login" [queryParams]="{ returnUrl: returnUrl }"
          >Sign in</a
        >
      </p>
    </form>
  </div>`,
})
export class RegisterComponent {
  name = "";
  email = "";
  password = "";
  error = "";
  pending = false;
  readonly returnUrl: string | null;
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.returnUrl = membershipReturnUrl(
      route.snapshot.queryParamMap.get("returnUrl"),
    );
  }
  get returnTree() {
    return this.returnUrl ? this.router.parseUrl(this.returnUrl) : null;
  }
  submit(form: NgForm) {
    if (this.pending) return;
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    if (!this.name.trim()) {
      this.error = "Enter your name.";
      return;
    }
    this.error = "";
    this.pending = true;
    this.auth
      .register(this.name.trim(), this.email.trim(), this.password)
      .pipe(finalize(() => (this.pending = false)))
      .subscribe({
        next: (session) => {
          void this.router.navigateByUrl(
            authDestination(session.user, this.returnUrl),
          );
        },
        error: (error) =>
          (this.error = errorMessage(
            error,
            "Unable to continue. Please try again.",
          )),
      });
  }
}
