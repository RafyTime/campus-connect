<script lang="ts">
	import DiscoverEmpty from '$lib/components/discover-empty.svelte';
</script>

<svelte:head>
	<title>Empty Discover preview · Campus Connect</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="font-heading text-2xl font-medium tracking-tight">Discover</h1>
		<p class="text-muted-foreground">Preview of Discover when no scheduled public Events exist.</p>
	</header>
	<DiscoverEmpty />
</div>
