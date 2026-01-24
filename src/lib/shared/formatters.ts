let formatterRelativeTime;
let formatterTime;
export function formatRelativeTime(timestamp: number): string {
	formatterRelativeTime ??= new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
	formatterTime ??= new Intl.DateTimeFormat('en', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
	const now = Date.now();
	const diffMs = timestamp - now;

	const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
	const dayLabel = formatterRelativeTime.format(diffDays, 'day');
	const time = formatterTime.format(now);

	return `${dayLabel} ${time}`;
}
