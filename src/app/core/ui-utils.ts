export function errorMessage(error: unknown, fallback: string): string {
  const body = (error as { error?: unknown })?.error;
  if (typeof body === "string" && body.length < 250 && !body.includes("<"))
    return body;
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string"
  )
    return body.message;
  return fallback;
}
export function percent(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(0, Math.min(100, Math.round(number)))
    : 0;
}
export function trackById(_index: number, item: { id: string }): string {
  return item.id;
}
