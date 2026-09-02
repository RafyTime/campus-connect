<script lang="ts">
	import DiscoverEmpty from '$lib/components/discover-empty.svelte';
	import EventCard from '$lib/components/event-card.svelte';
	import { listPublicEvents } from '$lib/events.remote';

	const events = await listPublicEvents();
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

	{#if events.length === 0}
		<DiscoverEmpty />
	{:else}
		<ul class="grid list-none gap-4 p-0 md:grid-cols-2">
			{#each events as event (event.id)}
				<li>
					<EventCard {event} />
				</li>
			{/each}
		</ul>
	{/if}
</div>
