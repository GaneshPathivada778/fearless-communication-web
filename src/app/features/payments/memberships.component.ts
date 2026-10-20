import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../core/auth.service";

@Component({
  selector: "fcc-memberships",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="catalog-container">
      <p class="fcc-kicker">FCC MEMBERSHIPS</p>
      <h1>Compare memberships</h1>
      <p>Compare the available memberships below.</p>
      <p class="catalog-message" role="status">Loading FCC memberships…</p>
    </section>
  `,
  styles: [`
    .catalog-container {
      max-width: 1100px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
  `],
})
export class MembershipsComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly router = inject(Router);

  ngOnInit() {}
  ngOnDestroy() {}
}
