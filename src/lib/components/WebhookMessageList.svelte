<script lang="ts">
	import { onMount } from 'svelte';
	import type { WebhookMessage } from '../shared/types';
	import WebhookMessageListItem from './WebhookMessageListItem.svelte';

	interface WebhookMessageWithRef extends WebhookMessage {
		ref?: WebhookMessageListItem;
	}

	interface Props {
		messages: WebhookMessageWithRef[];
		onReplay: (message: WebhookMessage) => void;
	}

	let { messages, onReplay }: Props = $props();

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
			messages.forEach((msg) => {
				msg.ref?.dayChanged?.();
			});
			scheduleNextMidnightUpdate();
		}, msUntilMidnight);
	}

	onMount(() => {
		scheduleNextMidnightUpdate();
		return () => {
			if (midnightTimeout) {
				clearTimeout(midnightTimeout);
			}
		};
	});
</script>

<ul>
	{#each messages as message (message.id)}
		<WebhookMessageListItem bind:this={message.ref} {message} {onReplay} />
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
