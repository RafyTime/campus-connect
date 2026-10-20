<script lang="ts">
	import EventCard from '#lib/components/event-card.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { loadMyActivity } from '#lib/participation.remote.js';
	import { eventStatusLabel } from '#lib/event-labels.js';
	const events = $derived(await loadMyActivity());
</script>

<svelte:head><title>My activity · Campus Connect</title></svelte:head>
<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="font-heading text-2xl font-medium tracking-tight">My activity</h1>
		<p class="text-muted-foreground">
			Your interests, including cancelled and ended Events. Open an upcoming Event to withdraw
			interest.
		</p>
	</header>
	{#if events.length === 0}
		<Empty.Root
			><Empty.Header
				><Empty.Title>No interests yet</Empty.Title><Empty.Description
					>Explore campus Events and express interest to save them here.</Empty.Description
				></Empty.Header
			><Empty.Content><Button href="/" class="min-h-11">Discover Events</Button></Empty.Content
			></Empty.Root
		>
	{:else}
		<ul class="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="My interests">
			{#each events as event (event.id)}
				<li class="flex min-w-0 flex-col gap-2">
					<p><Badge variant="secondary">Interest · {eventStatusLabel(event.status)}</Badge></p>
					<EventCard {event} />
				</li>
			{/each}
		</ul>
	{/if}
</div>
