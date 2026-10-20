<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import ProtectedActionDialog from '#lib/components/protected-action-dialog.svelte';
	import { changeInterest, loadInterestState } from '#lib/participation.remote.js';
	import type { SessionUser } from '#lib/session-user.js';

	let { eventId, user }: { eventId: string; user: SessionUser | null } = $props();
	const interest = $derived(await loadInterestState(eventId));
	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});
	let pending = $state(false);
	let promptOpen = $state(false);
	let message = $state('');
	let failure = $state('');
	const errors = {
		forbidden: 'You authored this Event, so you cannot participate.',
		'not-available': 'This Event is cancelled or no longer available for interest.',
		'response-mode': 'This Event no longer accepts interest.',
		unavailable: 'Could not update your interest. Try again.'
	} as const;
	async function submit() {
		if (pending) return;
		if (!user) {
			promptOpen = true;
			return;
		}
		pending = true;
		failure = '';
		message = '';
		try {
			const result = await changeInterest({ eventId, interested: !interest.interested });
			if (result.ok)
				message = result.interested
					? 'Interest saved. Find this Event in My activity.'
					: 'Interest withdrawn.';
			else if (result.reason === 'unauthenticated') promptOpen = true;
			else failure = errors[result.reason];
		} catch {
			failure = errors.unavailable;
		} finally {
			pending = false;
		}
	}
</script>

<section class="flex flex-col gap-3" aria-label="Event interest">
	{#if interest.author}
		<p class="text-sm text-muted-foreground">You authored this Event, so you cannot participate.</p>
	{:else if !interest.available}
		<p class="text-sm text-muted-foreground">
			This Event is cancelled or no longer available for interest.
		</p>
	{:else}
		<p class="text-sm text-muted-foreground">
			{interest.interested
				? 'You are interested. This does not reserve a place.'
				: 'Save your non-binding interest in this Event.'}
		</p>
		<Button
			class="min-h-11 w-full sm:w-fit"
			variant={interest.interested ? 'outline' : 'default'}
			disabled={!hydrated || pending}
			aria-busy={pending}
			onclick={submit}
		>
			{#if pending}<Spinner role="presentation" aria-hidden="true" />{/if}
			{interest.interested ? 'Withdraw interest' : 'Express interest'}
		</Button>
	{/if}
	<div aria-live="polite">
		{#if pending}<p role="status">Updating interest…</p>
		{:else if failure}<Alert.Root variant="destructive"
				><Alert.Title>Could not update interest</Alert.Title><Alert.Description
					>{failure}</Alert.Description
				></Alert.Root
			>
		{:else if message}<p class="text-sm">{message}</p>{/if}
	</div>
</section>
<ProtectedActionDialog bind:open={promptOpen} />
