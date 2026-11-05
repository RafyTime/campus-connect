<script lang="ts">
	import { page } from '$app/state';
	import { Cancel01Icon, Share03Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import favicon from '#lib/assets/favicon.svg';
	import { getMobileInstallation } from '#lib/mobile-installation.svelte.js';

	let { banner = false }: { banner?: boolean } = $props();
	const installation = getMobileInstallation();
	let open = $state(false);
	const mainPage = $derived(
		['/', '/groups', '/my-activity', '/my-events'].includes(page.url.pathname)
	);
	const visible = $derived(
		installation.platform &&
			!installation.standalone &&
			(!banner || (mainPage && !installation.dismissed))
	);
</script>

{#if visible}
	<Sheet.Root bind:open>
		{#if banner}
			<aside
				aria-label="Install Campus Connect"
				class="border-b bg-secondary text-secondary-foreground"
			>
				<div class="safe-inline mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
					<div class="flex min-w-0 flex-1 items-center gap-2.5">
						<img src={favicon} alt="" class="size-9 shrink-0" />
						<div class="flex min-w-0 flex-col gap-0.5">
							<p class="text-sm font-medium">Campus Connect</p>
							<p class="text-xs leading-4">Add to home screen.</p>
						</div>
					</div>
					<div class="flex shrink-0 items-center gap-1">
						<Sheet.Trigger class={buttonVariants({ class: 'min-h-11 px-4' })}>Install</Sheet.Trigger
						>
						<Button
							variant="ghost"
							size="icon"
							class="size-11"
							aria-label="Dismiss installation banner"
							onclick={() => installation.dismiss()}
						>
							<HugeiconsIcon icon={Cancel01Icon} />
						</Button>
					</div>
				</div>
			</aside>
		{:else}
			<Sheet.Trigger class={buttonVariants({ variant: 'outline', class: 'min-h-11' })}
				>Install Campus Connect</Sheet.Trigger
			>
		{/if}
		<Sheet.Content
			side="bottom"
			class="viewport-sheet overflow-y-auto rounded-t-3xl"
			showCloseButton={false}
		>
			<div class="mx-auto flex w-full max-w-md flex-col">
				<Sheet.Header class="flex-row items-center gap-3 px-5 pt-5 pb-3">
					<img src={favicon} alt="" class="size-10 shrink-0" />
					<div class="flex min-w-0 flex-col gap-1">
						<Sheet.Title>Install Campus Connect</Sheet.Title>
						<Sheet.Description>Internet connection required.</Sheet.Description>
					</div>
				</Sheet.Header>
				<div class="flex flex-col gap-2 px-5">
					{#if installation.platform === 'ios'}
						<p>
							Tap <HugeiconsIcon icon={Share03Icon} class="inline size-4 align-text-bottom" />
							<strong>Share → Add to Home Screen → Add</strong>. Keep
							<strong>Open as Web App</strong> on if shown.
						</p>
					{:else if installation.pending}
						<p>Confirm installation in your browser.</p>
					{:else if installation.prompt}
						<p>Tap <strong>Install app</strong>, then confirm.</p>
					{:else}
						<p>
							Open the browser menu → <strong>Add to home screen</strong> or
							<strong>Install app</strong>.
						</p>
					{/if}
					{#if installation.error}<p role="alert">{installation.error}</p>{/if}
				</div>
				<Sheet.Footer class="gap-2 px-5 pt-4 pb-5">
					{#if installation.prompt || installation.pending}
						<Button
							class="min-h-11"
							disabled={installation.pending}
							onclick={() => installation.install()}>Install app</Button
						>
					{/if}
					<Sheet.Close class={buttonVariants({ variant: 'outline', class: 'min-h-11' })}
						>Done</Sheet.Close
					>
				</Sheet.Footer>
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}
