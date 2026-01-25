import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import WebhookMessageList from '../src/lib/components/WebhookMessageList.svelte';
import type { WebhookMessage } from '../src/lib/shared/types';

describe('WebhookMessageList', () => {
	beforeEach(() => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		// Set initial time to Jan 15 23:59:50 in local timezone
		const baseTime = new Date('2024-01-15T23:59:50');
		vi.setSystemTime(baseTime);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should update all items when midnight is reached', async () => {
		const messages: WebhookMessage[] = [
			{
				id: '1',
				method: 'GET',
				endpointId: 'test-1',
				target: 'http://localhost:3000/api/1',
				status: 200,
				headers: {},
				timestamp: new Date('2024-01-15T23:00:00').getTime(),
				body: null
			},
			{
				id: '2',
				method: 'POST',
				endpointId: 'test-2',
				target: 'http://localhost:3000/api/2',
				status: 201,
				headers: {},
				timestamp: new Date('2024-01-15T22:30:00').getTime(),
				body: null
			},
			{
				id: '3',
				method: 'PUT',
				endpointId: 'test-3',
				target: 'http://localhost:3000/api/3',
				status: 200,
				headers: {},
				timestamp: new Date('2024-01-15T21:00:00').getTime(),
				body: null
			}
		];

		await render(WebhookMessageList, {
			target: document.body,
			props: {
				messages,
				onReplay: vi.fn()
			}
		});

		const container = document.body;

		// Get initial timestamps
		const getTimestamps = () =>
			Array.from(container.querySelectorAll('.timestamp')).map((el) => el.textContent?.trim());

		const initialTimestamps = getTimestamps();
		console.log(initialTimestamps);
		expect(initialTimestamps.length).toBe(3);
		expect(initialTimestamps.every((ts) => ts?.includes('today'))).toBe(true);

		// Advance time past midnight (11 seconds to reach 00:00:01)
		vi.advanceTimersByTime(11 * 1000);

		// Wait for the DOM to update
		await vi.waitFor(() => {
			const updatedTimestamps = getTimestamps();
			console.log(updatedTimestamps);
			expect(updatedTimestamps.length).toBe(3);
			expect(updatedTimestamps.every((ts) => ts?.includes('yesterday'))).toBe(true);
		});
	});

	it('should schedule next update and continue after first midnight', async () => {
		const messages: WebhookMessage[] = [
			{
				id: '1',
				method: 'GET',
				endpointId: 'test-1',
				target: 'http://localhost:3000/api/1',
				status: 200,
				headers: {},
				timestamp: new Date('2024-01-15T12:00:00').getTime(),
				body: null
			}
		];

		await render(WebhookMessageList, {
			target: document.body,
			props: {
				messages,
				onReplay: vi.fn()
			}
		});

		const container = document.body;

		const getTimestamp = () => container.querySelector('.timestamp')?.textContent?.trim();

		// Verify "today"
		expect(getTimestamp()).toContain('today');

		// Advance to first midnight
		vi.advanceTimersByTime(11 * 1000);

		await vi.waitFor(() => {
			expect(getTimestamp()).toContain('yesterday');
		});

		// Advance to second midnight (24 hours later)
		vi.advanceTimersByTime(24 * 60 * 60 * 1000);

		await vi.waitFor(() => {
			expect(getTimestamp()).toContain('2 days ago');
		});
	});
});
