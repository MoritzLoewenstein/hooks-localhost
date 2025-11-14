<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import AddIcon from './icons/AddIcon.svelte';
	import CopyIcon from './icons/CopyIcon.svelte';
	import HttpStatusCode from './shared/HttpStatusCode';

	const openInvites = $derived(page.form?.user_invites || page.data.user_invites || []);
</script>

<section class="user-invites">
	<h3>open user invites</h3>
	{#if openInvites.length > 0}
		<table>
			<thead>
				<tr>
					<th class="email heading">email</th>
					<th class="link heading">link</th>
				</tr>
			</thead>
			<tbody>
				{#each openInvites as invite (invite.email)}
					<tr>
						<td class="email"><a href="mailto:{invite.email}">{invite.email}</a></td>
						<td class="link">
							<button
								onclick={async () => {
									await navigator.clipboard.writeText(invite.link);
								}}
								title="copy invite link of {invite.email}"
							>
								<CopyIcon />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>no open invites</p>
	{/if}
</section>
<section class="user-invites-create">
	<h3>create invite link</h3>
	<p>
		Invitations will expire after 14 days. Invited users only see their own dashboard. You will need
		to send the created invite link to your friend, Zentara will not send any emails.
	</p>
	<form action="?/invite" method="post" use:enhance>
		{#if page.status != HttpStatusCode.OK && page.form.code === 'invite_validation'}
			<p class="notice-validation">{page.form.message}</p>
		{/if}
		<label>
			email
			<input
				type="email"
				name="email"
				placeholder="alexius@example.org"
				autocomplete="email"
				required
			/>
		</label>
		<button type="submit">
			<span>create invite</span>
			<AddIcon />
		</button>
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

	table .email {
		width: auto;
	}

	table .link {
		/* hardcoded button width */
		width: 58px;
	}

	table .email a {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		max-width: 100%;
		display: inline-block;
	}
</style>
