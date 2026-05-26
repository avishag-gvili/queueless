import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";

/** Format an ISO date string as Hebrew full date: "ראשון, 15 במאי 2026" */
export function formatDateHebrew(iso: string): string {
  return format(parseISO(iso), "EEEE, d בMMMM yyyy", { locale: he });
}

/** Format an ISO datetime string as Hebrew time only: "14:30" */
export function formatTimeHebrew(iso: string): string {
  return format(parseISO(iso), "HH:mm", { locale: he });
}

/** Format an ISO datetime string as full Hebrew datetime: "ראשון, 15 במאי 2026, 14:30" */
export function formatDateTimeHebrew(iso: string): string {
  return format(parseISO(iso), "EEEE, d בMMMM yyyy, HH:mm", { locale: he });
}

/** Format a Date object as YYYY-MM-DD for API queries */
export function toApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
