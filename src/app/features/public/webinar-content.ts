// Product details supplied by FCC; update the event here when the next date is confirmed.
export const WEBINAR = {
  startsAt: "2026-10-03T11:00:00+05:30",
  endsAt: "2026-10-03T12:30:00+05:30",
  dateLabel: "Saturday, 3 October 2026",
  timeLabel: "11 AM – 12:30 PM IST",
  registrationUrl:
    "https://learn.fearlesscommunicationclub.com/web/checkout/68d2c30ae547f4395d6d9f6a",
  sourceUrl: "https://learn.fearlesscommunicationclub.com/services/bs-homepage",
} as const;

export function webinarHasEnded(now: number): boolean {
  return now >= Date.parse(WEBINAR.endsAt);
}
