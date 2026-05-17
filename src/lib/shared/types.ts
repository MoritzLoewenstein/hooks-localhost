import type { HTTP_METHODS, HttpMethod } from '$lib/constants';

export interface Endpoint {
	id: string;
	url: string;
	target: string;
	methods: HttpMethod[];
	createdAt: string;
}

export interface WebSocketMessage {
	type: 'webhook';
	data: WebhookMessage;
}

export interface WebhookMessage {
	id: string;
	endpointId: string;
	target: string;
	method: string;
	headers: Record<string, string>;
	body: string | null;
	status?: number | null;
	timestamp?: number;
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace PrismaJson {
		type WebhookEndpointMethods = (typeof HTTP_METHODS)[number][];
	}
}
