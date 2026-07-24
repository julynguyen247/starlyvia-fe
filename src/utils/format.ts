type RelativeTimeUnit = 'day' | 'hour' | 'minute' | 'second';

function formatRelative(value: number, unit: RelativeTimeUnit, locale: string): string {
  const relativeFormatter = typeof Intl.RelativeTimeFormat === 'function'
    ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    : null;
  if (relativeFormatter) return relativeFormatter.format(value, unit);

  if (value === 0) return unit === 'second' ? 'now' : `this ${unit}`;
  if (unit === 'day' && value === -1) return 'yesterday';
  if (unit === 'day' && value === 1) return 'tomorrow';

  const amount = Math.abs(value);
  const label = `${unit}${amount === 1 ? '' : 's'}`;
  return value < 0 ? `${amount} ${label} ago` : `in ${amount} ${label}`;
}

export function formatDate(value: string, locale = 'en-US'): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function formatDateRange(start: string, end: string, locale = 'en-US'): string {
  return start === end ? formatDate(start, locale) : `${formatDate(start, locale)} – ${formatDate(end, locale)}`;
}

export function formatTime(value: string, locale = 'en-US'): string {
  const [hourPart = '0', minutePart = '00'] = value.split(':');
  const hour = Number(hourPart);
  if (Number.isNaN(hour)) return value;
  const date = new Date(2000, 0, 1, hour, Number(minutePart));
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    hour12: locale.startsWith('en'),
    minute: '2-digit',
  }).format(date);
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number, locale = 'en-US'): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return locale.startsWith('vi') ? `${minutes} phút` : `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (locale.startsWith('vi')) return remainder ? `${hours} giờ ${remainder} phút` : `${hours} giờ`;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

export function relativeTime(value: string, locale = 'en-US'): string {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return value;

  const deltaSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absolute = Math.abs(deltaSeconds);
  if (absolute < 60) return formatRelative(deltaSeconds, 'second', locale);
  if (absolute < 3600) return formatRelative(Math.round(deltaSeconds / 60), 'minute', locale);
  if (absolute < 86400) return formatRelative(Math.round(deltaSeconds / 3600), 'hour', locale);
  return formatRelative(Math.round(deltaSeconds / 86400), 'day', locale);
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
