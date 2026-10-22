<script lang="ts">
	import { cancelManagedEvent } from '#lib/events.remote.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	let { eventId }: { eventId: string } = $props();
	let confirming = $state(false);
	let pending = $state(false);
	let message = $state('');
	async function cancel() {
		if (pending) return;
		pending = true;
		message = '';
		try {
			const result = await cancelManagedEvent(eventId);
			if (!result.ok) {
				const messages = {
					unauthenticated: 'Sign in to cancel this Event.',
					forbidden: 'You do not have permission to cancel this Event.',
					'not-found': 'This Event no longer exists.',
					cancelled: 'This Event is already cancelled. Cancellation is final.',
					ended: 'This Event has ended and is read-only.',
					unavailable: 'Could not cancel the Event. Try again.',
					invalid: 'Invalid Event.',
					'locked-fields': 'This Event is locked.',
					'capacity-conflict': 'Capacity conflict.'
				};
				message = messages[result.reason];
			}
		} catch {
			message = 'Could not cancel the Event. Try again.';
		} finally {
			pending = false;
		}
	}
</script>

<section class="flex flex-col gap-3" aria-label="Event cancellation" aria-busy={pending}>
	{#if confirming}
		<Alert.Root>
			<Alert.Title>Cancel this Event permanently?</Alert.Title>
			<Alert.Description
				>The Event will leave Discover. Its details and Participation will remain in history.
				Cancellation is final.</Alert.Description
			>
		</Alert.Root>
		<div class="flex flex-col gap-3 sm:flex-row">
			<Button variant="destructive" class="min-h-11" disabled={pending} onclick={cancel}
				>{pending ? 'Cancelling…' : 'Confirm cancellation'}</Button
			>
			<Button
				variant="outline"
				class="min-h-11"
				disabled={pending}
				onclick={() => (confirming = false)}>Keep Event</Button
			>
		</div>
	{:else}
		<Button variant="destructive" class="min-h-11 self-start" onclick={() => (confirming = true)}
			>Cancel Event</Button
		>
	{/if}
	{#if message}<p role="alert" class="text-sm text-destructive">{message}</p>{/if}
</section>
