import { Component, input } from "@angular/core";

export type SocialIcon = "youtube" | "instagram" | "facebook" | "linkedin";

@Component({
  selector: "fcc-social-icon",
  standalone: true,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name()) {
        @case ("youtube") {
          <path
            d="M21.6 7.2a2.8 2.8 0 0 0-2-2C18 4.8 12 4.8 12 4.8s-6 0-7.6.4a2.8 2.8 0 0 0-2 2A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.6.4 7.6.4 7.6.4s6 0 7.6-.4a2.8 2.8 0 0 0 2-2A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8Z"
          />
          <path d="m10 8.5 6 3.5-6 3.5Z" />
        }
        @case ("instagram") {
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="18" cy="6" r=".7" fill="currentColor" stroke="none" />
        }
        @case ("facebook") {
          <path
            d="M15.5 3H18V0h-3.5C10.5 0 9 2.5 9 6v3H6v4h3v11h4V13h3.5l.5-4h-4V6c0-2 1-3 2.5-3Z"
            transform="translate(2 1) scale(.9)"
          />
        }
        @case ("linkedin") {
          <circle cx="4" cy="3.5" r="2" />
          <path
            d="M2 9h4v13H2zM10 9h4v2c1-1.5 2.4-2.3 4-2.3 2.8 0 4 1.9 4 5V22h-4v-7c0-1.8-.6-2.6-1.9-2.6S14 13.4 14 15v7h-4Z"
          />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: 0 0 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class SocialIconComponent {
  readonly name = input.required<SocialIcon>();
}
