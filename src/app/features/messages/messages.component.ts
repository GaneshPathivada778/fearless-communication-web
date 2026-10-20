import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { Subscription, finalize } from "rxjs";
import { ApiService } from "../../core/api.service";
import { AuthService } from "../../core/auth.service";
import { errorMessage } from "../../core/ui-utils";
interface Person {
  id: string;
  name: string;
}
interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAtUtc: string;
}
@Component({
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: ` <section class="page">
    <div class="page-head">
      <div>
        <span class="eyebrow">MESSAGES</span>
        <h1>Connect with your community</h1>
      </div>
    </div>
    @if (directoryError) {
      <p class="error" role="alert">{{ directoryError }}</p>
      <button class="btn" (click)="loadUsers()">Retry people</button>
    }
    <div class="chat card">
      <aside class="people" aria-label="People">
        <h2>People</h2>
        @if (loadingUsers) {
          <p role="status">Loading people…</p>
        }
        @for (user of users; track user.id) {
          <button
            type="button"
            [class.active]="selected?.id === user.id"
            [attr.aria-pressed]="selected?.id === user.id"
            (click)="select(user)"
          >
            <span class="avatar" aria-hidden="true">{{ user.name[0] }}</span
            >{{ user.name }}
          </button>
        }
        @if (!loadingUsers && !directoryError && !users.length) {
          <p>No people are available yet.</p>
        }
      </aside>
      <section class="conversation" aria-label="Conversation">
        <div class="conversation-head">
          <h2>{{ selected?.name ?? "Select a person" }}</h2>
        </div>
        @if (conversationError) {
          <p class="error" role="alert">{{ conversationError }}</p>
          <button class="btn" (click)="retryConversation()">
            Retry conversation
          </button>
        }
        <div
          class="messages"
          role="log"
          aria-label="Messages"
          aria-live="polite"
          [attr.aria-busy]="loadingConversation"
        >
          @if (loadingConversation) {
            <p role="status">Loading conversation…</p>
          }
          @for (message of messages; track message.id) {
            <div class="bubble" [class.mine]="message.senderId === me">
              <span>{{ message.text }}</span
              ><small>{{ message.createdAtUtc | date: "shortTime" }}</small>
            </div>
          }
          @if (
            selected &&
            !loadingConversation &&
            !conversationError &&
            !messages.length
          ) {
            <p>No messages yet. Start the conversation.</p>
          }
        </div>
        @if (sendError) {
          <p class="error" role="alert">{{ sendError }}</p>
        }
        @if (selected) {
          <form (ngSubmit)="send()" class="message-box">
            <label class="sr-only" for="message-text"
              >Message to {{ selected.name }}</label
            ><input
              id="message-text"
              name="text"
              [ngModel]="text"
              (ngModelChange)="updateDraft($event)"
              placeholder="Write a message…"
              autocomplete="off"
            /><button
              class="btn primary"
              [disabled]="
                sending ||
                loadingConversation ||
                !!conversationError ||
                !text.trim()
              "
            >
              {{ sending ? "Sending…" : "Send" }}
            </button>
          </form>
        }
      </section>
    </div>
  </section>`,
})
export class MessagesComponent implements OnInit, OnDestroy {
  users: Person[] = [];
  selected?: Person;
  messages: Message[] = [];
  text = "";
  me = "";
  loadingUsers = false;
  loadingConversation = false;
  sending = false;
  directoryError = "";
  conversationError = "";
  sendError = "";
  private drafts = new Map<string, { text: string; revision: number }>();
  private conversationRequest?: Subscription;
  private subscriptions = new Subscription();
  constructor(
    private api: ApiService,
    auth: AuthService,
  ) {
    this.me = auth.user()?.id ?? "";
  }
  ngOnInit() {
    this.loadUsers();
  }
  loadUsers() {
    if (this.loadingUsers) return;
    this.loadingUsers = true;
    this.directoryError = "";
    this.subscriptions.add(
      this.api
        .get<Person[]>("/users/directory")
        .pipe(finalize(() => (this.loadingUsers = false)))
        .subscribe({
          next: (users) => (this.users = users),
          error: (error) =>
            (this.directoryError = errorMessage(
              error,
              "Unable to load people.",
            )),
        }),
    );
  }
  updateDraft(text: string) {
    this.text = text;
    if (!this.selected) return;
    const previous = this.drafts.get(this.selected.id);
    this.drafts.set(this.selected.id, {
      text,
      revision: (previous?.revision ?? 0) + 1,
    });
  }
  select(user: Person) {
    this.conversationRequest?.unsubscribe();
    this.selected = user;
    this.text = this.drafts.get(user.id)?.text ?? "";
    this.messages = [];
    this.conversationError = "";
    this.sendError = "";
    this.loadingConversation = true;
    this.conversationRequest = this.api
      .get<Message[]>("/messages/with/" + encodeURIComponent(user.id))
      .pipe(finalize(() => (this.loadingConversation = false)))
      .subscribe({
        next: (messages) => {
          this.messages = [
            ...messages,
            ...this.messages.filter(
              (sent) => !messages.some((message) => message.id === sent.id),
            ),
          ];
        },
        error: (error) =>
          (this.conversationError = errorMessage(
            error,
            "Unable to load this conversation.",
          )),
      });
  }
  retryConversation() {
    if (this.selected) this.select(this.selected);
  }
  send() {
    if (
      this.sending ||
      this.loadingConversation ||
      this.conversationError ||
      !this.selected ||
      !this.text.trim()
    )
      return;
    const recipient = this.selected;
    const draft = this.drafts.get(recipient.id) ?? {
      text: this.text,
      revision: 0,
    };
    this.sending = true;
    this.sendError = "";
    this.subscriptions.add(
      this.api
        .post<Message>("/messages", {
          recipientId: recipient.id,
          text: draft.text,
        })
        .pipe(finalize(() => (this.sending = false)))
        .subscribe({
          next: (message) => {
            if (
              (this.drafts.get(recipient.id)?.revision ?? 0) === draft.revision
            ) {
              this.drafts.delete(recipient.id);
              if (this.selected?.id === recipient.id) this.text = "";
            }
            if (
              this.selected?.id === recipient.id &&
              !this.messages.some((existing) => existing.id === message.id)
            )
              this.messages = [...this.messages, message];
          },
          error: () =>
            (this.sendError =
              "Could not send your message to " +
              recipient.name +
              ". Your draft has been kept."),
        }),
    );
  }
  ngOnDestroy() {
    this.conversationRequest?.unsubscribe();
    this.subscriptions.unsubscribe();
  }
}
