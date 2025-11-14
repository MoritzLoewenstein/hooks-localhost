<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { downloadB64 } from './client/download_b64';
	import SaveIcon from './icons/SaveIcon.svelte';
	import HttpStatusCode from './shared/HttpStatusCode';

	const dbBackup = $derived(page.form?.db_backup ?? null);
	$effect(() => {
		if (dbBackup) {
			downloadB64(
				'application/octet-stream',
				`zentara_backup_${new Date().toISOString()}.db`,
				dbBackup
			);
		}
	});
</script>

<section>
	<h3>create database backup</h3>
	<p>
		Download the current database backup. This will create a file with the state of your Zentara
		database. The file can be used to restore your data in case of data loss or migration to a new
		server.
	</p>
	<form action="?/db_backup" method="post" use:enhance>
		{#if page.status != HttpStatusCode.OK && page.form.code === 'db_backup_validation'}
			<p class="notice-validation">{page.form.message}</p>
		{/if}
		<button type="submit"><span>download backup</span><SaveIcon /></button>
	</form>
</section>

<style>
	p {
		font-size: 14px;
	}

	p.notice-validation {
		border: 2px solid var(--orange);
		width: max-content;
		padding: 0.25rem 0.5rem;
		background: var(--orange);
	}

	h3 {
		margin-top: 1rem;
		margin-bottom: 0.25rem;
	}

	section {
		display: flex;
		flex-direction: column;
		row-gap: 0.5rem;
	}

	form {
		display: flex;
		flex-direction: column;
		row-gap: 0.5rem;
	}

	form button {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: max-content;
		column-gap: 1rem;
	}
</style>
