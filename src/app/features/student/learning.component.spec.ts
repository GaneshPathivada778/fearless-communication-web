import { describe, it, expect } from "vitest";
import { of } from "rxjs";
import { LearningComponent } from "./learning.component";
describe("Learning progress", () => {
  it("counts unstarted accessible lessons as zero and ignores unavailable lessons", () => {
    const api = {
      get: (url: string) =>
        of(
          url === "/videos"
            ? [{ id: "a" }, { id: "b" }]
            : [
                { videoId: "a", percentWatched: 100 },
                { videoId: "hidden", percentWatched: 100 },
              ],
        ),
    };
    const component = new LearningComponent(api as any);
    component.load();
    expect(component.overall).toBe(50);
    expect(component.pct("b")).toBe(0);
  });
});
