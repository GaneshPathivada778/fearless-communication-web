import { describe, it, expect, vi } from "vitest";
import { Subject, of } from "rxjs";
import { MessagesComponent } from "./messages.component";
const alice = { id: "alice", name: "Alice" };
const bob = { id: "bob", name: "Bob" };
function setup() {
  const aliceRequest = new Subject<any[]>();
  const bobRequest = new Subject<any[]>();
  const sent = new Subject<any>();
  const api = {
    get: vi.fn((url: string) =>
      url.endsWith("alice")
        ? aliceRequest
        : url.endsWith("bob")
          ? bobRequest
          : of([]),
    ),
    post: vi.fn(() => sent),
  };
  const component = new MessagesComponent(
    api as any,
    { user: () => ({ id: "me" }) } as any,
  );
  return { component, api, aliceRequest, bobRequest, sent };
}
describe("Message conversation integrity", () => {
  it("cancels an old recipient request and clears old messages immediately", () => {
    const { component, aliceRequest, bobRequest } = setup();
    component.select(alice);
    component.messages = [{ id: "old" } as any];
    component.select(bob);
    expect(component.messages).toEqual([]);
    expect(aliceRequest.observed).toBe(false);
    bobRequest.next([{ id: "bob-message" }]);
    bobRequest.complete();
    aliceRequest.next([{ id: "alice-message" }]);
    expect(component.messages[0].id).toBe("bob-message");
    component.ngOnDestroy();
  });
  it("keeps drafts separate and never inserts a sent message under a different recipient", () => {
    const { component, aliceRequest, bobRequest, sent } = setup();
    component.select(alice);
    aliceRequest.next([]);
    aliceRequest.complete();
    component.updateDraft("For Alice");
    component.send();
    component.select(bob);
    bobRequest.next([]);
    bobRequest.complete();
    component.updateDraft("For Bob");
    sent.next({ id: "sent-a" });
    sent.complete();
    expect(component.messages).toEqual([]);
    expect(component.text).toBe("For Bob");
    component.select(alice);
    expect(component.text).toBe("");
    component.ngOnDestroy();
  });
  it("preserves edits made during a send, even if the user returns to the same text", () => {
    const { component, aliceRequest, sent, api } = setup();
    component.select(alice);
    aliceRequest.next([]);
    aliceRequest.complete();
    component.updateDraft("Hello");
    component.send();
    component.send();
    component.updateDraft("New");
    component.updateDraft("Hello");
    sent.next({ id: "sent" });
    sent.complete();
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(component.text).toBe("Hello");
    component.ngOnDestroy();
  });
  it("keeps a failed message draft and releases the send button", () => {
    const { component, aliceRequest, sent } = setup();
    component.select(alice);
    aliceRequest.next([]);
    aliceRequest.complete();
    component.updateDraft("Hello");
    component.send();
    sent.error(new Error("offline"));
    expect(component.text).toBe("Hello");
    expect(component.sending).toBe(false);
    expect(component.sendError).toContain("Alice");
    component.ngOnDestroy();
  });
  it("keeps a just-sent message when a stale conversation reload finishes", () => {
    const { component, aliceRequest, bobRequest, sent } = setup();
    component.select(alice);
    aliceRequest.next([]);
    aliceRequest.complete();
    component.updateDraft("Hello");
    component.send();
    component.select(bob);
    bobRequest.next([]);
    bobRequest.complete();
    const reload = new Subject<any[]>();
    (component as any).api.get = () => reload;
    component.select(alice);
    sent.next({ id: "sent-a" });
    sent.complete();
    reload.next([]);
    reload.complete();
    expect(component.messages.map((message) => message.id)).toEqual(["sent-a"]);
    component.ngOnDestroy();
  });
});
