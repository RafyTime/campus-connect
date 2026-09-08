<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		children
	}: {
		title: string;
		description: string;
		children: Snippet;
	} = $props();
</script>

<svelte:head>
	<title>{title} · Campus Connect</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-md flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="font-heading text-2xl font-medium tracking-tight">{title}</h1>
		<p class="text-muted-foreground">{description}</p>
	</header>
	{@render children()}
</div>
