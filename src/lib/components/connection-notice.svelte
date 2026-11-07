<script lang="ts">
	import {
		WifiDisconnected01Icon,
		CheckmarkCircle01Icon,
		Alert02Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { getConnectivity } from '#lib/connectivity.svelte.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	const connection = getConnectivity();
</script>

<div role="status" aria-label="Connection" aria-live="polite">
	{#if !connection.online || connection.reconnected}
		<div class="border-b bg-secondary text-secondary-foreground">
			<div class="safe-inline mx-auto flex w-full max-w-5xl items-center gap-2.5 px-4 py-3 text-sm">
				<HugeiconsIcon
					icon={connection.online ? CheckmarkCircle01Icon : WifiDisconnected01Icon}
					class="size-5 shrink-0"
					aria-hidden="true"
				/>
				<p>
					{connection.online
						? 'Back online.'
						: "You're offline. Displayed information may be out of date. Changes need a connection."}
				</p>
			</div>
		</div>
	{/if}
</div>
{#if connection.blockedSubmission}
	<div class="safe-inline mx-auto w-full max-w-5xl px-4 pt-3">
		<Alert.Root variant="destructive">
			<HugeiconsIcon icon={Alert02Icon} aria-hidden="true" />
			<Alert.Title>Nothing was submitted</Alert.Title>
			<Alert.Description
				>Your form is still here. Reconnect and submit when you're ready.</Alert.Description
			>
		</Alert.Root>
	</div>
{/if}
