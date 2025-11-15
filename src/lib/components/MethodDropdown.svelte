<script lang="ts">
	interface Props {
		value: string;
		onchange: (value: string) => void;
	}

	let { value = $bindable(), onchange }: Props = $props();

	const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
	let isOpen = $state(false);

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function selectMethod(method: string) {
		value = method;
		isOpen = false;
		onchange(method);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown')) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="dropdown">
	<button type="button" class="dropdown-trigger" onclick={toggleDropdown}>
		{value}
		<span class="arrow" class:open={isOpen}>▼</span>
	</button>

	{#if isOpen}
		<ul class="dropdown-menu">
			{#each methods as method (method)}
				<li>
					<button
						type="button"
						class="dropdown-item"
						class:selected={method === value}
						onclick={() => selectMethod(method)}
					>
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
		min-width: 120px;
		justify-content: space-between;
		transition: var(--color-transition);
	}

	.dropdown-trigger:hover {
		background-color: var(--blue);
		color: var(--offwhite);
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
</style>
