import type { WebhookMessage } from './websocket';

export async function forwardWebhook(webhook: WebhookMessage): Promise<void> {
	try {
		const { target, method, headers, body } = webhook;

		const fetchOptions: RequestInit = {
			method,
			headers: new Headers(headers)
		};

		if (body !== null && method !== 'GET' && method !== 'HEAD') {
			fetchOptions.body = body;
		}

		await fetch(target, fetchOptions);
	} catch (error) {
		console.error('Failed to forward webhook:', error);
		throw error;
	}
}
