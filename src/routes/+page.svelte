<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Modals from '$lib/Modals.svelte';
	import MethodDropdown from '$lib/components/MethodDropdown.svelte';
	import {
		connectWebSocket,
		disconnectWebSocket,
		webhookMessages,
		connected
	} from '$lib/client/websocket';
	import { forwardWebhook } from '$lib/client/webhook-forwarder';
	import { createEndpoint, removeEndpoint } from './webhooks.remote';

	interface Props {
		data: {
			endpoints: Array<{
				id: string;
				url: string;
				target: string;
				method: string;
				createdAt: string;
			}>;
		};
	}

	let { data }: Props = $props();
	let endpoints = $state(data.endpoints);
	let newTarget = $state('http://localhost:3000/api/webhook');
	let newMethod = $state('POST');
	let loading = $state(false);

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

	$effect(() => {
		const messages = $webhookMessages;
		if (messages.length > 0) {
			const latest = messages[0];
			forwardWebhook(latest).catch((error) => {
				console.error('Failed to forward webhook:', error);
			});
		}
	});
</script>

<Modals />
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
					<button class="btn-secondary" onclick={() => handleDeleteEndpoint(endpoint.id)}
						>Delete</button
					>
				</li>
			{/each}
		</ul>
	</section>

	<section class="messages">
		<h2>Recent Webhooks ({$webhookMessages.length})</h2>
		<ul>
			{#each $webhookMessages as message (message)}
				<li>
					<div class="message-header">
						<span class="method">{message.method}</span>
						<code class="shortid">{message.endpointId}</code>
						<span class="target">→ {message.target}</span>
					</div>
					{#if message.body}
						<pre class="message-body">{message.body}</pre>
					{/if}
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

		& button:first-of-type {
			margin-left: auto;
		}

		& .method {
			font-weight: bold;
			color: var(--turqoise);
		}

		& .target {
			color: var(--blue);
		}
	}

	.message-header {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.message-body {
		background: var(--offwhite);
		padding: 0.5rem;
		border-radius: 4px;
		overflow-x: auto;
	}

	button {
		padding: 0.5rem 1rem;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
