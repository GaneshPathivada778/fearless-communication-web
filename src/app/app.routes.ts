import { Routes } from "@angular/router";
import {
  authGuard,
  memberPageGuard,
  roleGuard,
  studentDashboardGuard,
} from "./core/guards";
export const routes: Routes = [
  {
    path: "contact",
    title: "Contact us | Fearless Communication Club",
    loadComponent: () =>
      import("./features/public/contact.component").then(
        (m) => m.ContactComponent,
      ),
  },
  { path: "contact-us", redirectTo: "contact", pathMatch: "full" },
  {
    path: "",
    title: "Fearless Communication Club | Spoken English Community",
    loadComponent: () =>
      import("./features/public/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    title: "Sign in | FCC",
    loadComponent: () =>
      import("./features/auth/login.component").then((m) => m.LoginComponent),
  },
  { path: "register", redirectTo: "", pathMatch: "full" },
  { path: "admin-register", redirectTo: "login", pathMatch: "full" },
  { path: "platform-plans", redirectTo: "", pathMatch: "full" },
  {
    path: "dashboard",
    canActivate: [authGuard, studentDashboardGuard],
    loadComponent: () =>
      import("./features/student/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "courses",
    title: "Courses & Learning Library | Fearless Communication Club",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/student/courses.component").then(
        (m) => m.CoursesComponent,
      ),
  },
  {
    path: "courses/:id",
    title: "Speak with Confidence | Fearless Communication Club",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/student/course-player.component").then(
        (m) => m.CoursePlayerComponent,
      ),
  },
  {
    path: "live-classes",
    title: "Live Classes | Fearless Communication Club",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/student/live-classes.component").then(
        (m) => m.LiveClassesComponent,
      ),
  },
  {
    path: "events",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/student/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "learning",
    canActivate: [authGuard, roleGuard(["Student"])],
    loadComponent: () =>
      import("./features/student/learning.component").then(
        (m) => m.LearningComponent,
      ),
  },
  {
    path: "learning/:id",
    canActivate: [authGuard, roleGuard(["Student"])],
    loadComponent: () =>
      import("./features/student/video-player.component").then(
        (m) => m.VideoPlayerComponent,
      ),
  },
  {
    path: "memberships",
    canActivate: [memberPageGuard],
    title: "Compare memberships | FCC",
    loadComponent: () =>
      import("./features/payments/memberships.component").then(
        (m) => m.MembershipsComponent,
      ),
  },
  {
    path: "community",
    title: "Community & Practice Circles | Fearless Communication Club",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/community/community.component").then(
        (m) => m.CommunityComponent,
      ),
  },
  {
    path: "messages",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/messages/messages.component").then(
        (m) => m.MessagesComponent,
      ),
  },
  {
    path: "profile",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/profile/profile.component").then(
        (m) => m.ProfileComponent,
      ),
  },
  {
    path: "admin",
    canActivate: [authGuard, roleGuard(["Admin"])],
    loadComponent: () =>
      import("./features/admin/admin-shell.component").then(
        (m) => m.AdminShellComponent,
      ),
  },
  {
    path: "super-admin",
    canActivate: [authGuard, roleGuard(["SuperAdmin"])],
    loadComponent: () =>
      import("./features/super-admin/super-admin.component").then(
        (m) => m.SuperAdminComponent,
      ),
  },
  { path: "**", redirectTo: "" },
];
