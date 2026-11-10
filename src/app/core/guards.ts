import { CanActivateFn, CanMatchFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService, Role } from "./auth.service";
export const authGuard: CanActivateFn = (_route, state) => {
  const a = inject(AuthService);
  return a.user()
    ? true
    : inject(Router).createUrlTree(["/login"], {
        queryParams: { returnUrl: state.url },
      });
};
export const roleGuard =
  (roles: Role[]): CanActivateFn =>
  () => {
    const u = inject(AuthService).user();
    return u && roles.includes(u.role)
      ? true
      : inject(Router).createUrlTree(["/dashboard"]);
  };

export const studentDashboardGuard: CanActivateFn = () => {
  const u = inject(AuthService).user();
  return u?.role === "Admin"
    ? inject(Router).createUrlTree(["/admin"])
    : u?.role === "SuperAdmin"
      ? inject(Router).createUrlTree(["/super-admin"])
      : true;
};

export const coursesPageGuard: CanActivateFn = () => {
  return true;
};

export const adminCourseMatchGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.user();
  const isAdmin = u?.role === "Admin" || u?.role === "SuperAdmin";
  if (!isAdmin) return false;

  const currentNav = router.getCurrentNavigation();
  const queryParams = currentNav?.extractedUrl.queryParams;
  if (
    queryParams &&
    (queryParams["view"] === "student" || queryParams["preview"] !== undefined)
  ) {
    return false;
  }
  if (
    typeof window !== "undefined" &&
    (window.location.search.includes("view=student") ||
      window.location.search.includes("preview"))
  ) {
    return false;
  }
  return true;
};

// Retired public membership URLs remain available to signed-in members.
export const memberPageGuard: CanActivateFn = () =>
  inject(AuthService).user() ? true : inject(Router).createUrlTree(["/"]);
