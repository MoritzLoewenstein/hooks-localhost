import type { WebhookMessage } from './websocket';

export async function forwardWebhook(webhook: WebhookMessage): Promise<number | null> {
	try {
		const { target, method, headers, body } = webhook;

		const fetchOptions: RequestInit = {
			method,
			headers: new Headers(headers)
		};

		if (body !== null && method !== 'GET' && method !== 'HEAD') {
			fetchOptions.body = body;
		}

		const response = await fetch(target, fetchOptions);
		return response.status;
	} catch (error) {
		console.error('Failed to forward webhook:', error);
		return null;
	}
}
