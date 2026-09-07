<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card';
	import HostAvatar from '$lib/components/host-avatar.svelte';
	import { subscriberCountLabel } from '$lib/group-labels';
	import type { PublicGroupSummary } from '$lib/public-group';

	let { group }: { group: PublicGroupSummary } = $props();
</script>

<a
	href={resolve('/groups/[groupId]', { groupId: group.id })}
	class="block h-full rounded-[min(var(--radius-4xl),24px)] focus-visible:ring-3 focus-visible:ring-ring/30"
>
	<Card.Root class="flex h-full flex-col">
		<Card.Header>
			<div class="flex items-start gap-3">
				<HostAvatar
					displayName={group.name}
					imageUrl={group.imageUrl}
					imageAttribution={group.imageAttribution}
					initials={group.initials}
				/>
				<div class="min-w-0">
					<Card.Title>
						<h2 class="font-heading text-base font-medium">{group.name}</h2>
					</Card.Title>
					<Card.Description>{subscriberCountLabel(group.subscriberCount)}</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="flex flex-1 flex-col gap-2">
			<p class="text-sm text-muted-foreground">{group.description}</p>
			<p class="mt-auto text-sm">
				<span class="text-muted-foreground">Owner</span>
				{group.owner.displayName}
			</p>
		</Card.Content>
	</Card.Root>
</a>
