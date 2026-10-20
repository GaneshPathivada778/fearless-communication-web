import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  OnDestroy,
  DestroyRef,
  inject,
  afterNextRender,
  Injector,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { finalize, timeout } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "fcc-callback-request",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./callback-request.component.html",
  styleUrl: "./callback-request.component.css",
})
export class CallbackRequestComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private previousOverflow: string | null = null;
  @ViewChild("callbackDialog") callbackDialog?: ElementRef<HTMLDialogElement>;
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly open = signal(false);
  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly error = signal("");
  @ViewChild("requestButton") requestButton?: ElementRef<HTMLButtonElement>;
  @ViewChild("nameInput") nameInput?: ElementRef<HTMLInputElement>;
  name = "";
  phone = "";
  preferredTime = "";
  private requestId = crypto.randomUUID();

  showForm() {
    const dialog = this.callbackDialog?.nativeElement;
    if (!dialog || dialog.open) return;
    this.previousOverflow = this.document.documentElement.style.overflow;
    this.document.documentElement.style.overflow = "hidden";
    dialog.showModal();
    this.open.set(true);
    afterNextRender(
      () => {
        if (this.sent())
          this.host.nativeElement
            .querySelector<HTMLElement>(".success-message")
            ?.focus();
        else this.nameInput?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  closeForm() {
    this.callbackDialog?.nativeElement.close();
    this.onClosed();
  }

  keepFocus(event: KeyboardEvent) {
    if (event.key !== "Tab") return;
    const dialog = this.callbackDialog?.nativeElement;
    if (!dialog) return;
    const controls = Array.from(
      dialog.querySelectorAll<HTMLElement>('button, input, [tabindex="0"]'),
    ).filter(
      (element) =>
        !element.matches(":disabled") && element.getClientRects().length > 0,
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && this.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  onCancel(event: Event) {
    event.preventDefault();
    this.closeForm();
  }

  onClosed() {
    this.open.set(false);
    this.restoreScroll();
    this.requestButton?.nativeElement.focus();
  }

  private restoreScroll() {
    if (this.previousOverflow !== null) {
      this.document.documentElement.style.overflow = this.previousOverflow;
      this.previousOverflow = null;
    }
  }

  ngOnDestroy() {
    this.restoreScroll();
  }

  submit(form: NgForm) {
    if (this.sending() || this.sent()) return;
    if (form.invalid || this.name.trim().length < 2) {
      form.control.markAllAsTouched();
      this.error.set("Please check your name and phone number.");
      afterNextRender(
        () =>
          this.host.nativeElement
            .querySelector<HTMLInputElement>("input.ng-invalid")
            ?.focus(),
        { injector: this.injector },
      );
      return;
    }
    this.sending.set(true);
    this.error.set("");
    this.http
      .post<{ received: boolean }>("/api/public/callback-requests", {
        requestId: this.requestId,
        name: this.name.trim(),
        phone: this.phone.replace(/[\s()-]/g, ""),
        preferredTime: this.preferredTime.trim(),
      })
      .pipe(
        timeout(15000),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.sending.set(false)),
      )
      .subscribe({
        next: (result) => {
          if (!result.received) {
            this.error.set(
              "We couldn’t confirm your request. Please try again or call 08047939623.",
            );
            return;
          }
          this.sent.set(true);
          form.resetForm();
          afterNextRender(
            () => {
              if (this.open())
                this.host.nativeElement
                  .querySelector<HTMLElement>(".success-message")
                  ?.focus();
            },
            { injector: this.injector },
          );
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(
            error.status === 429
              ? "Too many requests. Please try later or call 08047939623."
              : "Your request wasn’t confirmed. Your details are still here—please try again or call 08047939623.",
          );
        },
      });
  }
}
