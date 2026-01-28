export interface Endpoint {
	id: string;
	url: string;
	target: string;
	method: string;
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
	formattedRelativeDays?:string;
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
