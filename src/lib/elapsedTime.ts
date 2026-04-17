export type ElapsedTimeAnswerMode = 'minutes' | 'hours-minutes';

export interface ElapsedTimeAnswerFields {
  hours?: string;
  minutes: string;
}

export function getElapsedTimeAnswerMinutes(
  mode: ElapsedTimeAnswerMode,
  fields: ElapsedTimeAnswerFields,
): number | null {
  if (mode === 'minutes') {
    if (fields.minutes.trim() === '') {
      return null;
    }

    return Number(fields.minutes);
  }

  const hours = fields.hours?.trim() ?? '';
  const minutes = fields.minutes.trim();

  if (hours === '' && minutes === '') {
    return null;
  }

  return Number(hours || '0') * 60 + Number(minutes || '0');
}

export function formatElapsedTimeAnswer(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  if (minutes === 0) {
    return `${totalMinutes} minutes (${hours} hour${hours === 1 ? '' : 's'})`;
  }

  return `${totalMinutes} minutes (${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'})`;
}
