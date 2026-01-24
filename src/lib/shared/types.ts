export interface Endpoint {
	id: string;
	url: string;
	target: string;
	method: string;
	createdAt: string;
}

export interface WebhookMessage {
	endpointId: string;
	target: string;
	method: string;
	headers: Record<string, string>;
	body: string | null;
	status?: number | null;
	timestamp?: number;
}
