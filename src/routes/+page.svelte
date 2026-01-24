<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Modals from '$lib/Modals.svelte';
	import MethodDropdown from '$lib/components/MethodDropdown.svelte';
	import { connectWebSocket, disconnectWebSocket, connected } from '$lib/client/websocket';
	import { webhookMessages } from '$lib/client/webhookMessage.svelte';
	import { forwardWebhook } from '$lib/client/webhook-forwarder';
	import { createEndpoint, removeEndpoint } from './webhooks.remote';
	import { browser, dev } from '$app/environment';
	import WebhookEditModal from '$lib/WebhookEditModal.svelte';
	import type { Endpoint, WebhookMessage } from '../lib/shared/types.js';

	interface Props {
		data: {
			endpoints: Endpoint[];
		};
	}

	let { data }: Props = $props();
	let endpoints = $state(data.endpoints);
	let newTarget = $state('http://localhost:3000/api/webhook');
	let newMethod = $state('POST');
	let loading = $state(false);
	let webhookEditModal: WebhookEditModal;

	onMount(() => {
		connectWebSocket();
	});

	onDestroy(() => {
		disconnectWebSocket();
	});

	async function handleCreateEndpoint() {
		loading = true;
		try {
			const newEndpoint = await createEndpoint({ target: newTarget, method: newMethod });
			endpoints = [newEndpoint, ...endpoints];
			newTarget = 'http://localhost:3000/api/webhook';
			newMethod = 'POST';
		} catch (error) {
			console.error('Failed to create endpoint:', error);
		} finally {
			loading = false;
		}
	}

	async function handleDeleteEndpoint(id: string) {
		try {
			await removeEndpoint(id);
			endpoints = endpoints.filter((e) => e.id !== id);
		} catch (error) {
			console.error('Failed to delete endpoint:', error);
		}
	}

	function copyWebhookUrl(url: string) {
		navigator.clipboard.writeText(url);
	}

	async function handleReplay(message: WebhookMessage) {
		const status = await forwardWebhook(message);
		webhookMessages.state.unshift({
			...message,
			status,
			timestamp: Date.now()
		});
	}

	function formatRelativeTime(timestamp: number): string {
		const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
		const now = Date.now();
		const diffMs = timestamp - now;

		const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
		const dayLabel = rtf.format(diffDays, 'day');
		const time = new Date(timestamp).toLocaleTimeString();

		return `${dayLabel} ${time}`;
	}

	function handleGenerateRandomWebhook() {
		if (endpoints.length === 0) return;

		const statuses = [200, 201, 204, 400, 404, 500];
		const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
		const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

		const randomMessage = {
			method: randomEndpoint.method,
			endpointId: randomEndpoint.id,
			target: randomEndpoint.target,
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ test: 'data' }),
			status: randomStatus,
			timestamp: Date.now()
		};

		webhookMessages.state.unshift(randomMessage);
	}

	$effect(() => {
		if (webhookMessages.state.length > 0) {
			const latest = webhookMessages.state[0];
			if (latest.status === undefined) {
				forwardWebhook(latest).then((status) => {
					const latestIndex = webhookMessages.state.findIndex((message) => message === latest);
					if (latestIndex !== -1) {
						webhookMessages.state[latestIndex] = { ...latest, status };
					}
				});
			}
		}
	});
</script>

<Modals />
<WebhookEditModal
	bind:this={webhookEditModal}
	onwebhookUpdated={(updatedEndpoint) => {
		const endpointIndex = endpoints.findIndex((endpoint) => endpoint.id === updatedEndpoint.id);
		if (endpointIndex !== -1) {
			endpoints[endpointIndex] = updatedEndpoint;
		}
	}}
/>
<main>
	<div>
		<h1>Webhook Relay</h1>
		<p>{$connected ? '🟢 connected' : '🔴 disconnected'}</p>
	</div>

	<section class="endpoints">
		<h2>Your Webhook Endpoints</h2>

		<div class="create-form">
			<input type="text" bind:value={newTarget} placeholder="http://localhost:3000/api/webhook" />
			<MethodDropdown bind:value={newMethod} onchange={(val) => (newMethod = val)} />
			<button onclick={handleCreateEndpoint} disabled={loading}>Create Endpoint</button>
		</div>

		<ul class="endpoint-list">
			{#each endpoints as endpoint (endpoint.id)}
				<li>
					<span>{endpoint.url}</span>
					<span class="method">{endpoint.method}</span>
					<span class="target">→ {endpoint.target}</span>
					<button class="btn-secondary" onclick={() => copyWebhookUrl(endpoint.url)}
						>Copy URL</button
					>
					<button class="btn-secondary" onclick={() => webhookEditModal.openModal(endpoint)}
						>Edit</button
					>
					<button class="btn-secondary" onclick={() => handleDeleteEndpoint(endpoint.id)}
						>Delete</button
					>
				</li>
			{/each}
		</ul>
	</section>

	<section class="messages">
		<div class="messages-header">
			<h2>Recent Webhooks ({webhookMessages.state.length})</h2>
			<div class="button-group">
				{#if dev}
					<button class="btn-secondary" onclick={handleGenerateRandomWebhook}>
						Generate Random (dev)
					</button>
				{/if}
				<button
					class="btn-secondary"
					onclick={() => webhookMessages.clear()}
					disabled={webhookMessages.state.length === 0}
				>
					Clear
				</button>
			</div>
		</div>
		<p class="devtools-hint">
			You can also use browser devtools (Network tab) to resend/edit each request locally.<br />If
			you see failed requests, make sure your dev server allows requests from {browser
				? window.location.hostname
				: 'this domain'} (CORS).
		</p>
		<ul>
			{#each webhookMessages.state as message (message)}
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
						<span class="timestamp">
							{formatRelativeTime(message.timestamp)}
						</span>
					{/if}
					<button class="btn-secondary replay-btn" onclick={() => handleReplay(message)}>
						↻ Replay
					</button>
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		font-family: sans-serif;
		color: var(--blue);

		& div {
			display: flex;
			flex-direction: row;
			column-gap: 1rem;
			align-items: center;
		}
	}

	section {
		margin-bottom: 3rem;
	}

	.create-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.create-form input {
		flex: 1;
		padding: 0.5rem;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		list-style-type: none;
		padding: 0;
	}

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

		& .timestamp {
			width: 28ch;
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

	.messages-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
	}

	.devtools-hint {
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}
</style>
