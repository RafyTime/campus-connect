<script lang="ts">
	import { UserGroupIcon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import * as Empty from '$lib/components/ui/empty';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<HugeiconsIcon icon={UserGroupIcon} />
		</Empty.Media>
		<Empty.Title>
			<h2 class="font-heading text-lg font-medium tracking-tight">No Groups yet</h2>
		</Empty.Title>
		<Empty.Description>
			Public Groups will appear here when creators publish them.
		</Empty.Description>
	</Empty.Header>
</Empty.Root>
