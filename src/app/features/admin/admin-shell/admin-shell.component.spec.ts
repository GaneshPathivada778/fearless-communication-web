import { describe, it, expect, vi } from "vitest";
import { Subject, throwError } from "rxjs";
import { AdminShellComponent } from "./admin-shell.component";
describe("Admin updates", () => {
  it("updates only the changed student and prevents duplicate in-flight toggles", () => {
    const response = new Subject<any>();
    const api = { patch: vi.fn(() => response), get: vi.fn() };
    const component = new AdminShellComponent(api as any);
    const student = { id: "a", isActive: true };
    component.students = [student];
    component.toggle(student);
    component.toggle(student);
    expect(api.patch).toHaveBeenCalledTimes(1);
    response.next({ id: "a", isActive: false });
    response.complete();
    expect(component.students[0].isActive).toBe(false);
    expect(api.get).not.toHaveBeenCalled();
    expect(component.pendingStudents.size).toBe(0);
  });
  it("restores the checkbox and model after a failed permission update", () => {
    const api = { put: vi.fn(() => throwError(() => new Error("offline"))) };
    const component = new AdminShellComponent(api as any);
    const setting = { id: "p", allowed: false };
    const checkbox = { checked: true };
    component.setPermission(setting, { target: checkbox } as any);
    expect(setting.allowed).toBe(false);
    expect(checkbox.checked).toBe(false);
    expect(component.error).toContain("restored");
  });
});
