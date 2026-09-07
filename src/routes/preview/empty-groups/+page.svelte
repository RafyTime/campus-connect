<script lang="ts">
	import GroupsEmpty from '$lib/components/groups-empty.svelte';
</script>

<svelte:head>
	<title>Empty Groups preview · Campus Connect</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="font-heading text-2xl font-medium tracking-tight">Groups</h1>
		<p class="text-muted-foreground">Preview of Groups when no public Groups exist.</p>
	</header>
	<GroupsEmpty />
</div>
