import { Problem } from '../../types';

type Period = 'a.m.' | 'p.m.';

interface ClockTime {
  hour: number;
  minute: number;
  period: Period;
}

const MINUTES_PER_DAY = 24 * 60;
const QUARTER_HOUR_OPTIONS = [0, 15, 30, 45];

function formatClockTime(time: ClockTime): string {
  return `${time.hour}:${time.minute.toString().padStart(2, '0')}`;
}

function toAbsoluteMinutes(time: ClockTime): number {
  const normalizedHour = time.hour % 12;
  const periodOffset = time.period === 'p.m.' ? 12 * 60 : 0;

  return periodOffset + normalizedHour * 60 + time.minute;
}

function fromAbsoluteMinutes(totalMinutes: number): ClockTime {
  const wrappedMinutes = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour24 = Math.floor(wrappedMinutes / 60);
  const minute = wrappedMinutes % 60;

  return {
    hour: hour24 % 12 || 12,
    minute,
    period: hour24 >= 12 ? 'p.m.' : 'a.m.',
  };
}

export function buildElapsedTimeProblem(start: ClockTime, end: ClockTime): Problem {
  const startMinutes = toAbsoluteMinutes(start);
  let endMinutes = toAbsoluteMinutes(end);

  if (endMinutes <= startMinutes) {
    endMinutes += MINUTES_PER_DAY;
  }

  return {
    id: crypto.randomUUID(),
    display: `${formatClockTime(start)} ${start.period} to ${formatClockTime(end)} ${end.period} = ___`,
    answer: endMinutes - startMinutes,
    type: 'elapsedTime',
    typeName: 'Elapsed Time',
  };
}

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function generateElapsedTime(): Problem {
  const stayWithinPeriod = Math.random() < 0.7;

  if (stayWithinPeriod) {
    const period: Period = Math.random() < 0.5 ? 'a.m.' : 'p.m.';
    const halfDayOffset = period === 'p.m.' ? 12 * 60 : 0;
    const startHour = randomInt(9) + 1; // 1-9
    const startMinute = randomInt(60);
    const startAbsoluteMinutes = halfDayOffset + startHour * 60 + startMinute;
    const latestSamePeriodMinute = halfDayOffset + (11 * 60 + 59);
    const maxDuration = Math.min(latestSamePeriodMinute - startAbsoluteMinutes, 4 * 60);
    const durationMinutes = randomInt(maxDuration) + 1;

    return buildElapsedTimeProblem(
      fromAbsoluteMinutes(startAbsoluteMinutes),
      fromAbsoluteMinutes(startAbsoluteMinutes + durationMinutes),
    );
  }

  const startHour = randomInt(5) + 7; // 7-11 p.m.
  const startMinute = QUARTER_HOUR_OPTIONS[randomInt(QUARTER_HOUR_OPTIONS.length)];
  const endHour = randomInt(5) + 1; // 1-5 a.m.
  const endMinute = QUARTER_HOUR_OPTIONS[randomInt(QUARTER_HOUR_OPTIONS.length)];

  return buildElapsedTimeProblem(
    { hour: startHour, minute: startMinute, period: 'p.m.' },
    { hour: endHour, minute: endMinute, period: 'a.m.' },
  );
}
