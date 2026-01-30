<script lang="ts">
	import type { WebhookMessage } from '../shared/types';
	import WebhookMessageListItem from './WebhookMessageListItem.svelte';
	import { webhookMessages } from '$lib/client/webhookMessage.svelte';
	import { forwardWebhook } from '$lib/client/webhook-forwarder';
	import { ulid } from 'ulid';

	async function handleReplay(message: WebhookMessage) {
		const status = await forwardWebhook(message);
		webhookMessages.state.unshift({
			...message,
			id: ulid(),
			status,
			timestamp: Date.now()
		});
	}
</script>

<ul>
	{#each webhookMessages.state as message (message)}
		<WebhookMessageListItem {message} onReplay={handleReplay} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		list-style-type: none;
		padding: 0;
	}
</style>
