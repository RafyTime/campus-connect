<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { navigating, page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import DiscoverEmpty from '#lib/components/discover-empty.svelte';
	import EventCard from '#lib/components/event-card.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as NativeSelect from '#lib/components/ui/native-select/index.js';
	import { listPublicEvents } from '#lib/events.remote.js';

	// Filters require client handlers; enable them once those handlers are mounted.
	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});
	const result = $derived(await listPublicEvents(page.url.search));
	const filters = $derived(result.filters);
	const activeFilters = $derived([
		...result.options.tags.filter((tag) => filters.tagIds.includes(tag.id)).map((tag) => tag.name),
		...(filters.date ? [`Date: ${filters.date}`] : []),
		...result.options.groups
			.filter((group) => group.id === filters.groupId)
			.map((group) => `Group: ${group.name}`),
		...(filters.hostType ? [`Host: ${filters.hostType === 'group' ? 'Group' : 'Personal'}`] : [])
	]);

	function updateFilter(key: 'tag' | 'date' | 'group' | 'host', value: string, selected = true) {
		const params = new SvelteURLSearchParams(navigating.to?.url.search);
		if (!navigating.to) {
			for (const tagId of filters.tagIds) params.append('tag', tagId);
			if (filters.date) params.set('date', filters.date);
			if (filters.groupId) params.set('group', filters.groupId);
			if (filters.hostType) params.set('host', filters.hostType);
		}
		const values = key === 'tag' ? params.getAll(key).filter((id) => id !== value) : [];
		if (value && selected) values.push(value);
		params.delete(key);
		for (const value of values) params.append(key, value);
		const search = params.toString();

		return goto(search ? resolve(`?${search}`) : resolve('/'), { reset: false });
	}

	function clearFilters() {
		return goto(resolve('/'), { reset: false });
	}
</script>

<svelte:head>
	<title>Discover · Campus Connect</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="font-heading text-2xl font-medium tracking-tight">Discover</h1>
		<p class="text-muted-foreground">
			Upcoming public Events at IU Campus Bad Honnef, ordered by the next start time.
		</p>
	</header>

	<section aria-label="Event filters" class="flex min-w-0 flex-col gap-4">
		<Field.Group>
			<Field.Set>
				<Field.Legend>Tags</Field.Legend>
				<Field.Description>Match any selected Tag.</Field.Description>
				<Field.Group class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
					{#each result.options.tags as tag (tag.id)}
						<Field.Field orientation="horizontal" data-disabled={!hydrated || undefined}>
							<Field.Label class="min-h-11 w-full" for={`filter-${tag.id}`}>
								<Checkbox
									id={`filter-${tag.id}`}
									disabled={!hydrated}
									checked={filters.tagIds.includes(tag.id)}
									onCheckedChange={(checked) => updateFilter('tag', tag.id, checked)}
								/>
								{tag.name}
							</Field.Label>
						</Field.Field>
					{/each}
				</Field.Group>
			</Field.Set>
			<Field.Group class="grid gap-4 md:grid-cols-3">
				<Field.Field data-disabled={!hydrated || undefined}>
					<Field.Label for="filter-date">Date</Field.Label>
					<Input
						id="filter-date"
						disabled={!hydrated}
						type="date"
						value={filters.date}
						class="min-h-11 min-w-0"
						aria-describedby="filter-date-help"
						onchange={(event) => updateFilter('date', event.currentTarget.value)}
					/>
					<Field.Description id="filter-date-help">Start date in Europe/Berlin.</Field.Description>
				</Field.Field>
				<Field.Field data-disabled={!hydrated || undefined}>
					<Field.Label for="filter-group">Group</Field.Label>
					<NativeSelect.Root
						id="filter-group"
						disabled={!hydrated}
						value={filters.groupId}
						class="w-full [&_select]:min-h-11"
						onchange={(event) => updateFilter('group', event.currentTarget.value)}
					>
						<NativeSelect.Option value="">All Groups</NativeSelect.Option>
						{#each result.options.groups as group (group.id)}
							<NativeSelect.Option value={group.id}>{group.name}</NativeSelect.Option>
						{/each}
					</NativeSelect.Root>
				</Field.Field>
				<Field.Field data-disabled={!hydrated || undefined}>
					<Field.Label for="filter-host">Host type</Field.Label>
					<NativeSelect.Root
						id="filter-host"
						disabled={!hydrated}
						value={filters.hostType}
						class="w-full [&_select]:min-h-11"
						onchange={(event) => updateFilter('host', event.currentTarget.value)}
					>
						<NativeSelect.Option value="">All hosts</NativeSelect.Option>
						<NativeSelect.Option value="personal">Personal</NativeSelect.Option>
						<NativeSelect.Option value="group">Group</NativeSelect.Option>
					</NativeSelect.Root>
				</Field.Field>
			</Field.Group>
		</Field.Group>
		{#if activeFilters.length}
			<ul aria-label="Active filters" class="flex list-none flex-wrap gap-2 p-0">
				{#each activeFilters as label (label)}
					<li><Badge variant="secondary">{label}</Badge></li>
				{/each}
			</ul>

			<Button
				variant="outline"
				class="min-h-11 self-start"
				disabled={!hydrated}
				onclick={clearFilters}>Clear all filters</Button
			>
		{/if}
	</section>

	<p role="status" aria-label="Event results" aria-live="polite" aria-atomic="true">
		{result.count}
		{result.count === 1 ? 'Event' : 'Events'}
	</p>

	{#if result.count === 0 && activeFilters.length}
		<Empty.Root>
			<Empty.Header>
				<Empty.Title><h2>No matching Events</h2></Empty.Title>
				<Empty.Description
					>Try other Tags, another date, or clear all filters to broaden your search.</Empty.Description
				>
			</Empty.Header>
			<Empty.Content
				><Button class="min-h-11" disabled={!hydrated} onclick={clearFilters}
					>Show all Events</Button
				></Empty.Content
			>
		</Empty.Root>
	{:else if result.count === 0}
		<DiscoverEmpty />
	{:else}
		<ul class="grid list-none gap-4 p-0 md:grid-cols-2">
			{#each result.events as event (event.id)}
				<li class="h-full"><EventCard {event} /></li>
			{/each}
		</ul>
	{/if}
</div>
