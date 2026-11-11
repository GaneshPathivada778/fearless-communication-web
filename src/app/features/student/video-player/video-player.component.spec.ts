import { describe, it, expect, vi } from "vitest";
import { ElementRef } from "@angular/core";
import { convertToParamMap } from "@angular/router";
import { of, Subject } from "rxjs";
import { VideoPlayerComponent } from "./video-player.component";
function setup() {
  const requests: Subject<any>[] = [];
  const api = {
    get: vi.fn((url: string) =>
      of(
        url === "/videos"
          ? [{ id: "lesson" }]
          : url === "/videos/progress"
            ? [{ videoId: "lesson", positionSeconds: 40, percentWatched: 40 }]
            : [],
      ),
    ),
    post: vi.fn(() => {
      const response = new Subject<any>();
      requests.push(response);
      return response;
    }),
  };
  const component = new VideoPlayerComponent(
    { paramMap: of(convertToParamMap({ id: "lesson" })) } as any,
    api as any,
  );
  component.ngOnInit();
  return { component, api, requests };
}
describe("Video playback progress", () => {
  it("restores only after metadata is ready and does not overwrite saved progress beforehand", () => {
    const { component, api } = setup();
    const media = { readyState: 0, duration: 100, currentTime: 0 };
    component.player = new ElementRef(media as HTMLVideoElement);
    component.restorePosition();
    component.saveProgress(true);
    expect(media.currentTime).toBe(0);
    expect(api.post).not.toHaveBeenCalled();
    media.readyState = 1;
    component.restorePosition();
    expect(media.currentTime).toBe(40);
    component.ngOnDestroy();
  });
  it("serializes progress writes and saves the final position despite throttling", () => {
    const { component, api, requests } = setup();
    component.player = new ElementRef({
      readyState: 1,
      duration: 100,
      currentTime: 0,
    } as HTMLVideoElement);
    component.restorePosition();
    component.player.nativeElement.currentTime = 50;
    component.saveProgress(true);
    component.player.nativeElement.currentTime = 100;
    component.saveProgress(true);
    expect(api.post).toHaveBeenCalledTimes(1);
    requests[0].next({});
    requests[0].complete();
    expect(api.post).toHaveBeenLastCalledWith("/videos/lesson/progress", {
      positionSeconds: 100,
      durationSeconds: 100,
    });
    component.ngOnDestroy();
  });
});
