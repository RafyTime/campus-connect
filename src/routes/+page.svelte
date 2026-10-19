<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { navigating, page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import DiscoverEmpty from '#lib/components/discover-empty.svelte';
	import DiscoverFilters from '#lib/components/discover-filters.svelte';
	import type { DiscoveryFilterKey } from '#lib/event-filter-options.js';
	import EventCard from '#lib/components/event-card.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { listPublicEvents } from '#lib/events.remote.js';

	// Filters require client handlers; enable them once those handlers are mounted.
	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});
	const result = $derived(await listPublicEvents(page.url.search));
	const filters = $derived(result.filters);
	const hasFilters = $derived(
		filters.tagIds.length > 0 ||
			!!filters.date ||
			!!filters.groupId ||
			!!filters.hostType ||
			filters.responseModes.length > 0
	);

	function updateFilter(key: DiscoveryFilterKey, value: string, selected = true) {
		const params = new SvelteURLSearchParams(navigating.to?.url.search);
		if (!navigating.to) {
			for (const tagId of filters.tagIds) params.append('tag', tagId);
			for (const mode of filters.responseModes) params.append('type', mode);
			if (filters.date) params.set('date', filters.date);
			if (filters.groupId) params.set('group', filters.groupId);
			if (filters.hostType) params.set('host', filters.hostType);
		}
		const values =
			key === 'tag' || key === 'type' ? params.getAll(key).filter((id) => id !== value) : [];
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

	<DiscoverFilters
		{result}
		{hydrated}
		loading={!!navigating.to}
		onfilter={updateFilter}
		onclear={clearFilters}
	/>

	{#if result.count === 0 && hasFilters}
		<Empty.Root>
			<Empty.Header>
				<Empty.Title><h2>No matching Events</h2></Empty.Title>
				<Empty.Description
					>Try other filters, or clear all filters to broaden your search.</Empty.Description
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
