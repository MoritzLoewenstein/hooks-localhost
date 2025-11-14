<script lang="ts">
	import CloseIcon from './icons/CloseIcon.svelte';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	let {
		title,
		type = 'success',
		show
	}: {
		title: string;
		type?: 'success' | 'error';
		show: boolean;
	} = $props();

	let dismissed = $state(false);
</script>

{#if show && !dismissed}
	<p
		class="success"
		class:success={type === 'success' || !type}
		class:error={type === 'error'}
		transition:slide={{ easing: cubicOut }}
	>
		<span>{title}</span><button
			class="btn-small btn-icon btn-secondary"
			onclick={() => (dismissed = true)}><CloseIcon /></button
		>
	</p>
{/if}

<style>
	p {
		display: flex;
		flex-direction: row;
		column-gap: 1rem;
		align-items: center;
		font-size: 14px;
		width: max-content;
		padding: 0.25rem 0.5rem;

		&.success {
			background: var(--green);
			border: 2px solid var(--green);
		}

		&.error {
			background: var(--orange);
			border: 2px solid var(--orange);
		}
	}
</style>
