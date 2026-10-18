<script lang="ts">
	import EventCard from '#lib/components/event-card.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { loadMyEvents } from '#lib/events.remote.js';
	import { eventStatusLabel } from '#lib/event-labels.js';
	const events = $derived(await loadMyEvents());
</script>

<svelte:head><title>My events · Campus Connect</title></svelte:head>

<div class="flex flex-col gap-6">
	<header class="flex flex-wrap items-start justify-between gap-4">
		<div class="flex flex-col gap-2">
			<h1 class="font-heading text-2xl font-medium tracking-tight">My events</h1>
			<p class="text-muted-foreground">
				Personal and Group Events you can manage, including ended and cancelled Events.
			</p>
		</div>
		<Button href="/create" class="min-h-11">Create an Event</Button>
	</header>
	{#if events.length === 0}
		<Empty.Root>
			<Empty.Header>
				<Empty.Title>No Events yet</Empty.Title>
				<Empty.Description
					>Publish an Event as yourself or a Group you own or represent.</Empty.Description
				>
			</Empty.Header>
			<Empty.Content><Button href="/create" class="min-h-11">Create an Event</Button></Empty.Content
			>
		</Empty.Root>
	{:else}
		<ul class="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="My events">
			{#each events as event (event.id)}
				<li class="flex min-w-0 flex-col gap-2">
					<p><Badge variant="secondary">{eventStatusLabel(event.status)}</Badge></p>
					<EventCard {event} />
					{#if event.status === 'scheduled'}
						<Button
							href={`/events/${event.id}/edit`}
							variant="outline"
							class="min-h-11"
							aria-label={`Edit ${event.title}`}>Edit Event</Button
						>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
