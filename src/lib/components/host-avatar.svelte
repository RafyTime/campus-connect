<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';

	let {
		displayName,
		imageUrl,
		imageAttribution = null,
		initials,
		size = 'default'
	}: {
		displayName: string;
		imageUrl: string | null;
		imageAttribution?: string | null;
		initials: string;
		size?: 'default' | 'sm' | 'lg';
	} = $props();
</script>

<Avatar.Root {size}>
	{#if imageUrl}
		<Avatar.Image src={imageUrl} alt={displayName} title={imageAttribution ?? undefined} />
	{/if}
	<Avatar.Fallback>{initials}</Avatar.Fallback>
</Avatar.Root>
{#if imageAttribution}
	<span class="sr-only">Image credit: {imageAttribution}</span>
{/if}
