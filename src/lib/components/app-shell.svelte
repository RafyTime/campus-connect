<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { navigating, page } from '$app/state';
	import { CompassIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Spinner } from '$lib/components/ui/spinner';
	import { accountDestinations, isCurrentDestination, primaryDestinations } from '$lib/navigation';

	let { children }: { children: Snippet } = $props();

	const pathname = $derived(page.url.pathname);
	const isNavigating = $derived(Boolean(navigating.to));

	const primaryIcons = {
		'/': CompassIcon,
		'/groups': UserGroupIcon
	} as const;
</script>

<a
	href="#main-content"
	class="sr-only z-20 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus-visible:ring-3 focus-visible:ring-ring/30"
>
	Skip to main content
</a>

<div class="flex min-h-dvh flex-col">
	<header class="sticky top-0 z-10 border-b bg-background">
		<div class="mx-auto flex min-h-14 w-full max-w-5xl items-center gap-3 px-4 py-2">
			<a
				href={resolve('/')}
				class="inline-flex min-h-11 min-w-0 items-center truncate rounded-md font-heading text-base font-medium tracking-tight focus-visible:ring-3 focus-visible:ring-ring/30"
			>
				Campus Connect
			</a>

			<nav aria-label="Primary" class="hidden min-w-0 flex-1 items-center gap-1 md:flex">
				{#each primaryDestinations as destination (destination.href)}
					{@const current = isCurrentDestination(pathname, destination.href)}
					<Button
						href={resolve(destination.href)}
						variant={current ? 'secondary' : 'ghost'}
						class="min-h-11 min-w-11"
						aria-current={current ? 'page' : undefined}
					>
						{destination.label}
					</Button>
				{/each}
			</nav>

			<nav aria-label="Account" class="ml-auto flex items-center gap-2">
				{#each accountDestinations as destination (destination.href)}
					{@const current = isCurrentDestination(pathname, destination.href)}
					<Button
						href={resolve(destination.href)}
						variant={destination.href === '/register' ? 'default' : 'outline'}
						class="min-h-11 min-w-11 px-3"
						aria-current={current ? 'page' : undefined}
					>
						{destination.label}
					</Button>
				{/each}
			</nav>
		</div>
	</header>

	<main
		id="main-content"
		tabindex="-1"
		aria-busy={isNavigating}
		class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 pb-24 focus-visible:ring-3 focus-visible:ring-ring/30 md:py-8 md:pb-8"
	>
		{#if isNavigating}
			<div class="flex flex-col gap-4" role="status" aria-label="Loading page">
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Spinner role="presentation" aria-hidden="true" />
					Loading page
				</div>
				<Skeleton class="h-8 w-48" />
				<Skeleton class="h-24 w-full" />
				<Skeleton class="h-24 w-full" />
			</div>
		{:else}
			{@render children()}
		{/if}
	</main>

	<nav
		aria-label="Primary"
		class="fixed inset-x-0 bottom-0 z-10 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
	>
		<div class="flex items-stretch gap-1 px-2 py-1">
			{#each primaryDestinations as destination (destination.href)}
				{@const current = isCurrentDestination(pathname, destination.href)}
				<Button
					href={resolve(destination.href)}
					variant={current ? 'secondary' : 'ghost'}
					class="min-h-11 min-w-11 flex-1 flex-col gap-0.5 py-2 text-xs"
					aria-current={current ? 'page' : undefined}
				>
					<HugeiconsIcon icon={primaryIcons[destination.href]} />
					{destination.label}
				</Button>
			{/each}
		</div>
	</nav>
</div>
