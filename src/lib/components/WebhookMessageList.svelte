<script lang="ts">
	import { onMount } from 'svelte';
	import type { WebhookMessage } from '../shared/types';
	import WebhookMessageListItem from './WebhookMessageListItem.svelte';

	interface Props {
		messages: WebhookMessage[];
		onReplay: (message: WebhookMessage) => void;
	}

	let { messages, onReplay }: Props = $props();

	let itemRefs = $state<WebhookMessageListItem[]>([]);
	let midnightTimeout: ReturnType<typeof setTimeout>;

	function scheduleNextMidnightUpdate() {
		const now = new Date();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 10, 0); // 00:00:10
		const msUntilMidnight = tomorrow.getTime() - now.getTime();

		midnightTimeout = setTimeout(() => {
			itemRefs.forEach((item) => item?.dayChanged?.());
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
	{#each messages as message, i (message)}
		<WebhookMessageListItem bind:this={itemRefs[i]} {message} {onReplay} />
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
