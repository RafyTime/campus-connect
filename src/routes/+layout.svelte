<script lang="ts">
	import { onMount } from 'svelte';
	import { Connectivity, setConnectivity } from '#lib/connectivity.svelte.js';
	import { AppUpdates, setAppUpdates } from '#lib/app-updates.svelte.js';
	import { afterNavigate } from '$app/navigation';
	import { MobileInstallation, setMobileInstallation } from '#lib/mobile-installation.svelte.js';
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '#lib/assets/favicon.svg';
	import AppShell from '#lib/components/app-shell.svelte';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import './layout.css';

	let { children, data } = $props();
	const connection = new Connectivity();
	setConnectivity(connection);
	onMount(() => connection.mount());
	const updates = new AppUpdates();
	setAppUpdates(updates);
	onMount(() => updates.mount());
	afterNavigate(() => {
		updates.dirty = false;
		connection.blockedSubmission = false;
	});
	const installation = new MobileInstallation();
	setMobileInstallation(installation);
	onMount(() => installation.mount());
	onMount(() => {
		const viewport = window.visualViewport;
		if (!viewport) return;
		const root = document.documentElement;
		const updateViewport = () => {
			root.style.setProperty('--visual-viewport-height', `${viewport.height}px`);
			root.style.setProperty(
				'--visual-viewport-bottom',
				`${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`
			);
		};
		updateViewport();
		viewport.addEventListener('resize', updateViewport);
		viewport.addEventListener('scroll', updateViewport);
		return () => {
			viewport.removeEventListener('resize', updateViewport);
			viewport.removeEventListener('scroll', updateViewport);
			root.style.removeProperty('--visual-viewport-height');
			root.style.removeProperty('--visual-viewport-bottom');
		};
	});
</script>

<ModeWatcher themeColors={{ light: '#fafaf9', dark: '#1c1917' }} />

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.webmanifest" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
	<meta name="application-name" content="Campus Connect" />
	<meta name="apple-mobile-web-app-title" content="Campus Connect" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
	<title>Campus Connect</title>
</svelte:head>

<Tooltip.Provider>
	<AppShell user={data.user}>
		{@render children()}
	</AppShell>
</Tooltip.Provider>
