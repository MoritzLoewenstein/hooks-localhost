<script lang="ts">
	import type { Endpoint } from '../shared/types';
	import EndpointListItem from './EndpointListItem.svelte';

	interface Props {
		endpoints: Endpoint[];
		onEdit: (endpoint: Endpoint) => void;
		onDelete: (id: string) => void;
	}

	let { endpoints, onEdit, onDelete }: Props = $props();
</script>

<ul class="endpoint-list">
	{#each endpoints as endpoint (endpoint.id)}
		<EndpointListItem {endpoint} {onEdit} {onDelete} />
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
