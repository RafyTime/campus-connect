<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '#lib/assets/favicon.svg';
	import AppShell from '#lib/components/app-shell.svelte';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import './layout.css';

	let { children, data } = $props();
</script>

<ModeWatcher />

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Campus Connect</title>
</svelte:head>

<Tooltip.Provider>
	<AppShell user={data.user}>
		{@render children()}
	</AppShell>
</Tooltip.Provider>
