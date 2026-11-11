import { Routes } from "@angular/router";
import {
  adminCourseMatchGuard,
  authGuard,
  coursesPageGuard,
  memberPageGuard,
  roleGuard,
  studentDashboardGuard,
} from "./core/guards";
export const routes: Routes = [
  {
    path: "contact",
    title: "Contact us | Fearless Communication Club",
    loadComponent: () =>
      import("./features/public/contact/contact.component").then(
        (m) => m.ContactComponent,
      ),
  },
  { path: "contact-us", redirectTo: "contact", pathMatch: "full" },
  {
    path: "",
    title: "Fearless Communication Club | Spoken English Community",
    loadComponent: () =>
      import("./features/public/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    title: "Sign in | FCC",
    loadComponent: () =>
      import("./features/auth/login/login.component").then((m) => m.LoginComponent),
  },
  { path: "register", redirectTo: "", pathMatch: "full" },
  { path: "admin-register", redirectTo: "login", pathMatch: "full" },
  { path: "platform-plans", redirectTo: "", pathMatch: "full" },
  {
    path: "dashboard",
    canActivate: [authGuard, studentDashboardGuard],
    loadComponent: () =>
      import("./features/student/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "courses",
    title: "Courses & Learning Library | Fearless Communication Club",
    canActivate: [authGuard, coursesPageGuard],
    loadComponent: () =>
      import("./features/student/courses/courses.component").then(
        (m) => m.CoursesComponent,
      ),
  },
  {
    path: "courses/:id",
    title: "Edit Course Curriculum | FCC Admin",
    canMatch: [adminCourseMatchGuard],
    loadComponent: () =>
      import("./features/admin/admin-course/admin-course.component").then(
        (m) => m.AdminCourseComponent,
      ),
  },
  {
    path: "courses/:id",
    title: "Speak with Confidence | Fearless Communication Club",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/student/course-player/course-player.component").then(
        (m) => m.CoursePlayerComponent,
      ),
  },
  {
    path: "live-classes",
    title: "Live Classes | Fearless Communication Club",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/student/live-classes/live-classes.component").then(
        (m) => m.LiveClassesComponent,
      ),
  },
  {
    path: "events",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/student/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "learning",
    canActivate: [authGuard, roleGuard(["Student"])],
    loadComponent: () =>
      import("./features/student/learning/learning.component").then(
        (m) => m.LearningComponent,
      ),
  },
  {
    path: "learning/:id",
    canActivate: [authGuard, roleGuard(["Student"])],
    loadComponent: () =>
      import("./features/student/video-player/video-player.component").then(
        (m) => m.VideoPlayerComponent,
      ),
  },
  {
    path: "memberships",
    canActivate: [memberPageGuard],
    title: "Compare memberships | FCC",
    loadComponent: () =>
      import("./features/payments/memberships/memberships.component").then(
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
      import("./features/admin/admin-shell/admin-shell.component").then(
        (m) => m.AdminShellComponent,
      ),
  },
  {
    path: "admin/courses",
    title: "Course Management | FCC Admin",
    canActivate: [authGuard, roleGuard(["Admin"])],
    loadComponent: () =>
      import("./features/admin/admin-course/admin-course.component").then(
        (m) => m.AdminCourseComponent,
      ),
  },
  {
    path: "admin/courses/:id",
    title: "Edit Course | FCC Admin",
    canActivate: [authGuard, roleGuard(["Admin"])],
    loadComponent: () =>
      import("./features/admin/admin-course/admin-course.component").then(
        (m) => m.AdminCourseComponent,
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
