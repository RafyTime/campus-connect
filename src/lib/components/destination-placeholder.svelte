<script lang="ts">
	import type { IconSvgElement } from '@hugeicons/svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import * as Empty from '$lib/components/ui/empty';

	let {
		title,
		description,
		icon
	}: {
		title: string;
		description: string;
		icon: IconSvgElement;
	} = $props();
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
</Empty.Root>
