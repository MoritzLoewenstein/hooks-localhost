<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Modals from '$lib/Modals.svelte';
	import MethodDropdown from '$lib/components/MethodDropdown.svelte';
	import EndpointList from '$lib/components/EndpointList.svelte';
	import WebhookMessageList from '$lib/components/WebhookMessageList.svelte';
	import { connectWebSocket, disconnectWebSocket, connected } from '$lib/client/websocket';
	import { webhookMessages } from '$lib/client/webhookMessage.svelte';
	import { forwardWebhook } from '$lib/client/webhook-forwarder';
	import { createEndpoint, removeEndpoint } from './webhooks.remote';
	import { browser, dev } from '$app/environment';
	import EndpointEditModal from '$lib/components/EndpointEditModal.svelte';
	import type { Endpoint } from '../lib/shared/types.js';
	import type { HttpMethod } from '$lib/constants';
	import { ulid } from 'ulid';

	interface Props {
		data: {
			endpoints: Endpoint[];
		};
	}

	let { data }: Props = $props();
	let endpoints = $state(data.endpoints);
	let newTarget = $state('http://localhost:3000/api/webhook');
	let newMethods = $state<HttpMethod[]>(['POST']);
	let loading = $state(false);
	let endpointEditModal: EndpointEditModal;

	onMount(() => {
		connectWebSocket();
	});

	onDestroy(() => {
		disconnectWebSocket();
	});

	async function handleCreateEndpoint() {
		loading = true;
		try {
			const newEndpoint = await createEndpoint({ target: newTarget, methods: newMethods });
			endpoints = [newEndpoint, ...endpoints];
			newTarget = 'http://localhost:3000/api/webhook';
			newMethods = ['POST'];
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

	function handleGenerateRandomWebhook() {
		if (endpoints.length === 0) return;

		const statuses = [200, 201, 204, 400, 404, 500];
		const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
		const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
		const randomMethod =
			randomEndpoint.methods[Math.floor(Math.random() * randomEndpoint.methods.length)] ?? 'POST';

		webhookMessages.state.unshift({
			id: ulid(),
			method: randomMethod,
			endpointId: randomEndpoint.id,
			target: randomEndpoint.target,
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ test: 'data' }),
			status: randomStatus,
			timestamp: Date.now()
		});
	}

	$effect(() => {
		if (webhookMessages.state.length > 0) {
			const latest = webhookMessages.state[0];
			if (latest.status === undefined) {
				forwardWebhook(latest).then((status) => {
					const latestIndex = webhookMessages.state.findIndex((message) => message === latest);
					if (latestIndex !== -1) {
						webhookMessages.state[latestIndex].status = status;
					}
				});
			}
		}
	});
</script>

<Modals />
<EndpointEditModal
	bind:this={endpointEditModal}
	onendpointUpdated={(updatedEndpoint) => {
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
			<MethodDropdown bind:value={newMethods} onchange={(val) => (newMethods = val)} />
			<button onclick={handleCreateEndpoint} disabled={loading}>Create Endpoint</button>
		</div>

		<EndpointList
			{endpoints}
			onEdit={(endpoint) => endpointEditModal.openModal(endpoint)}
			onDelete={handleDeleteEndpoint}
		/>
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
		<WebhookMessageList />
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
