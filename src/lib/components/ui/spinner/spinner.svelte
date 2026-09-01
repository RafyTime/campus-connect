<script lang="ts">
	import { Loading03Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		role = 'status',
		'aria-hidden': ariaHidden
	}: {
		class?: string;
		role?: string | null;
		'aria-hidden'?: boolean | 'true' | 'false' | null;
	} = $props();
</script>

<span {role} aria-hidden={ariaHidden}>
	{#if role === 'status' && !ariaHidden}
		<span class="sr-only">Loading</span>
	{/if}
	<HugeiconsIcon
		icon={Loading03Icon}
		strokeWidth={2}
		class={cn('size-4 animate-spin', className)}
	/>
</span>
