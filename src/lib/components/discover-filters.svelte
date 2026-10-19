<script lang="ts">
	import { ArrowDown01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Accordion, ToggleGroup } from 'bits-ui';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as NativeSelect from '#lib/components/ui/native-select/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import {
		discoveryDatePresets,
		discoveryResponseModes,
		type DiscoveryFilterKey
	} from '#lib/event-filter-options.js';
	import { responseModeLabel } from '#lib/event-labels.js';
	import type { listPublicEvents } from '#lib/events.remote.js';

	let {
		result,
		hydrated,
		loading,
		onfilter,
		onclear
	}: {
		result: Awaited<ReturnType<typeof listPublicEvents>>;
		hydrated: boolean;
		loading: boolean;
		onfilter: (key: DiscoveryFilterKey, value: string, selected?: boolean) => unknown;
		onclear: () => unknown;
	} = $props();

	const filters = $derived(result.filters);
	let selectedModes = $derived(filters.responseModes);
	const dateChoices = [...discoveryDatePresets, { value: 'custom', label: 'Choose a date' }];
	const responseModes = discoveryResponseModes.map((value) => ({
		value,
		label: responseModeLabel(value)
	}));
	// Choosing a custom date opens the input without changing the URL until a date is entered.
	let dateSelection = $derived(
		discoveryDatePresets.some((date) => date.value === filters.date) ? filters.date : 'custom'
	);
	const dateLabel = $derived(
		discoveryDatePresets.find((date) => date.value === filters.date)?.label ?? filters.date
	);
	const sections = $derived([
		{ key: 'date' as const, label: 'Date', summary: dateLabel },
		{
			key: 'mode' as const,
			label: 'Type',
			summary: filters.responseModes.map(responseModeLabel).join(', ') || 'All types'
		},
		{
			key: 'tags' as const,
			label: 'Tags',
			summary:
				result.options.tags
					.filter((tag) => filters.tagIds.includes(tag.id))
					.map((tag) => tag.name)
					.join(', ') || 'All Tags'
		},
		{
			key: 'host' as const,
			label: 'Host',
			summary:
				[
					result.options.groups.find((group) => group.id === filters.groupId)?.name,
					filters.hostType ? `${filters.hostType === 'group' ? 'Group' : 'Personal'} hosts` : ''
				]
					.filter(Boolean)
					.join(' · ') || 'All hosts'
		}
	]);
	const active = $derived([
		...result.options.tags
			.filter((tag) => filters.tagIds.includes(tag.id))
			.map((tag) => ({ key: 'tag' as const, value: tag.id, label: tag.name })),
		...(filters.date ? [{ key: 'date' as const, value: filters.date, label: dateLabel }] : []),
		...filters.responseModes.map((value) => ({
			key: 'type' as const,
			value,
			label: responseModeLabel(value)
		})),
		...result.options.groups
			.filter((group) => filters.groupId === group.id)
			.map((group) => ({ key: 'group' as const, value: group.id, label: group.name })),
		...(filters.hostType
			? [
					{
						key: 'host' as const,
						value: filters.hostType,
						label: filters.hostType === 'group' ? 'Group hosts' : 'Personal hosts'
					}
				]
			: [])
	]);

	function chooseDate(value: string) {
		dateSelection = value;
		if (value !== 'custom') void onfilter('date', value);
	}

	function chooseModes(values: string[]) {
		const added = values.find((value) => !selectedModes.some((mode) => mode === value));
		const removed = selectedModes.find((value) => !values.includes(value));
		selectedModes = discoveryResponseModes.filter((mode) => values.includes(mode));
		if (added) void onfilter('type', added);
		else if (removed) void onfilter('type', removed, false);
	}

	function clear() {
		dateSelection = '';
		selectedModes = [];
		void onclear();
	}
</script>

{#snippet fields(section: 'tags' | 'date' | 'host' | 'mode', scope: string)}
	<Field.Group>
		{#if section === 'tags'}
			<Field.Set>
				<Field.Legend class={scope.startsWith('mobile-') ? 'sr-only' : undefined}>Tags</Field.Legend
				>
				<Field.Description>Match any selected Tag.</Field.Description>
				<Field.Group class="grid grid-cols-2 gap-1">
					{#each result.options.tags as tag (tag.id)}
						<Field.Field orientation="horizontal">
							<Field.Label for={`${scope}-${tag.id}`} class="min-h-11 w-full">
								<Checkbox
									id={`${scope}-${tag.id}`}
									disabled={!hydrated}
									checked={filters.tagIds.includes(tag.id)}
									onCheckedChange={(checked) => onfilter('tag', tag.id, checked)}
								/>
								{tag.name}
							</Field.Label>
						</Field.Field>
					{/each}
				</Field.Group>
			</Field.Set>
		{/if}
		{#if section === 'date'}
			<Field.Set>
				<Field.Legend class={scope.startsWith('mobile-') ? 'sr-only' : undefined}>Date</Field.Legend
				>
				<ToggleGroup.Root
					type="single"
					value={dateSelection}
					onValueChange={chooseDate}
					aria-label="Date shortcuts"
					class="grid grid-cols-2 gap-2"
					disabled={!hydrated}
				>
					{#each dateChoices as date (date.value)}
						<ToggleGroup.Item
							value={date.value}
							class={buttonVariants({
								variant: dateSelection === date.value ? 'default' : 'outline',
								class: 'min-h-11'
							})}>{date.label}</ToggleGroup.Item
						>
					{/each}
				</ToggleGroup.Root>
				{#if dateSelection === 'custom'}
					<Field.Field>
						<Field.Label for={`${scope}-date`}>Choose a date</Field.Label>
						<Input
							id={`${scope}-date`}
							type="date"
							disabled={!hydrated}
							value={/^\d{4}-\d{2}-\d{2}$/.test(filters.date) ? filters.date : ''}
							class="min-h-11"
							onchange={(event) => onfilter('date', event.currentTarget.value)}
						/>
					</Field.Field>
				{/if}
				<Field.Description>Campus time · Weeks run Monday to Sunday.</Field.Description>
			</Field.Set>
		{/if}
		{#if section === 'mode'}
			<Field.Set>
				<Field.Legend class={scope.startsWith('mobile-') ? 'sr-only' : undefined}>Type</Field.Legend
				>
				<Field.Description>Choose any combination, or leave all unselected.</Field.Description>
				<ToggleGroup.Root
					type="multiple"
					value={selectedModes}
					onValueChange={chooseModes}
					aria-label="Type"
					class="flex flex-col gap-2"
					disabled={!hydrated}
				>
					{#each responseModes as mode (mode.value)}
						<ToggleGroup.Item
							value={mode.value}
							class={buttonVariants({
								variant: selectedModes.includes(mode.value) ? 'default' : 'outline',
								class: 'min-h-11 justify-start'
							})}>{mode.label}</ToggleGroup.Item
						>
					{/each}
				</ToggleGroup.Root>
			</Field.Set>
		{/if}
		{#if section === 'host'}
			<Field.Field>
				<Field.Label for={`${scope}-group`}>Group</Field.Label>
				<NativeSelect.Root
					id={`${scope}-group`}
					value={filters.groupId}
					disabled={!hydrated}
					class="w-full [&_select]:min-h-11"
					onchange={(event) => onfilter('group', event.currentTarget.value)}
				>
					<NativeSelect.Option value="">All Groups</NativeSelect.Option>
					{#each result.options.groups as group (group.id)}<NativeSelect.Option value={group.id}
							>{group.name}</NativeSelect.Option
						>{/each}
				</NativeSelect.Root>
			</Field.Field>
			<Field.Field>
				<Field.Label for={`${scope}-host`}>Host type</Field.Label>
				<NativeSelect.Root
					id={`${scope}-host`}
					value={filters.hostType}
					disabled={!hydrated}
					class="w-full [&_select]:min-h-11"
					onchange={(event) => onfilter('host', event.currentTarget.value)}
				>
					<NativeSelect.Option value="">All hosts</NativeSelect.Option>
					<NativeSelect.Option value="personal">Personal</NativeSelect.Option>
					<NativeSelect.Option value="group">Group</NativeSelect.Option>
				</NativeSelect.Root>
			</Field.Field>
		{/if}
	</Field.Group>
{/snippet}

<section aria-label="Event filters" class="flex min-w-0 flex-col gap-3">
	<div class="flex min-h-11 items-center justify-between gap-3">
		<p
			role="status"
			aria-label="Event results"
			aria-live="polite"
			aria-atomic="true"
			class="font-medium"
		>
			{result.count}
			{result.count === 1 ? 'Event' : 'Events'}
		</p>
		<div class="hidden items-center gap-2 md:flex">
			{#each sections as section (section.key)}
				<Popover.Root>
					<Popover.Trigger
						class={buttonVariants({ variant: 'outline', class: 'min-h-11' })}
						disabled={!hydrated}>{section.label}</Popover.Trigger
					>
					<Popover.Content
						align="end"
						aria-label={`${section.label} filters`}
						class="max-h-[70dvh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto"
					>
						{@render fields(section.key, `menu-${section.key}`)}
					</Popover.Content>
				</Popover.Root>
			{/each}
		</div>
		<div class="md:hidden">
			<Sheet.Root>
				<Sheet.Trigger
					class={buttonVariants({ variant: 'outline', class: 'min-h-11' })}
					disabled={!hydrated}>Filters{active.length ? ` · ${active.length}` : ''}</Sheet.Trigger
				>
				<Sheet.Content side="bottom" class="max-h-[85dvh] rounded-t-3xl">
					<Sheet.Header>
						<Sheet.Title>Filter Events</Sheet.Title>
						<Sheet.Description>Results update as you choose.</Sheet.Description>
					</Sheet.Header>
					<div class="min-h-0 overflow-y-auto px-4">
						<Accordion.Root type="single">
							{#each sections as section (section.key)}
								<Accordion.Item value={section.key} class="border-b last:border-b-0">
									<Accordion.Header level={3}>
										<Accordion.Trigger
											class="group flex min-h-16 w-full items-center justify-between gap-3 py-3 text-left"
										>
											<span class="flex min-w-0 flex-col gap-1"
												><span class="text-sm font-medium">{section.label}</span><span
													class="truncate text-sm text-muted-foreground">{section.summary}</span
												></span
											>
											<HugeiconsIcon
												icon={ArrowDown01Icon}
												class="size-4 shrink-0 text-muted-foreground group-data-[state=open]:rotate-180"
											/>
										</Accordion.Trigger>
									</Accordion.Header>
									<Accordion.Content class="pb-4"
										>{@render fields(section.key, `mobile-${section.key}`)}</Accordion.Content
									>
								</Accordion.Item>
							{/each}
						</Accordion.Root>
					</div>
					<Sheet.Footer>
						<div class="flex items-center justify-between gap-2">
							<p
								role="status"
								aria-label="Filtered results"
								aria-live="polite"
								aria-atomic="true"
								class="text-sm text-muted-foreground"
							>
								{loading
									? 'Loading Events…'
									: `${result.count} ${result.count === 1 ? 'Event matches' : 'Events match'}`}
							</p>
							<Button variant="ghost" class="min-h-11" disabled={!hydrated} onclick={clear}
								>Clear all</Button
							>
						</div>
						<Sheet.Close class={buttonVariants({ class: 'min-h-11' })}>Done</Sheet.Close>
					</Sheet.Footer>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
	{#if active.length}
		<ul aria-label="Active filters" class="flex list-none flex-wrap items-center gap-2 p-0">
			{#each active as chip (`${chip.key}-${chip.value}`)}
				<li class="max-w-full min-w-0">
					<Button
						variant="secondary"
						class="min-h-11 max-w-full"
						aria-label={`Remove ${chip.label}`}
						disabled={!hydrated}
						onclick={() =>
							onfilter(
								chip.key,
								chip.key === 'tag' || chip.key === 'type' ? chip.value : '',
								false
							)}
						><span class="truncate">{chip.label}</span><HugeiconsIcon
							icon={Cancel01Icon}
							data-icon="inline-end"
						/></Button
					>
				</li>
			{/each}
			<li>
				<Button variant="ghost" class="min-h-11" disabled={!hydrated} onclick={clear}
					>Clear all</Button
				>
			</li>
		</ul>
	{/if}
</section>
