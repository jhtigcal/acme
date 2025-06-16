import { add, formatDate, isBefore } from "date-fns";

export function getDatesInRange({
  start,
  end,
}: {
  start: Date;
  end: Date;
}): string[] {
  const dates: string[] = [];

  let current = start;

  while (isBefore(current, end)) {
    dates.push(formatDate(current, "yyyy-MM-dd"));

    current = add(current, {
      days: 1,
    });
  }

  dates.push(formatDate(end, "yyyy-MM-dd"));

  return dates;
}
