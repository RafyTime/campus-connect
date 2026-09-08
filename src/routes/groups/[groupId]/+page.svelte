<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import EventCard from '$lib/components/event-card.svelte';
	import HostAvatar from '$lib/components/host-avatar.svelte';
	import * as Empty from '$lib/components/ui/empty';
	import { subscriberCountLabel } from '$lib/group-labels';
	import { loadPublicGroup } from '$lib/groups.remote';
	import ProtectedActionDialog from '$lib/components/protected-action-dialog.svelte';

	const group = $derived(await loadPublicGroup(page.params.groupId ?? ''));
	const user = $derived(page.data.user);
	let promptOpen = $state(false);
</script>

<svelte:head>
	<title>{group.name} · Campus Connect</title>
</svelte:head>

<article class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<p>
		<Button href={resolve('/groups')} variant="ghost" class="min-h-11 px-3">
			<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" size={16} />
			Back to Groups
		</Button>
	</p>

	<header class="flex flex-col gap-4">
		<div class="flex items-start gap-3">
			<HostAvatar
				displayName={group.name}
				imageUrl={group.imageUrl}
				imageAttribution={group.imageAttribution}
				initials={group.initials}
				size="lg"
			/>
			<div class="flex min-w-0 flex-col gap-2">
				{#if group.systemManaged}
					<Badge variant="secondary">Campus-wide</Badge>
				{/if}
				<h1 class="font-heading text-2xl font-medium tracking-tight">{group.name}</h1>
			</div>
		</div>
		{#if group.imageAttribution}
			<p class="text-xs text-muted-foreground">{group.imageAttribution}</p>
		{/if}
		<p class="whitespace-pre-wrap">{group.description}</p>
	</header>

	<section class="flex flex-col gap-2" aria-labelledby="group-owner-heading">
		<h2 id="group-owner-heading" class="font-heading text-lg font-medium tracking-tight">Owner</h2>
		<p>{group.owner.displayName}</p>
	</section>

	<section class="flex flex-col gap-2" aria-labelledby="group-subscribers-heading">
		<h2 id="group-subscribers-heading" class="font-heading text-lg font-medium tracking-tight">
			Subscribers
		</h2>
		<p>{subscriberCountLabel(group.subscriberCount)}</p>
		{#if !group.systemManaged}
			<p>
				<Button
					class="min-h-11"
					onclick={() => {
						if (!user) promptOpen = true;
					}}
				>
					Follow
				</Button>
			</p>
		{/if}
	</section>

	<section class="flex flex-col gap-4" aria-labelledby="group-events-heading">
		<h2 id="group-events-heading" class="font-heading text-lg font-medium tracking-tight">
			Upcoming public Events
		</h2>
		{#if group.upcomingEvents.length === 0}
			<Empty.Root>
				<Empty.Header>
					<Empty.Title>
						<h3 class="font-heading text-base font-medium tracking-tight">No upcoming Events</h3>
					</Empty.Title>
					<Empty.Description>
						Scheduled public group Events will appear here when this Group publishes them.
					</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{:else}
			<ul class="grid list-none gap-4 p-0">
				{#each group.upcomingEvents as event (event.id)}
					<li>
						<EventCard {event} />
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</article>

<ProtectedActionDialog bind:open={promptOpen} />
