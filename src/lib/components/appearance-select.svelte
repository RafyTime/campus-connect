<script lang="ts">
	import { onMount } from 'svelte';
	import { ComputerIcon, Sun03Icon, Moon02Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import * as Select from '#lib/components/ui/select/index.js';

	const choices = [
		{ value: 'system', label: 'System', icon: ComputerIcon },
		{ value: 'light', label: 'Light', icon: Sun03Icon },
		{ value: 'dark', label: 'Dark', icon: Moon02Icon }
	];
	let hydrated = $state(false);
	const preference = $derived(hydrated ? userPrefersMode.current : 'system');
	const selected = $derived(choices.find((choice) => choice.value === preference) ?? choices[0]);
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
	<Select.Trigger
		aria-label="Appearance"
		class="size-11 justify-center md:w-32 md:justify-between [&>svg:last-child]:hidden md:[&>svg:last-child]:block"
	>
		{#key preference}
			<HugeiconsIcon icon={selected.icon} aria-hidden="true" />
		{/key}
		<Select.Value class="sr-only md:not-sr-only" />
	</Select.Trigger>
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
