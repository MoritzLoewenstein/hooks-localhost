<script lang="ts">
	import { page } from '$app/state';
	import { view, VIEW } from './client/view.svelte.js';
	import { invalidateAll } from '$app/navigation';
	import CloseIcon from './icons/CloseIcon.svelte';
	import UserInviteSection from './UserInviteSection.svelte';
	import RecoveryCodeSection from './RecoveryCodeSection.svelte';
	import DatabaseBackupSection from './DatabaseBackupSection.svelte';

	let dialog: HTMLDialogElement;
	$effect(() => {
		if (view.value === VIEW.SETTINGS) {
			dialog.showModal();
		} else {
			// reset page.form to prevent showing recovery codes again
			invalidateAll().then(() => {
				dialog.close();
			});
		}
	});

	const recoveryCodes = $derived(page.form?.recovery_codes || []);
	const recoveryCodeCount = $derived(
		page.form?.recovery_code_count || page.data.recovery_code_count || 0
	);
</script>

<dialog bind:this={dialog} onclose={() => view.set(VIEW.LANDING)}>
	<div class="wrapper">
		<button class="close" title="close settings" onclick={() => view.set(VIEW.LANDING)}>
			<CloseIcon />
		</button>
		<h1>settings</h1>
		<label
			>email (readonly)
			<input type="text" readonly value={page.data.user.email} disabled />
		</label>
		<label
			>role (readonly)
			<input type="text" readonly value={page.data.user.is_admin ? 'admin' : 'user'} disabled />
		</label>
		<RecoveryCodeSection
			recovery_codes={recoveryCodes}
			recovery_code_count={recoveryCodeCount}
			with_creation={true}
		/>
		{#if page.data.user.is_admin}
			<UserInviteSection />
			<DatabaseBackupSection />
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
</style>
