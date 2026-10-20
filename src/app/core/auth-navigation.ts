import { SessionUser } from "./auth.service";
// Keep return navigation local and limited to the membership journey.
export function membershipReturnUrl(value: string | null): string | null {
  if (!value || !value.startsWith("/memberships") || value.includes("\\"))
    return null;
  try {
    const url = new URL(value, "https://fcc.invalid");
    if (url.origin !== "https://fcc.invalid" || url.pathname !== "/memberships")
      return null;
    const params = new URLSearchParams();
    for (const key of ["tier", "offer"]) {
      const entry = url.searchParams.get(key);
      if (entry && /^[a-zA-Z0-9-]{1,80}$/.test(entry)) params.set(key, entry);
    }
    return "/memberships" + (params.size ? "?" + params.toString() : "");
  } catch {
    return null;
  }
}
export function authDestination(
  user: SessionUser,
  returnUrl: string | null,
): string {
  if (user.role === "Admin") return "/admin";
  if (user.role === "SuperAdmin") return "/super-admin";
  return membershipReturnUrl(returnUrl) ?? "/dashboard";
}
