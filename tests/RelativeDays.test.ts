import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RelativeDays from '../src/lib/components/RelativeDays.svelte';
import { midnight } from '../src/lib/client/midnight-key.svelte';

describe('RelativeDays', () => {
	beforeEach(() => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		// Set initial time to Jan 15 2024, noon
		vi.setSystemTime(new Date('2024-01-15T12:00:00'));
		// Reset midnight state
		midnight.state.key = 0;
		midnight.state.subscribers = 0;
		midnight.state.midnightTimeoutId = null;
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should render timestamp formatted as "today" for same day', async () => {
		const today = new Date('2024-01-15T10:00:00').getTime();

		const { container } = await render(RelativeDays, {
			props: {
				timestamp: today
			}
		});

		const span = container.querySelector('span');
		expect(span?.textContent).toContain('today');
	});

	it('should render timestamp formatted as "yesterday" for previous day', async () => {
		const yesterday = new Date('2024-01-14T10:00:00').getTime();

		const { container } = await render(RelativeDays, {
			props: {
				timestamp: yesterday
			}
		});

		const span = container.querySelector('span');
		expect(span?.textContent).toContain('yesterday');
	});

	it('should render timestamp formatted as relative days for past dates', async () => {
		const threeDaysAgo = new Date('2024-01-12T10:00:00').getTime();

		const { container } = await render(RelativeDays, {
			props: {
				timestamp: threeDaysAgo
			}
		});

		const span = container.querySelector('span');
		expect(span?.textContent).toContain('3 days ago');
	});

	it('should subscribe and unsubscribe from midnight on mount/unmount', async () => {
		const today = new Date('2024-01-15T10:00:00').getTime();

		const { unmount } = await render(RelativeDays, {
			props: {
				timestamp: today
			}
		});

		expect(midnight.state.subscribers).toBe(1);
		expect(midnight.state.midnightTimeoutId).not.toBeNull();

		unmount();

		expect(midnight.state.subscribers).toBe(0);
		expect(midnight.state.midnightTimeoutId).toBeNull();
	});

	it('should update display when midnight key changes', async () => {
		const today = new Date('2024-01-15T10:00:00').getTime();

		const { container } = await render(RelativeDays, {
			props: {
				timestamp: today
			}
		});

		const getTimestamp = () => container.querySelector('span')?.textContent;

		// Initial render should show "today"
		expect(getTimestamp()).toContain('today');

		// Advance to just after midnight (to trigger the scheduled timeout)
		// Time until midnight from 10:00 AM is ~13 hours 59 minutes 50 seconds + 1 second
		const msUntilMidnight = 13 * 60 * 60 * 1000 + 59 * 60 * 1000 + 50 * 1000;
		vi.advanceTimersByTime(msUntilMidnight + 2000);

		// Wait for reactive update
		await vi.waitFor(() => {
			expect(getTimestamp()).toContain('yesterday');
		});
	});

	it('should continue updating at subsequent midnights', async () => {
		const today = new Date('2024-01-15T10:00:00').getTime();

		const { container } = await render(RelativeDays, {
			props: {
				timestamp: today
			}
		});

		const getTimestamp = () => container.querySelector('span')?.textContent;

		// Initial: today
		expect(getTimestamp()).toContain('today');

		// First midnight - advance to just after midnight
		const msUntilFirstMidnight = 13 * 60 * 60 * 1000 + 59 * 60 * 1000 + 50 * 1000;
		vi.advanceTimersByTime(msUntilFirstMidnight + 2000);

		await vi.waitFor(() => {
			expect(getTimestamp()).toContain('yesterday');
		});

		// Second midnight (24 hours later from first midnight)
		vi.advanceTimersByTime(24 * 60 * 60 * 1000);

		await vi.waitFor(() => {
			expect(getTimestamp()).toContain('2 days ago');
		});
	});

	it('should handle multiple instances sharing the same midnight subscription', async () => {
		const today = new Date('2024-01-15T10:00:00').getTime();

		const { unmount: unmount1 } = await render(RelativeDays, {
			target: document.body,
			props: {
				timestamp: today
			}
		});

		expect(midnight.state.subscribers).toBe(1);

		const { unmount: unmount2 } = await render(RelativeDays, {
			target: document.body,
			props: {
				timestamp: today
			}
		});

		expect(midnight.state.subscribers).toBe(2);
		expect(midnight.state.midnightTimeoutId).not.toBeNull();

		unmount1();

		expect(midnight.state.subscribers).toBe(1);
		expect(midnight.state.midnightTimeoutId).not.toBeNull();

		unmount2();

		expect(midnight.state.subscribers).toBe(0);
		expect(midnight.state.midnightTimeoutId).toBeNull();
	});
});
