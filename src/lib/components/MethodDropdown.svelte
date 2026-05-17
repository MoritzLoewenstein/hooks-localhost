<script lang="ts">
	import { HTTP_METHODS, type HttpMethod } from '../constants';

	interface Props {
		value: HttpMethod[];
		onchange: (value: HttpMethod[]) => void;
	}

	let { value = $bindable(), onchange }: Props = $props();

	let isOpen = $state(false);

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function toggleMethod(method: HttpMethod) {
		if (value.includes(method)) {
			value = value.filter((m) => m !== method);
		} else {
			value = [...value, method];
		}
		onchange(value);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown')) {
			isOpen = false;
		}
	}

	let triggerLabel = $derived.by(() => {
		if (value.length === 0) return 'Select methods';
		if (value.length === HTTP_METHODS.length) return 'All methods';
		return value.join(', ');
	});
</script>

<svelte:window onclick={handleClickOutside} />

<div class="dropdown">
	<button type="button" class="dropdown-trigger" onclick={toggleDropdown}>
		<span class="label">{triggerLabel}</span>
		<span class="arrow" class:open={isOpen}>▼</span>
	</button>

	{#if isOpen}
		<ul class="dropdown-menu">
			{#each HTTP_METHODS as method (method)}
				{@const selected = value.includes(method)}
				<li>
					<button
						type="button"
						class="dropdown-item"
						class:selected
						onclick={() => toggleMethod(method)}
					>
						<input
							type="checkbox"
							checked={selected}
							tabindex="-1"
							onclick={(event) => event.preventDefault()}
						/>
						{method}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.dropdown {
		position: relative;
		display: inline-block;
	}

	.dropdown-trigger {
		font-family: 'Courier New', Courier, monospace;
		font-weight: 700;
		color: var(--blue);
		background-color: var(--offwhite);
		border: 1px solid var(--blue);
		padding: 0.5rem 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 160px;
		justify-content: space-between;
		transition: var(--color-transition);
	}

	.dropdown-trigger:hover {
		background-color: var(--blue);
		color: var(--offwhite);
	}

	.label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.arrow {
		font-size: 0.7em;
		transition: transform 0.2s ease-out;
	}

	.arrow.open {
		transform: rotate(180deg);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 2px);
		left: 0;
		right: 0;
		background-color: var(--offwhite);
		border: 1px solid var(--blue);
		list-style: none;
		padding: 0;
		margin: 0;
		z-index: 1000;
		box-shadow: 0 2px 8px rgba(27, 37, 96, 0.15);
	}

	.dropdown-item {
		font-family: 'Courier New', Courier, monospace;
		font-weight: 700;
		color: var(--blue);
		background-color: transparent;
		border: none;
		padding: 0.5rem 1rem;
		width: 100%;
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: var(--color-transition);
	}

	.dropdown-item:hover {
		background-color: var(--turqoise);
		color: var(--offwhite);
	}

	.dropdown-item.selected {
		background-color: var(--blue);
		color: var(--offwhite);
	}

	.dropdown-item input[type='checkbox'] {
		pointer-events: none;
		accent-color: var(--blue);
	}
</style>
