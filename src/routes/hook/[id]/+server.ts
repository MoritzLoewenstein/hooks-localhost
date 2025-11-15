import type { RequestHandler } from './$types';
import { getWebhookEndpointById } from '$lib/server/webhook';
import { sendToUser, isUserConnected } from '$lib/server/websocket';

export const GET: RequestHandler = async (event) => handleWebhook(event);
export const POST: RequestHandler = async (event) => handleWebhook(event);
export const PUT: RequestHandler = async (event) => handleWebhook(event);
export const PATCH: RequestHandler = async (event) => handleWebhook(event);
export const DELETE: RequestHandler = async (event) => handleWebhook(event);

const handleWebhook: RequestHandler = async ({ params, request }) => {
	const { id } = params;

	const endpoint = await getWebhookEndpointById(id);
	if (!endpoint) {
		return new Response(null, { status: 204 });
	}

	if (!isUserConnected(endpoint.userId)) {
		return new Response(null, { status: 204 });
	}

	const headers: Record<string, string> = {};
	request.headers.forEach((value, key) => {
		headers[key] = value;
	});

	let body: string | null = null;
	if (request.method !== 'GET') {
		body = await request.text();
	}

	sendToUser(endpoint.userId, {
		type: 'webhook',
		data: {
			endpointId: endpoint.id,
			target: endpoint.target,
			method: request.method,
			headers,
			body
		}
	});

	return new Response(null, { status: 204 });
};
