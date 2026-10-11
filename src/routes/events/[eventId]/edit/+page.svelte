<script lang="ts">
	import { page } from '$app/state';
	import EventDetailsForm from '$lib/components/event-details-form.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { loadEventAuthoringOptions, loadPersonalEventForManagement } from '$lib/events.remote';
	const event = $derived(await loadPersonalEventForManagement(page.params.eventId ?? ''));
	const options = await loadEventAuthoringOptions();
</script>

<svelte:head><title>Edit {event.title} · Campus Connect</title></svelte:head>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="font-heading text-2xl font-medium tracking-tight">Edit personal Event</h1>
		<p class="text-muted-foreground">Update your public Event. The host stays the same.</p>
	</header>
	{#if event.status === 'scheduled'}
		{#key event.id}<EventDetailsForm mode="edit" {options} initial={event} />{/key}
	{:else}
		<Alert.Root
			><Alert.Title>Event is read-only</Alert.Title><Alert.Description
				>Ended and cancelled Events cannot be edited.</Alert.Description
			></Alert.Root
		>
		<Button href={`/events/${event.id}`} variant="outline" class="min-h-11">View Event</Button>
	{/if}
</div>
