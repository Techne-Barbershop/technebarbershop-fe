import type { TimeSlot } from "@/lib/types";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SLOTS: string[] = [];
for (let hour = 10; hour <= 21; hour += 1) {
  const hh = String(hour).padStart(2, "0");
  SLOTS.push(`${hh}:00`);
  SLOTS.push(`${hh}:15`);
  SLOTS.push(`${hh}:30`);
  SLOTS.push(`${hh}:45`);
}

export { WEEKDAYS, MONTHS_SHORT, MONTHS_LONG };

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function formatDateID(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function isDateAvailable(artistId: string, iso: string): boolean {
  const value = hash(`${artistId}|${iso}`) % 10;
  return value !== 3 && value !== 7;
}

export function getTimeSlots(artistId: string, iso: string): TimeSlot[] {
  return SLOTS.map((time) => ({
    time,
    available: hash(`${artistId}|${iso}|${time}`) % 5 !== 0,
  }));
}

export type CalendarCell = Date | null;

export function getMonthMatrix(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
