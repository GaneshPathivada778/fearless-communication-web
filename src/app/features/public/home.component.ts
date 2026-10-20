import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from "@angular/core";
import { CallbackRequestComponent } from "./callback-request.component";
import { CommunityFooterComponent } from "./community-footer.component";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";
import {
  AUDIENCES,
  COMMUNITY_LINKS,
  LEARNER_REVIEWS,
  LEARNING_PATHS,
} from "./home-content";
import { WEBINAR, webinarHasEnded } from "./webinar-content";

@Component({
  standalone: true,
  imports: [RouterLink, CommunityFooterComponent, CallbackRequestComponent],
  templateUrl: "./home.component.html",
  styleUrls: ["./community-theme.css", "./home.component.css"],
})
export class HomeComponent implements OnDestroy {
  readonly auth = inject(AuthService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly menuOpen = signal(false);
  @ViewChild("menuToggle") menuToggle?: ElementRef<HTMLButtonElement>;
  readonly webinar = WEBINAR;
  readonly audiences = AUDIENCES;
  readonly learningPaths = LEARNING_PATHS;
  readonly links = COMMUNITY_LINKS;
  readonly reviews = LEARNER_REVIEWS;
  readonly ended = signal(webinarHasEnded(Date.now()));
  private readonly clock: ReturnType<typeof setInterval>;

  constructor() {
    const zone = inject(NgZone);
    // Refresh a long-open page without triggering change detection every minute.
    this.clock = zone.runOutsideAngular(() =>
      setInterval(() => {
        const ended = webinarHasEnded(Date.now());
        if (ended !== this.ended()) zone.run(() => this.ended.set(ended));
      }, 60_000),
    );
  }

  closeMenu(restoreFocus = false) {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) this.menuToggle?.nativeElement.focus();
  }

  goToSection(event: MouseEvent, id: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    this.closeMenu();
    this.host.nativeElement
      .querySelector<HTMLElement>(`#${id}`)
      ?.focus({ preventScroll: true });
  }

  get registrationUrl() {
    return this.ended() ? this.webinar.sourceUrl : this.webinar.registrationUrl;
  }

  get registrationLabel() {
    return this.ended() ? "Find upcoming webinars" : "Register for FREE";
  }

  ngOnDestroy() {
    clearInterval(this.clock);
  }
}
