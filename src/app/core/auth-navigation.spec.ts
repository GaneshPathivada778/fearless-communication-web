import { describe, expect, it } from "vitest";
import { authDestination, membershipReturnUrl } from "./auth-navigation";
const academy = "11111111-1111-1111-1111-111111111111";
const selected = "/memberships?tier=Gold&offer=offer-1";
describe("Membership return navigation", () => {
  it("keeps tier and offer while dropping legacy academy and unrelated parameters", () => {
    expect(
      membershipReturnUrl(
        selected + `&academy=${academy}&redirect=https://external.test`,
      ),
    ).toBe(selected);
  });
  it.each([
    "https://external.test",
    "//external.test",
    "/memberships-other",
    "/memberships/../admin",
    "/memberships\\external.test",
  ])("rejects unsafe return path %s", (path) =>
    expect(membershipReturnUrl(path)).toBeNull(),
  );
  it("respects role destinations and directs students to the dashboard page", () => {
    expect(authDestination({ role: "Student" } as any, selected)).toBe(
      selected,
    );
    expect(authDestination({ role: "Admin" } as any, selected)).toBe("/admin");
    expect(authDestination({ role: "SuperAdmin" } as any, selected)).toBe(
      "/super-admin",
    );
    expect(authDestination({ role: "Student" } as any, null)).toBe(
      "/dashboard",
    );
    expect(
      authDestination({ role: "Student", tenantId: academy } as any, null),
    ).toBe("/dashboard");
  });
});
