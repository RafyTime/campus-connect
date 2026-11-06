<script lang="ts">
	import {
		AlertCircleIcon,
		Search01Icon,
		WifiDisconnected01Icon
	} from '@hugeicons/core-free-icons';
	import { getConnectivity } from '#lib/connectivity.svelte.js';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';

	const isNotFound = $derived(page.status === 404);
	const connection = getConnectivity();
	let offlineFailure = $state(false);
	$effect(() => {
		if (!connection.online && page.status >= 500) offlineFailure = true;
	});
	const isForbidden = $derived(page.status === 403);
	const title = $derived(
		offlineFailure
			? "You're offline"
			: isNotFound
				? 'Page not found'
				: isForbidden
					? 'Access denied'
					: 'Something went wrong'
	);
	const description = $derived(
		offlineFailure
			? 'Campus Connect needs a connection to load this page. Reconnect, then try again.'
			: isNotFound
				? 'That address is not a Campus Connect destination. Return to Discover to continue browsing.'
				: isForbidden
					? (page.error?.message ?? 'You do not have access to this page.')
					: 'Campus Connect could not complete this request. Return to Discover and try again.'
	);
	const icon = $derived(
		offlineFailure ? WifiDisconnected01Icon : isNotFound ? Search01Icon : AlertCircleIcon
	);
</script>

<svelte:head>
	<title>{title} · Campus Connect</title>
</svelte:head>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<HugeiconsIcon {icon} />
		</Empty.Media>
		<Empty.Title>
			<h1 class="font-heading text-lg font-medium tracking-tight">{title}</h1>
		</Empty.Title>
		<Empty.Description>{description}</Empty.Description>
	</Empty.Header>
	<Empty.Content>
		{#if offlineFailure}
			<Button onclick={() => window.location.reload()}>Retry</Button>
		{:else}
			<Button href={resolve('/')}>Back to Discover</Button>
		{/if}
	</Empty.Content>
</Empty.Root>
