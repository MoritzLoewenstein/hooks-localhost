<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { view, VIEW } from './client/view.svelte.js';
	import LogoutIcon from './icons/LogoutIcon.svelte';
	import SettingsIcon from './icons/SettingsIcon.svelte';
	import { resolve } from '$app/paths';

	let date = $state(new Date());
	onMount(() => {
		const interval = setInterval(() => {
			date = new Date();
		}, 1000);

		return () => clearInterval(interval);
	});

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'full',
		timeStyle: 'medium',
		timeZone: 'Europe/Berlin'
	});
	const formattedDate = $derived.by(() => dateFormatter.format(date));
</script>

<hr />
<div>
	<p>{formattedDate}</p>
	{#if page.data.user}
		<button
			onclick={() => view.set(VIEW.SETTINGS)}
			title="settings"
			class="settings"
			class:active={view.value === VIEW.SETTINGS}
		>
			<SettingsIcon />
		</button>
		<a href={resolve('/logout')} title="logout" class="logout">
			<LogoutIcon />
		</a>
	{/if}
</div>

<style>
	hr {
		margin: 1rem var(--side-padding);
	}

	div {
		padding: 0 var(--side-padding);
		display: flex;
		flex-direction: row;
		column-gap: 1rem;
		height: 2.5rem;
		box-sizing: border-box;
	}

	div button:first-of-type {
		margin-left: auto;
	}

	div button,
	div a {
		padding: 0.25rem;
		height: calc(24px + 0.5rem);
		width: calc(24px + 0.5rem);
		box-sizing: border-box;
		color: var(--blue);
		background-color: var(--offwhite);
		border: 1px solid var(--offwhite);
		background-color: none !important;
		transition: var(--color-transition);
	}

	div button:hover,
	div button.active,
	div a:hover {
		color: var(--offwhite);
		background-color: var(--blue);
		border: 1px solid var(--blue);
		background-color: none !important;
	}
</style>
