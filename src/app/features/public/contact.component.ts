import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";
import { CallbackRequestComponent } from "./callback-request.component";
import { CommunityFooterComponent } from "./community-footer.component";

@Component({
  standalone: true,
  imports: [RouterLink, CallbackRequestComponent, CommunityFooterComponent],
  template: `
    <header class="contact-header">
      <a
        class="contact-brand"
        routerLink="/"
        aria-label="Fearless Communication Club home"
      >
        <span class="monogram" aria-hidden="true">fcc<span>.</span></span>
        <span>Fearless<br />Communication Club</span>
      </a>
      <nav aria-label="Main navigation">
        <a routerLink="/">Home</a>
        <a routerLink="/contact" aria-current="page">Contact us</a>
        <a [routerLink]="auth.user() ? '/dashboard' : '/login'">{{
          auth.user() ? "My dashboard" : "Member sign in"
        }}</a>
      </nav>
    </header>
    <section class="contact-intro" aria-labelledby="contact-title">
      <p class="contact-kicker">CONTACT FEARLESS COMMUNICATION CLUB</p>
      <h1 id="contact-title" tabindex="-1">
        Your next conversation<br /><em>starts here.</em>
      </h1>
      <p class="contact-description">
        Questions about spoken English, courses, or live classes? Talk to the
        FCC team, or leave your details and request a call.
      </p>
    </section>
    <fcc-callback-request />
    <fcc-community-footer />
  `,
  styleUrls: ["./community-theme.css", "./contact.component.css"],
})
export class ContactComponent {
  readonly auth = inject(AuthService);
}
