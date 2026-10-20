import { describe, it, expect, vi, afterEach } from "vitest";
import { AuthService } from "./auth.service";
afterEach(() => localStorage.removeItem("fcc_session"));
describe("Session state", () => {
  it("tolerates malformed stored session data", () => {
    localStorage.setItem("fcc_session", "{broken");
    const auth = new AuthService({} as any, {} as any);
    expect(auth.user()).toBeNull();
    expect(auth.token()).toBe("");
  });
  it("updates the token on login and removes the routed private screen on logout", () => {
    const router = { navigateByUrl: vi.fn().mockResolvedValue(true) };
    const auth = new AuthService({} as any, router as any);
    auth.save({
      user: { id: "me", name: "Me", email: "me@example.test", role: "Student" },
      accessToken: "new-token",
    });
    expect(auth.token()).toBe("new-token");
    auth.logout();
    expect(auth.user()).toBeNull();
    expect(auth.token()).toBe("");
    expect(localStorage.getItem("fcc_session")).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith("/login", {
      replaceUrl: true,
    });
  });
});
