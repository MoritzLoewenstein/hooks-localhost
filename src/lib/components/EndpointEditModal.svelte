<script lang="ts">
	import { view, VIEW } from '../client/view.svelte.js';
	import CloseIcon from '../icons/CloseIcon.svelte';
	import { updateEndpoint } from '../../routes/webhooks.remote.js';
	import type { Endpoint } from '../shared/types.js';
	import { HTTP_METHODS } from '../constants';

	let { onendpointUpdated = () => {} } = $props<{
		onendpointUpdated?: (endpoint: Endpoint) => void;
	}>();

	let dialog: HTMLDialogElement;
	let loading = $state(false);
	let editTarget = $state('');
	let editMethod = $state('');
	let currentEndpoint = $state<Endpoint | null>(null);

	$effect(() => {
		if (view.value === VIEW.EDIT_WEBHOOK) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	export function openModal(endpoint: Endpoint) {
		currentEndpoint = endpoint;
		editTarget = endpoint.target;
		editMethod = endpoint.method;
		view.set(VIEW.EDIT_WEBHOOK);
	}

	function closeModal() {
		view.set(VIEW.LANDING);
		currentEndpoint = null;
		editTarget = '';
		editMethod = '';
	}

	async function handleSave() {
		if (!currentEndpoint) return;
		loading = true;
		try {
			const updated = await updateEndpoint({
				id: currentEndpoint.id,
				target: editTarget,
				method: editMethod
			});
			onendpointUpdated(updated);
			closeModal();
		} catch (error) {
			console.error('Failed to update endpoint:', error);
		} finally {
			loading = false;
		}
	}
</script>

<dialog bind:this={dialog} onclose={closeModal}>
	<div class="wrapper">
		<button class="close" title="close webhook editor" onclick={closeModal}>
			<CloseIcon />
		</button>
		<h1>webhook edit</h1>
		{#if currentEndpoint}
			<label>
				target url
				<input
					type="text"
					bind:value={editTarget}
					placeholder="http://localhost:3000/api/webhook"
				/>
			</label>
			<div class="method-label">
				<p>http method</p>
				<div class="method-buttons">
					{#each HTTP_METHODS as method (method)}
						{#if method !== editMethod}
							<button type="button" class="btn-secondary" onclick={() => (editMethod = method)}>
								{method}
							</button>
						{:else}
							<p class="btn">{editMethod}</p>
						{/if}
					{/each}
				</div>
			</div>
			<div class="modal-buttons">
				<button onclick={handleSave} disabled={loading}>Save</button>
				<button class="btn-secondary" onclick={closeModal}>Cancel</button>
			</div>
		{/if}
	</div>
</dialog>

<style>
	dialog .wrapper {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
		position: relative;
	}

	button.close {
		position: absolute;
		top: 0;
		right: 0;
		line-height: 0;
	}

	h1 {
		margin: 0;
	}

	label {
		display: flex;
		flex-direction: column;
		font-size: 14px;
	}

	.method-label {
		display: flex;
		flex-direction: column;
		font-size: 14px;
	}

	.method-buttons {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.method-buttons p.btn,
	button {
		box-sizing: border-box;
		font-size: 14px;
	}
</style>
