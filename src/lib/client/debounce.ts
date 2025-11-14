export function debounce<T extends (...args: never[]) => unknown>(
	func: T,
	wait: number,
	immediate: boolean = false
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null;

	return function executedFunction(this: unknown, ...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(this, args);
		};

		const callNow = immediate && !timeout;

		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(later, wait);

		if (callNow) func.apply(this, args);
	};
}
