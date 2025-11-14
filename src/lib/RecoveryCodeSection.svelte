<script lang="ts">
	import CopyIcon from './icons/CopyIcon.svelte';
	import RefreshIcon from './icons/RefreshIcon.svelte';
	import SaveIcon from './icons/SaveIcon.svelte';
	import { enhance } from '$app/forms';
	import { PUBLIC_APP_NAMESPACE } from '$env/static/public';
	import { page } from '$app/state';
	import HttpStatusCode from './shared/HttpStatusCode';

	const { recovery_codes, recovery_code_count, with_creation = false } = $props();
</script>

<section class="recovery-codes">
	<h3>recovery codes</h3>
	<p>
		Recovery codes are used to recovery your account in case you lose your access. Save these codes
		in a safe place.<br />Each code can only be used once.
	</p>
	<p>You have {recovery_code_count} account recovery codes left.</p>
	{#if with_creation && (page.form === null || (page.status !== HttpStatusCode.OK && page.form.code === 'recovery_codes_validation'))}
		<form action="?/recovery_codes" method="post" use:enhance>
			{#if page.status != HttpStatusCode.OK}
				<p class="notice-validation">{page.form.message}</p>
			{/if}
			<label>
				password
				<input
					type="password"
					placeholder="********"
					name="password"
					autocomplete="current-password"
					required
				/>
			</label>
			<button type="submit">
				<span>regenerate recovery codes</span>
				<RefreshIcon />
			</button>
		</form>
	{:else if recovery_codes.length > 0}
		<p class="recovery-code-text">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html recovery_codes.join('<br>')}
			<button
				title="copy recovery codes"
				class="recover-code-copy"
				onclick={() => navigator.clipboard.writeText(recovery_codes.join('\n'))}
				><CopyIcon />
			</button>
			<button
				title="download recovery codes"
				class="recovery-code-download"
				onclick={() => {
					const blob = new Blob([recovery_codes.join('\n')], { type: 'text/plain' });
					const url = URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = `${PUBLIC_APP_NAMESPACE}-recovery-codes.txt`;
					a.click();
					URL.revokeObjectURL(url);
				}}
			>
				<SaveIcon />
			</button>
		</p>
	{/if}
</section>

<style>
	.recovery-code-text {
		font-family: monospace;
		letter-spacing: 0.2rem;
		position: relative;
		line-height: 1.5rem;
	}

	.recover-code-copy {
		position: absolute;
		top: 0;
		right: 0;
	}

	.recovery-code-download {
		position: absolute;
		top: calc(1rem + 46px);
		right: 0;
	}

	.recovery-codes p + form {
		margin-top: 0.5rem;
	}

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

	label {
		display: flex;
		flex-direction: column;
		font-size: 14px;
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
