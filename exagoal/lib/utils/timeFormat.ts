/**
 * Formats an ISO string or Date object into a 12-hour AM/PM string.
 * Example: "10:30 AM" or "2:15 PM"
 */
export function formatTo12Hour(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Validates if a given Date object falls within operating hours (6:00 AM to 10:00 PM).
 */
export function isWithinOperatingHours(date: Date): boolean {
  const hours = date.getHours();
  // 6:00 AM is hours = 6
  // 10:00 PM is hours = 22
  // We allow exactly 10:00 PM (22:00), but not 10:01 PM (22:01)
  
  if (hours < 6) return false;
  
  if (hours > 22) return false;
  if (hours === 22 && date.getMinutes() > 0) return false;

  return true;
}

/**
 * Creates a Date object from a local date string and 12-hour time components.
 * @param dateStr e.g. "2024-10-15"
 * @param hour 1-12
 * @param minute 0-59
 * @param ampm "AM" or "PM"
 * @returns Date object in local time
 */
export function createDateFrom12Hour(dateStr: string, hour: number, minute: number, ampm: 'AM' | 'PM'): Date {
  let h24 = hour;
  if (ampm === 'AM' && hour === 12) {
    h24 = 0;
  } else if (ampm === 'PM' && hour !== 12) {
    h24 = hour + 12;
  }
  
  // "YYYY-MM-DD" parses as UTC midnight. 
  // We want it to be local time. The safest way is to parse parts.
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, h24, minute, 0, 0);
}
