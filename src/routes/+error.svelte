<script lang="ts">
	import { AlertCircleIcon, Search01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty';

	const isNotFound = $derived(page.status === 404);
	const title = $derived(isNotFound ? 'Page not found' : 'Something went wrong');
	const description = $derived(
		isNotFound
			? 'That address is not a Campus Connect destination. Return to Discover to continue browsing.'
			: 'Campus Connect could not complete this request. Return to Discover and try again.'
	);
	const icon = $derived(isNotFound ? Search01Icon : AlertCircleIcon);
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
		<Button href={resolve('/')}>Back to Discover</Button>
	</Empty.Content>
</Empty.Root>
