<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import favicon from '#lib/assets/favicon.svg';
	let {
		label,
		title,
		description,
		dismissLabel,
		ondismiss,
		children
	}: {
		label: string;
		title: string;
		description: string;
		dismissLabel: string;
		ondismiss: () => void;
		children: Snippet;
	} = $props();
</script>

<aside aria-label={label} class="border-b bg-secondary text-secondary-foreground">
	<div class="safe-inline mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
		<div class="flex min-w-0 flex-1 items-center gap-2.5">
			<img src={favicon} alt="" class="size-9 shrink-0" />
			<div class="flex min-w-0 flex-col gap-0.5">
				<p class="text-sm font-medium">{title}</p>
				<p class="text-xs leading-4">{description}</p>
			</div>
		</div>
		<div class="flex shrink-0 items-center gap-1">
			{@render children()}
			<Button
				variant="ghost"
				size="icon"
				class="size-11"
				aria-label={dismissLabel}
				onclick={ondismiss}><HugeiconsIcon icon={Cancel01Icon} /></Button
			>
		</div>
	</div>
</aside>
