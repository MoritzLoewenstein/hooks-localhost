<script lang="ts">
	import { onMount } from 'svelte';
	import type { WebhookMessage } from '../shared/types';
	import WebhookMessageListItem from './WebhookMessageListItem.svelte';
	import { webhookMessages } from '$lib/client/webhookMessage.svelte';
	import { formatRelativeDays } from '$lib/shared/formatters';
	import { forwardWebhook } from '$lib/client/webhook-forwarder';
	import { ulid } from 'ulid';

	let webhookMessagesWithDays = $derived(
		webhookMessages.state.map((msg) => {
			return {
				...msg,
				formattedRelativeDays: msg.timestamp ? formatRelativeDays(msg.timestamp) : undefined
			};
		})
	);

	onMount(() => {
		scheduleNextMidnightUpdate();
		return () => {
			if (midnightTimeout) {
				clearTimeout(midnightTimeout);
			}
		};
	});

	function updateRelativeDays() {
		webhookMessagesWithDays = webhookMessages.state.map((msg) => {
			return {
				...msg,
				formattedRelativeDays: msg.timestamp ? formatRelativeDays(msg.timestamp) : undefined
			};
		});
	}

	let midnightTimeout: ReturnType<typeof setTimeout>;
	function getMsUntilMidnight() {
		const now = new Date();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 1, 0); // 00:00:01
		const msUntilMidnight = tomorrow.getTime() - now.getTime();
		return msUntilMidnight;
	}

	function scheduleNextMidnightUpdate() {
		const msUntilMidnight = getMsUntilMidnight();
		midnightTimeout = setTimeout(() => {
			updateRelativeDays();
			scheduleNextMidnightUpdate();
		}, msUntilMidnight);
	}

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
	{#each webhookMessagesWithDays as message (message)}
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
