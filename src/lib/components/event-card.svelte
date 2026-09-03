<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import HostAvatar from '$lib/components/host-avatar.svelte';
	import { responseModeLabel } from '$lib/event-labels';
	import type { PublicEventSummary } from '$lib/public-event';

	let { event }: { event: PublicEventSummary } = $props();
</script>

<a
	href={resolve('/events/[eventId]', { eventId: event.id })}
	class="block h-full rounded-[min(var(--radius-4xl),24px)] focus-visible:ring-3 focus-visible:ring-ring/30"
>
	<Card.Root class="flex h-full flex-col">
		<Card.Header>
			<Card.Title>
				<h2 class="font-heading text-base font-medium">{event.title}</h2>
			</Card.Title>
			<Card.Description>
				<time datetime={event.startsAt.toISOString()}>{event.scheduleLabel}</time>
			</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-1 flex-col gap-3">
			<div class="flex items-center gap-2 text-sm">
				<HostAvatar
					displayName={event.host.displayName}
					imageUrl={event.host.imageUrl}
					imageAttribution={event.host.imageAttribution}
					initials={event.host.initials}
				/>
				<div class="min-w-0">
					<p class="truncate font-medium">{event.host.displayName}</p>
					<p class="truncate text-muted-foreground">
						<span class="font-medium text-foreground">Location</span>
						{event.locationLabel}
					</p>
				</div>
			</div>
			<div class="mt-auto flex min-h-12 flex-wrap content-start gap-1.5">
				<Badge variant="secondary">{responseModeLabel(event.responseMode)}</Badge>
				<Badge variant="outline">{event.capacityState}</Badge>
				{#each event.tags as tag (tag.id)}
					<Badge variant="outline">{tag.name}</Badge>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</a>
