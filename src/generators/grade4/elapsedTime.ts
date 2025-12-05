import { Problem } from '../../types';

export function generateElapsedTime(): Problem {
  // Generate elapsed time problems
  // e.g., 12:14 a.m. to 3:31 a.m. (answer in minutes)

  // Decide if we're staying within same period (a.m. or p.m.) or crossing
  const stayWithinPeriod = Math.random() < 0.7; // 70% chance to stay within same period

  let startHour: number;
  let startMinute: number;
  let endHour: number;
  let endMinute: number;
  let period: string;

  if (stayWithinPeriod) {
    // Both times in same a.m. or p.m. period
    period = Math.random() < 0.5 ? 'a.m.' : 'p.m.';

    // Generate start time
    startHour = Math.floor(Math.random() * 11) + 1; // 1-11 (avoid 12 for simplicity)
    startMinute = Math.floor(Math.random() * 60);

    // Generate end time (must be after start time)
    // End hour is same or later than start hour
    endHour = startHour + Math.floor(Math.random() * (12 - startHour)) + 1;
    if (endHour > 11) endHour = 11; // Cap at 11

    // If same hour, end minute must be later
    if (endHour === startHour) {
      endMinute = startMinute + Math.floor(Math.random() * (60 - startMinute - 1)) + 1;
    } else {
      endMinute = Math.floor(Math.random() * 60);
    }

    // Calculate elapsed time in minutes
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const elapsedMinutes = endTotalMinutes - startTotalMinutes;

    const formatTime = (h: number, m: number): string => {
      const hourStr = h.toString();
      const minStr = m.toString().padStart(2, '0');
      return `${hourStr}:${minStr}`;
    };

    return {
      id: crypto.randomUUID(),
      display: `${formatTime(startHour, startMinute)} ${period} to ${formatTime(endHour, endMinute)} ${period} = ___ minutes`,
      answer: elapsedMinutes,
      type: 'elapsedTime',
      typeName: 'Elapsed Time'
    };
  } else {
    // Crossing from a.m. to p.m. or within a short span
    // For simplicity, let's do times within the same 12-hour period but easier calculations

    // Generate a simpler problem: hours and minutes difference
    startHour = Math.floor(Math.random() * 10) + 1; // 1-10
    startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45

    // Add 1-4 hours and some minutes
    const hoursToAdd = Math.floor(Math.random() * 4) + 1; // 1-4 hours
    const minutesToAdd = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45

    endHour = startHour + hoursToAdd;
    endMinute = startMinute + minutesToAdd;

    // Handle minute overflow
    if (endMinute >= 60) {
      endMinute -= 60;
      endHour += 1;
    }

    // Keep within 12-hour format
    period = Math.random() < 0.5 ? 'a.m.' : 'p.m.';
    if (endHour > 12) {
      endHour -= 12;
    }

    const elapsedMinutes = hoursToAdd * 60 + minutesToAdd;

    const formatTime = (h: number, m: number): string => {
      const hourStr = h.toString();
      const minStr = m.toString().padStart(2, '0');
      return `${hourStr}:${minStr}`;
    };

    return {
      id: crypto.randomUUID(),
      display: `${formatTime(startHour, startMinute)} ${period} to ${formatTime(endHour, endMinute)} ${period} = ___ minutes`,
      answer: elapsedMinutes,
      type: 'elapsedTime',
      typeName: 'Elapsed Time'
    };
  }
}
