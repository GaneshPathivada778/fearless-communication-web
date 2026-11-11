import { Component, OnInit, inject, signal, DestroyRef } from "@angular/core";
import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { finalize, timeout } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  preferredTime: string;
  status: "new" | "contacted";
  createdAt: string;
}

@Component({
  selector: "fcc-callback-requests",
  standalone: true,
  imports: [DatePipe],
  template: `
    <section aria-labelledby="callbacks-title">
      <div class="request-heading">
        <div>
          <h2 id="callbacks-title">Callback requests</h2>
          <p>Requests from the FCC homepage. Times are shown in IST.</p>
        </div>
        <button
          type="button"
          class="btn"
          (click)="load()"
          [disabled]="loading()"
        >
          Refresh
        </button>
      </div>
      @if (error()) {
        <p role="alert" class="error">{{ error() }}</p>
      }
      @if (notice()) {
        <p role="status">{{ notice() }}</p>
      }
      @if (loading()) {
        <p role="status">Loading callback requests…</p>
      } @else if (!error() && !items().length) {
        <p>No callback requests yet.</p>
      }
      @if (items().length) {
        <div
          class="request-table"
          tabindex="0"
          role="region"
          aria-label="Scrollable callback requests"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Learner</th>
                <th scope="col">Phone</th>
                <th scope="col">Preferred time</th>
                <th scope="col">Received (IST)</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr>
                  <th scope="row">{{ item.name }}</th>
                  <td>
                    <a [href]="'tel:' + item.phone">{{ item.phone }}</a>
                  </td>
                  <td>{{ item.preferredTime || "No preference" }}</td>
                  <td>{{ item.createdAt | date: "medium" : "+0530" }}</td>
                  <td>
                    {{ item.status === "contacted" ? "Contacted" : "New" }}
                  </td>
                  <td>
                    <button
                      type="button"
                      class="btn ghost"
                      [disabled]="pending().has(item.id)"
                      (click)="update(item)"
                    >
                      {{ item.status === "new" ? "Mark contacted" : "Reopen" }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      <div class="request-pages">
        <button
          type="button"
          class="btn ghost"
          (click)="page(-1)"
          [disabled]="loading() || offset === 0"
        >
          Previous
        </button>
        <span
          >{{ total() ? offset + 1 : 0 }}–{{ offset + items().length }} of
          {{ total() }}</span
        >
        <button
          type="button"
          class="btn ghost"
          (click)="page(1)"
          [disabled]="loading() || offset + items().length >= total()"
        >
          Next
        </button>
      </div>
    </section>
  `,
  styles: `
    .request-heading {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .request-heading h2 {
      margin: 0;
    }
    .request-heading p {
      margin-top: 0.5rem;
    }
    .request-table {
      overflow-x: auto;
    }
    .request-table th,
    .request-table td {
      min-width: 8rem;
      overflow-wrap: anywhere;
    }
    .request-pages {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 1.5rem;
    }
  `,
})
export class CallbackRequestsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  readonly items = signal<CallbackRequest[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly error = signal("");
  readonly notice = signal("");
  readonly pending = signal(new Set<string>());
  offset = 0;
  private readonly limit = 25;

  ngOnInit() {
    this.load();
  }

  load() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set("");
    this.http
      .get<{ items: CallbackRequest[]; total: number }>(
        `/api/admin/callback-requests?offset=${this.offset}&limit=${this.limit}`,
      )
      .pipe(
        timeout(15000),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.total.set(result.total);
        },
        error: () => {
          this.items.set([]);
          this.error.set(
            "Unable to load callback requests. Use Refresh to retry.",
          );
        },
      });
  }

  page(direction: number) {
    if (this.loading()) return;
    this.offset = Math.max(0, this.offset + direction * this.limit);
    this.load();
  }

  update(item: CallbackRequest) {
    if (this.pending().has(item.id)) return;
    this.pending.update((ids) => new Set(ids).add(item.id));
    this.error.set("");
    this.notice.set("");
    this.http
      .patch<CallbackRequest>(`/api/admin/callback-requests/${item.id}`, {
        status: item.status === "new" ? "contacted" : "new",
      })
      .pipe(
        timeout(15000),
        takeUntilDestroyed(this.destroyRef),
        finalize(() =>
          this.pending.update((ids) => {
            const next = new Set(ids);
            next.delete(item.id);
            return next;
          }),
        ),
      )
      .subscribe({
        next: (updated) => {
          this.items.update((items) =>
            items.map((row) => (row.id === updated.id ? updated : row)),
          );
          this.notice.set("Callback request updated.");
        },
        error: () => this.error.set("Status wasn’t saved. Please try again."),
      });
  }
}
