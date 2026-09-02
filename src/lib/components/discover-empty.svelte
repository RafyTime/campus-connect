<script lang="ts">
	import { CompassIcon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import * as Empty from '$lib/components/ui/empty';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<HugeiconsIcon icon={CompassIcon} />
		</Empty.Media>
		<Empty.Title>
			<h2 class="font-heading text-lg font-medium tracking-tight">No upcoming Events</h2>
		</Empty.Title>
		<Empty.Description>
			Scheduled public Events will appear here when creators publish them.
		</Empty.Description>
	</Empty.Header>
</Empty.Root>
