<script lang="ts">
	import { page } from '$app/state';
	import { view, VIEW } from './client/view.svelte.js';
	import CloseIcon from './icons/CloseIcon.svelte';
	import { onMount } from 'svelte';
	import UserInviteSection from './UserInviteSection.svelte';
	import RecoveryCodeSection from './RecoveryCodeSection.svelte';

	let dialog: HTMLDialogElement;
	$effect(() => {
		if (view.value === VIEW.INTRO) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});
	onMount(() => {
		if (page.data.first_login) {
			view.set(VIEW.INTRO);
		}
	});
</script>

<dialog bind:this={dialog} onclose={() => view.set(VIEW.LANDING)}>
	<div class="wrapper">
		<button class="close" title="close intro" onclick={() => view.set(VIEW.LANDING)}>
			<CloseIcon />
		</button>
		<h1>intro</h1>
		<RecoveryCodeSection
			recovery_codes={page.data.recovery_codes}
			recovery_code_count={page.data.recovery_code_count}
		/>
		{#if page.data.user.is_admin}
			<UserInviteSection />
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
</style>
