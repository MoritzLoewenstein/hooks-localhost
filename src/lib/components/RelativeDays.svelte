<script lang="ts">
	import { midnight } from '$lib/client/midnight-key.svelte';
	import { formatRelativeDays } from '$lib/shared/formatters';
	import { onMount } from 'svelte';

	let { timestamp }: { timestamp: number } = $props();

	onMount(() => {
		midnight.subscribe();
		return () => {
			midnight.unsubscribe();
		};
	});
</script>

<span>
	{#key midnight.state.key}
		{formatRelativeDays(timestamp)}
	{/key}
</span>
