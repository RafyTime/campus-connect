<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import HostAvatar from '$lib/components/host-avatar.svelte';
	import { eventStatusLabel, responseModeLabel } from '$lib/event-labels';
	import { loadPublicEvent } from '$lib/events.remote';

	const event = $derived(await loadPublicEvent(page.params.eventId ?? ''));
</script>

<svelte:head>
	<title>{event.title} · Campus Connect</title>
</svelte:head>

<article class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<p>
		<Button href={resolve('/')} variant="ghost" class="min-h-11 px-3">Back to Discover</Button>
	</p>

	<header class="flex flex-col gap-3">
		<div class="flex flex-wrap gap-1.5">
			<Badge variant="secondary">{eventStatusLabel(event.status)}</Badge>
			<Badge variant="outline">{event.capacityState}</Badge>
		</div>
		<h1 class="font-heading text-2xl font-medium tracking-tight">{event.title}</h1>
		<p class="text-muted-foreground">
			<time datetime={event.startsAt.toISOString()}>{event.exactTimeLabel}</time>
		</p>
	</header>

	<section class="flex flex-col gap-4" aria-labelledby="event-host-heading">
		<h2 id="event-host-heading" class="font-heading text-lg font-medium tracking-tight">Host</h2>
		<div class="flex items-center gap-3">
			<HostAvatar
				displayName={event.host.displayName}
				imageUrl={event.host.imageUrl}
				imageAttribution={event.host.imageAttribution}
				initials={event.host.initials}
				size="lg"
			/>
			<p class="font-medium">{event.host.displayName}</p>
		</div>
		{#if event.host.imageAttribution}
			<p class="text-xs text-muted-foreground">{event.host.imageAttribution}</p>
		{/if}
	</section>

	<section class="flex flex-col gap-2" aria-labelledby="event-location-heading">
		<h2 id="event-location-heading" class="font-heading text-lg font-medium tracking-tight">
			Location
		</h2>
		<p>{event.locationLabel}</p>
	</section>

	<section class="flex flex-col gap-2" aria-labelledby="event-details-heading">
		<h2 id="event-details-heading" class="font-heading text-lg font-medium tracking-tight">
			Details
		</h2>
		<p class="text-sm">
			<span class="text-muted-foreground">Response mode</span>
			{responseModeLabel(event.responseMode)}
		</p>
		<div class="flex flex-wrap gap-1.5">
			{#each event.tags as tag (tag.id)}
				<Badge variant="outline">{tag.name}</Badge>
			{/each}
		</div>
	</section>

	<section class="flex flex-col gap-2" aria-labelledby="event-description-heading">
		<h2 id="event-description-heading" class="font-heading text-lg font-medium tracking-tight">
			Description
		</h2>
		<p class="break-words whitespace-pre-wrap">{event.description}</p>
	</section>
</article>
