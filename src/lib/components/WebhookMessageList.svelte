<script lang="ts">
	import type { WebhookMessage } from '../shared/types';
	import WebhookMessageListItem from './WebhookMessageListItem.svelte';

	interface Props {
		messages: WebhookMessage[];
		onReplay: (message: WebhookMessage) => void;
	}

	let { messages, onReplay }: Props = $props();
</script>

<ul>
	{#each messages as message (message)}
		<WebhookMessageListItem {message} {onReplay} />
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
