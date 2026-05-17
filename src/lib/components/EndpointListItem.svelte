<script lang="ts">
	import type { Endpoint } from '../shared/types';

	interface Props {
		endpoint: Endpoint;
		onEdit: (endpoint: Endpoint) => void;
		onDelete: (id: string) => void;
	}

	let { endpoint, onEdit, onDelete }: Props = $props();
</script>

<li>
	<span>{endpoint.url}</span>
	<span class="method">{endpoint.methods.join(', ')}</span>
	<span class="target">→ {endpoint.target}</span>
	<button class="btn-secondary" onclick={() => navigator.clipboard.writeText(endpoint.url)}
		>Copy URL</button
	>
	<button class="btn-secondary" onclick={() => onEdit(endpoint)}>Edit</button>
	<button class="btn-secondary" onclick={() => onDelete(endpoint.id)}>Delete</button>
</li>

<style>
	li {
		border: 1px solid #ccc;
		padding: 1rem;
		display: flex;
		flex-direction: row;
		column-gap: 1rem;
		align-items: center;
		font-family: monospace;

		& button:first-of-type {
			margin-left: auto;
		}

		& .method {
			font-weight: bold;
			color: var(--turqoise);
			white-space: nowrap;
		}

		& .target {
			color: var(--blue);
			width: 40ch;
			white-space: nowrap;
			overflow-x: hidden;
			text-overflow: ellipsis;
		}
	}

	button {
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
