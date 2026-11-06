<script lang="ts">
	import { onMount } from 'svelte';
	import { Alert02Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { getConnectivity } from '#lib/connectivity.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import ProtectedActionDialog from '#lib/components/protected-action-dialog.svelte';
	import { changeInterest, loadInterestState } from '#lib/participation.remote.js';
	import type { SessionUser } from '#lib/session-user.js';

	let { eventId, user }: { eventId: string; user: SessionUser | null } = $props();
	const query = $derived(loadInterestState(eventId));
	// Retain the last confirmed state if a later recovery read fails.
	const interest = $derived(
		await query.catch((error: unknown) => {
			if (query.current) return query.current;
			throw error;
		})
	);
	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});
	let pending = $state(false);
	let promptOpen = $state(false);
	let message = $state('');
	let failure = $state('');
	let uncertain = $state(false);
	const connection = getConnectivity();
	async function checkCurrentState() {
		if (pending || !connection.online) return;
		pending = true;
		try {
			await loadInterestState(eventId).refresh();
			uncertain = false;
			failure = '';
			message = 'Current interest checked. Review the state before making another change.';
		} catch {
			failure = 'Could not check the current state. Reconnect and check again.';
		} finally {
			pending = false;
		}
	}
	const errors = {
		forbidden: 'You authored this Event, so you cannot participate.',
		'not-available': 'This Event is cancelled or no longer available for interest.',
		'response-mode': 'This Event no longer accepts interest.',
		unavailable: 'Could not update your interest. Try again.'
	} as const;
	async function submit() {
		if (pending || uncertain) return;
		if (!connection.online) {
			message = '';
			failure = "You're offline. Nothing was submitted. Reconnect before trying again.";
			return;
		}
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
			uncertain = true;
			failure =
				"We couldn't confirm your interest change. Check the current state before trying again.";
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
			disabled={!hydrated || pending || uncertain}
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
				><HugeiconsIcon icon={Alert02Icon} aria-hidden="true" /><Alert.Title
					>Could not update interest</Alert.Title
				><Alert.Description>{failure}</Alert.Description></Alert.Root
			>
		{:else if message}<p class="text-sm">{message}</p>{/if}
	</div>
	{#if uncertain}
		<Button
			variant="outline"
			class="min-h-11 self-start"
			disabled={pending || !connection.online}
			onclick={checkCurrentState}>Check current state</Button
		>
	{/if}
</section>
<ProtectedActionDialog bind:open={promptOpen} />
