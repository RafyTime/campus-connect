<script lang="ts">
	import EventDetailsForm from '#lib/components/event-details-form.svelte';
	import { loadEventAuthoringOptions } from '#lib/events.remote.js';
	const options = await loadEventAuthoringOptions();
</script>

<svelte:head><title>Create Event · Campus Connect</title></svelte:head>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="font-heading text-2xl font-medium tracking-tight">Create an Event</h1>
		<p class="text-muted-foreground">
			Publish as yourself or a Group you own or represent. Your Event will be public and appear in
			Discover immediately.
		</p>
	</header>
	<EventDetailsForm mode="create" {options} />
</div>
