<script lang="ts">
	import { updated } from '$app/state';
	import { getAppUpdates } from '#lib/app-updates.svelte.js';
	import AppBanner from './app-banner.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	const updates = getAppUpdates();
	let confirming = $state(false);
</script>

{#if (updates.available || updated.current) && !updates.dismissed}
	<AppBanner
		label="Update available"
		title="Update available"
		description="Refresh when you're ready."
		dismissLabel="Dismiss update banner"
		ondismiss={() => (updates.dismissed = true)}
	>
		<Button
			class="min-h-11 px-4"
			disabled={updates.pending}
			onclick={() => (updates.dirty ? (confirming = true) : void updates.refresh())}>Refresh</Button
		>
	</AppBanner>
{/if}
{#if updates.error}<p
		role="alert"
		class="safe-inline mx-auto w-full max-w-5xl px-4 py-3 text-sm text-destructive"
	>
		{updates.error}
	</p>{/if}
<Dialog.Root bind:open={confirming}>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Refresh and discard changes?</Dialog.Title>
			<Dialog.Description
				>Your form has unsaved changes. Refreshing will discard them.</Dialog.Description
			>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (confirming = false)}>Keep editing</Button>
			<Button
				disabled={updates.pending}
				onclick={() => {
					confirming = false;
					void updates.refresh();
				}}>Discard and refresh</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
