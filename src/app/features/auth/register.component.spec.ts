import { describe, it, expect, vi } from "vitest";
import { of } from "rxjs";
import { convertToParamMap } from "@angular/router";
import { RegisterComponent } from "./register.component";
const academy = "11111111-1111-1111-1111-111111111111";
describe("Membership signup", () => {
  it("joins FCC without sending an academy and returns to the selected offer", () => {
    const returnUrl = `/memberships?academy=${academy}&tier=Silver&offer=offer-1`;
    const auth = {
      register: vi.fn(() =>
        of({ user: { role: "Student", tenantId: academy } }),
      ),
    };
    const router = { navigateByUrl: vi.fn() };
    const component = new RegisterComponent(
      auth as any,
      router as any,
      { snapshot: { queryParamMap: convertToParamMap({ returnUrl }) } } as any,
    );
    component.name = " Learner ";
    component.email = " student@example.test ";
    component.password = "test-password";
    component.submit({ invalid: false } as any);
    expect(auth.register).toHaveBeenCalledWith(
      "Learner",
      "student@example.test",
      "test-password",
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith(
      "/memberships?tier=Silver&offer=offer-1",
    );
  });
});
