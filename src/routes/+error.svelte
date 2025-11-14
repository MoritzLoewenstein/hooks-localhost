<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { form } = $props();

	let email = $state('');
</script>

<main>
	{#if page?.error?.code === 'unauthorized' || form?.code === 'unauthorized_validation'}
		<h1>login</h1>
		<form method="POST" action="?/login" use:enhance>
			<label>
				email
				<input
					name="email"
					type="email"
					placeholder="max.mustermann@example.org"
					autocomplete="email"
					required
					bind:value={email}
				/>
			</label>
			<label>
				password
				<input
					name="password"
					type="password"
					placeholder="********"
					autocomplete="current-password"
					required
				/>
			</label>
			{#if form?.code === 'unauthorized_validation'}
				<p class="notice-validation">{form.message}</p>
			{/if}
			<button>Log in</button>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve cant use here because of search param -->
			<a href="/?recovery_code=">forgot password?</a>
		</form>
	{:else if page?.error?.code === 'register' || form?.code === 'register_validation'}
		<h1>register</h1>
		<form method="POST" action="?/register" use:enhance>
			<label>
				email
				<input
					name="email"
					type="email"
					placeholder="max.mustermann@example.org"
					autocomplete="email"
					required
					bind:value={email}
				/>
			</label>
			<label>
				password
				<input
					name="password"
					type="password"
					placeholder="********"
					autocomplete="new-password"
					required
				/>
			</label>
			{#if form?.code === 'register_validation'}
				<p class="notice-validation">{form.message}</p>
			{/if}
			<button>register</button>
		</form>
	{:else if page?.error?.code === 'recovery_code' || form?.code === 'recovery_code_validation'}
		<h1>account recovery</h1>
		<form method="POST" action="?/recovery_code" use:enhance>
			<label>
				email
				<input
					name="email"
					type="email"
					placeholder="max.mustermann@example.org"
					autocomplete="email"
					required
					bind:value={email}
				/>
			</label>
			<label>
				recovery code
				<input
					name="recovery_code"
					type="password"
					placeholder="1abDUTxxBeteGs9qcBy2CX"
					autocomplete="off"
					required
				/>
			</label>
			<label>
				new password
				<input
					name="password"
					type="password"
					placeholder="********"
					autocomplete="new-password"
					required
				/>
			</label>
			{#if form?.code === 'recovery_code_validation'}
				<p class="notice-validation">{form.message}</p>
			{/if}
			<button>recover account</button>
			<a href={resolve('/')}>login</a>
		</form>
	{:else if page?.error?.code === 'invite_token' || page?.error?.code === 'invite_token_validation' || form?.code === 'invite_token_validation'}
		<h1>register (invited)</h1>
		<form method="POST" action="?/register_invite" use:enhance>
			<label>
				invite token
				<input
					name="invite_token"
					type="text"
					required
					readonly
					value={page.error?.invite_token ?? ''}
				/>
			</label>
			<label>
				email
				<input name="email" type="email" required readonly value={page.error?.email ?? ''} />
			</label>
			<label>
				password
				<input
					name="password"
					type="password"
					placeholder="********"
					autocomplete="new-password"
					required
				/>
			</label>
			{#if page?.error?.code === 'invite_token_validation'}
				<p class="notice-validation">{page.error.message}</p>
			{:else if form?.code === 'invite_token_validation'}
				<p class="notice-validation">{form.message}</p>
			{/if}
			<button>register</button>
		</form>
	{:else}
		<h1>Error</h1>
		<p>{page.error?.message || form?.message || 'Something went wrong'}</p>
	{/if}
</main>

<style>
	main {
		margin: 0 var(--side-padding);
	}
	form {
		display: grid;
		gap: 1em;
		max-width: 500px;
	}
	label {
		display: grid;
		gap: 0.5em;
	}
	button {
		padding: 0.5em;
	}

	p.notice-validation {
		border: 2px solid var(--orange);
		width: max-content;
		padding: 0.25rem 0.5rem;
		background: var(--orange);
	}
</style>
