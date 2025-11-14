<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toast } from './client/toast.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';
</script>

<div class="toasts">
	{#each toast.value as { id, message } (id)}
		<div class="toast" transition:fade>
			<p>{message}</p>
			<button class="dismiss" on:click={() => toast.remove(id)}>
				<CloseIcon />
			</button>
		</div>
	{/each}
</div>

<style>
	.toasts {
		position: fixed;
		right: var(--side-padding);
		top: 2rem;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
	}

	.toast {
		padding: 0.5rem 1rem;
		border: 2px solid var(--blue);
		background-color: var(--offwhite);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 3px 10px var(--blue);
	}

	button.dismiss {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--blue);
		padding: 0;
	}
</style>
