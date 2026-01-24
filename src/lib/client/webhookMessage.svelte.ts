import type { WebhookMessage } from '$lib/shared/types';
let webhookMessageState = $state<WebhookMessage[]>([]);

export const webhookMessages = {
	get state() {
		return webhookMessageState;
	},
	set state(value) {
		webhookMessageState = value;
	},
	clear() {
		webhookMessageState = [];
	}
};
