<script lang="ts">
	import GroupCard from '$lib/components/group-card.svelte';
	import GroupsEmpty from '$lib/components/groups-empty.svelte';
	import { listPublicGroups } from '$lib/groups.remote';

	const groups = await listPublicGroups();
</script>

<svelte:head>
	<title>Groups · Campus Connect</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="font-heading text-2xl font-medium tracking-tight">Groups</h1>
		<p class="text-muted-foreground">
			Campus communities at IU Campus Bad Honnef. Open a Group to see its public details and
			upcoming Events.
		</p>
	</header>

	{#if groups.length === 0}
		<GroupsEmpty />
	{:else}
		<ul class="grid list-none gap-4 p-0 md:grid-cols-2">
			{#each groups as group (group.id)}
				<li class="h-full">
					<GroupCard {group} />
				</li>
			{/each}
		</ul>
	{/if}
</div>
