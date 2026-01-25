let formatterRelativeTime: Intl.RelativeTimeFormat;
export function formatRelativeDays(timestamp: number): string {
	formatterRelativeTime ??= new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
	const MS_PER_DAY = 1000 * 60 * 60 * 24;
	const a = new Date();
	const b = new Date(timestamp);
	const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

	const diffDays = Math.floor((utc2 - utc1) / MS_PER_DAY);
	return formatterRelativeTime.format(diffDays, 'day');
}

let formatterTime: Intl.DateTimeFormat;
export function formatTime(timestamp: number): string {
	formatterTime ??= new Intl.DateTimeFormat('en', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
	return formatterTime.format(timestamp);
}
