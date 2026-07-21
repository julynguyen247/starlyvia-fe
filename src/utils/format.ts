const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const relativeFormatter =
  typeof Intl.RelativeTimeFormat === 'function'
    ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    : null;

type RelativeTimeUnit = 'day' | 'hour' | 'minute' | 'second';

function formatRelative(value: number, unit: RelativeTimeUnit): string {
  if (relativeFormatter) return relativeFormatter.format(value, unit);

  if (value === 0) return unit === 'second' ? 'now' : `this ${unit}`;
  if (unit === 'day' && value === -1) return 'yesterday';
  if (unit === 'day' && value === 1) return 'tomorrow';

  const amount = Math.abs(value);
  const label = `${unit}${amount === 1 ? '' : 's'}`;
  return value < 0 ? `${amount} ${label} ago` : `in ${amount} ${label}`;
}

export function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function formatDateRange(start: string, end: string): string {
  return start === end ? formatDate(start) : `${formatDate(start)} – ${formatDate(end)}`;
}

export function formatTime(value: string): string {
  const [hourPart = '0', minutePart = '00'] = value.split(':');
  const hour = Number(hourPart);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutePart} ${suffix}`;
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

export function relativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return value;

  const deltaSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absolute = Math.abs(deltaSeconds);
  if (absolute < 60) return formatRelative(deltaSeconds, 'second');
  if (absolute < 3600) return formatRelative(Math.round(deltaSeconds / 60), 'minute');
  if (absolute < 86400) return formatRelative(Math.round(deltaSeconds / 3600), 'hour');
  return formatRelative(Math.round(deltaSeconds / 86400), 'day');
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
