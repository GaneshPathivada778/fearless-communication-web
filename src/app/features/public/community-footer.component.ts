import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";
import {
  COMMUNITY_CONTACT,
  COMMUNITY_LINKS,
  SOCIAL_LINKS,
} from "./home-content";
import { SocialIconComponent } from "./social-icon.component";

@Component({
  selector: "fcc-community-footer",
  standalone: true,
  imports: [RouterLink, SocialIconComponent],
  templateUrl: "./community-footer.component.html",
  styleUrl: "./community-footer.component.css",
})
export class CommunityFooterComponent {
  readonly auth = inject(AuthService);
  readonly contact = COMMUNITY_CONTACT;
  readonly links = COMMUNITY_LINKS;
  readonly socialLinks = SOCIAL_LINKS;
  readonly year = new Date().getFullYear();
}
