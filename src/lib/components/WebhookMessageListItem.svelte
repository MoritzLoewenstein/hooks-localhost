<script lang="ts">
	import type { WebhookMessage } from '../shared/types';
	import { formatRelativeDays, formatTime } from '$lib/shared/formatters';

	interface Props {
		message: WebhookMessage;
		onReplay: (message: WebhookMessage) => void;
	}

	let { message, onReplay }: Props = $props();

	let formattedRelativeDays = $state(
		message.timestamp ? formatRelativeDays(message.timestamp) : null
	);

	export function dayChanged() {
		if (message.timestamp) {
			formattedRelativeDays = formatRelativeDays(message.timestamp);
		}
	}
</script>

<li>
	<span class="method">{message.method}</span>
	<code class="shortid">{message.endpointId}</code>
	<span class="target">→ {message.target}</span>
	{#if message.status !== undefined}
		<span
			class="status"
			class:error={message.status !== null && message.status >= 400}
			class:exception={message.status === null}
		>
			{message.status !== null ? message.status : 'err'}
		</span>
	{/if}
	{#if message.headers['content-type']}
		<span class="content-type">[{message.headers['content-type']}]</span>
	{/if}
	{#if message.timestamp}
		<span class="timestamp">{formattedRelativeDays} {formatTime(message.timestamp)}</span>
	{/if}
	<button class="btn-secondary replay-btn" onclick={() => onReplay(message)}>↻ Replay</button>
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
			width: 4.5ch;
		}

		& .target {
			color: var(--blue);
			width: 40ch;
			white-space: nowrap;
			overflow-x: hidden;
			text-overflow: ellipsis;
		}

		& .timestamp {
			width: 28ch;
		}

		& .status {
			padding: 0.25rem 0.5rem;
			font-weight: bold;
			background: var(--green);
			color: white;
			font-size: 0.9rem;
		}

		& .status.exception {
			background: var(--turqoise);
		}

		& .status.error {
			background: var(--orange);
		}

		& .content-type {
			width: 22ch;
		}

		& .replay-btn {
			margin-left: auto;
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
