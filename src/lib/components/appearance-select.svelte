<script lang="ts">
	import { onMount } from 'svelte';
	import { ComputerIcon, Sun03Icon, Moon02Icon, ContrastIcon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';

	const choices = [
		{ value: 'system', label: 'System', icon: ComputerIcon },
		{ value: 'light', label: 'Light', icon: Sun03Icon },
		{ value: 'dark', label: 'Dark', icon: Moon02Icon }
	];
	let hydrated = $state(false);
	const preference = $derived(hydrated ? userPrefersMode.current : 'system');
	onMount(() => {
		hydrated = true;
	});
</script>

<Select.Root
	type="single"
	items={choices}
	value={preference}
	onValueChange={(value) => {
		if (value === 'system' || value === 'light' || value === 'dark') setMode(value);
	}}
	disabled={!hydrated}
>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Select.Trigger
					{...props}
					aria-label="Appearance"
					class="size-11 min-h-11 justify-center [&>svg:last-child]:hidden"
				>
					<HugeiconsIcon icon={ContrastIcon} aria-hidden="true" />
					<Select.Value class="sr-only" />
				</Select.Trigger>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content role="tooltip" side="bottom">Appearance</Tooltip.Content>
	</Tooltip.Root>
	<Select.Content align="end">
		<Select.Group>
			<Select.GroupHeading>Appearance</Select.GroupHeading>
			{#each choices as choice (choice.value)}
				<Select.Item value={choice.value} label={choice.label} class="min-h-11">
					<HugeiconsIcon icon={choice.icon} aria-hidden="true" />
					{choice.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
