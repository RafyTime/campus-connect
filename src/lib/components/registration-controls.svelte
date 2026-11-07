<script lang="ts">
	import { onMount } from 'svelte';
	import { Alert02Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { getConnectivity } from '#lib/connectivity.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import ProtectedActionDialog from '#lib/components/protected-action-dialog.svelte';
	import { changeRegistration, loadRegistrationState } from '#lib/participation.remote.js';
	import type { SessionUser } from '#lib/session-user.js';

	let { eventId, user }: { eventId: string; user: SessionUser | null } = $props();
	const query = $derived(loadRegistrationState(eventId));
	// Retain the last confirmed state if a later recovery read fails.
	const registration = $derived(
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
			await loadRegistrationState(eventId).refresh();
			uncertain = false;
			failure = '';
			message = 'Current registration checked. Review the state before making another change.';
		} catch {
			failure = 'Could not check the current state. Reconnect and check again.';
		} finally {
			pending = false;
		}
	}
	const errors = {
		forbidden: 'You authored this Event, so you cannot participate.',
		'not-available': 'This Event is cancelled or no longer available for registration.',
		'response-mode': 'This Event no longer accepts registration.',
		full: 'This Event is full. No place was reserved. Check again later.',
		unavailable: 'Could not update your registration. Try again.'
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
			const result = await changeRegistration({ eventId, registered: !registration.registered });
			if (result.ok)
				message = result.registered
					? 'Registration confirmed. Find this Event in My activity.'
					: 'Registration cancelled.';
			else if (result.reason === 'unauthenticated') promptOpen = true;
			else failure = errors[result.reason];
		} catch {
			uncertain = true;
			failure =
				"We couldn't confirm your registration change. Check the current state before trying again.";
		} finally {
			pending = false;
		}
	}
</script>

<section class="flex flex-col gap-3" aria-label="Event registration">
	<p class="text-sm">
		Capacity: {registration.capacity}, {registration.confirmed} confirmed, {registration.remaining} remaining
	</p>
	{#if registration.registered}<p class="text-sm">
			You are registered. Your place is confirmed.
		</p>{/if}
	{#if registration.author}
		<p class="text-sm text-muted-foreground">You authored this Event, so you cannot participate.</p>
	{:else if !registration.available}
		<p class="text-sm text-muted-foreground">
			This Event is cancelled or no longer available for registration.
		</p>
	{:else}
		<p class="text-sm text-muted-foreground">
			{registration.registered
				? 'You can cancel your registration below.'
				: registration.remaining === 0
					? 'This Event is full.'
					: 'Register to reserve your place in this Event.'}
		</p>
		<Button
			class="min-h-11 w-full sm:w-fit"
			variant={registration.registered ? 'outline' : 'default'}
			disabled={!hydrated ||
				pending ||
				uncertain ||
				(!registration.registered && registration.remaining === 0)}
			aria-busy={pending}
			onclick={submit}
		>
			{#if pending}<Spinner role="presentation" aria-hidden="true" />{/if}
			{registration.registered
				? 'Cancel registration'
				: registration.remaining === 0
					? 'Full'
					: 'Register for Event'}
		</Button>
	{/if}
	<div aria-live="polite">
		{#if pending}<p role="status">Updating registration…</p>
		{:else if failure}<Alert.Root variant="destructive"
				><HugeiconsIcon icon={Alert02Icon} aria-hidden="true" /><Alert.Title
					>Could not update registration</Alert.Title
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
