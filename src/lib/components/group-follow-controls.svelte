<script lang="ts">
	import { onMount } from 'svelte';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import { followGroup, unfollowGroup } from '#lib/groups.remote.js';
	import type { PublicGroupDetail } from '#lib/public-group.js';
	import type { SessionUser } from '#lib/session-user.js';

	let {
		group,
		user,
		onUnauthenticated
	}: {
		group: PublicGroupDetail;
		user: SessionUser | null;
		onUnauthenticated: () => void;
	} = $props();

	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});
	let pending = $state(false);
	let failure = $state<'conflict' | 'unauthenticated' | 'server-failure' | null>(null);

	const managesGroup = $derived(
		group.viewerRole === 'owner' || group.viewerRole === 'representative'
	);
	const following = $derived(group.viewerRole === 'subscriber');
	const actionLabel = $derived(following ? 'Unfollow' : 'Follow');
	const failureMessage = $derived(
		failure === 'conflict'
			? 'You manage this Group, so you cannot follow or unfollow it.'
			: failure === 'server-failure'
				? 'Something went wrong. Try again.'
				: null
	);

	async function submit() {
		if (pending || managesGroup) return;

		if (!user) {
			failure = 'unauthenticated';
			onUnauthenticated();
			return;
		}

		pending = true;
		failure = null;

		try {
			const result = following ? await unfollowGroup(group.id) : await followGroup(group.id);

			if (result.ok) return;

			if (result.reason === 'role-restricted') {
				failure = 'conflict';
				return;
			}

			if (result.reason === 'unauthenticated') {
				failure = 'unauthenticated';
				onUnauthenticated();
				return;
			}

			failure = 'server-failure';
		} catch {
			failure = 'server-failure';
		} finally {
			pending = false;
		}
	}
</script>

<div class="flex min-h-24 flex-col gap-2">
	{#if managesGroup}
		<p class="text-sm text-muted-foreground">
			You manage this Group, so you cannot follow or unfollow it.
		</p>
	{:else}
		<Button
			class="min-h-11 min-w-36"
			variant={following ? 'outline' : 'default'}
			disabled={!hydrated || pending}
			aria-busy={pending}
			onclick={submit}
		>
			{#if pending}
				<Spinner role="presentation" aria-hidden="true" />
			{/if}
			{actionLabel}
		</Button>
	{/if}

	<div class="min-h-12" aria-live="polite">
		{#if pending}
			<p class="sr-only">Updating follow state</p>
		{:else if failureMessage}
			<Alert.Root variant="destructive">
				<Alert.Title>Could not update follow state</Alert.Title>
				<Alert.Description>{failureMessage}</Alert.Description>
			</Alert.Root>
		{/if}
	</div>
</div>
