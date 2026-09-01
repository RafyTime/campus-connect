<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import AppShell from '$lib/components/app-shell.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Campus Connect</title>
</svelte:head>

<AppShell>
	{@render children()}
</AppShell>
