<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';

	let { label, latitude, longitude }: { label: string; latitude: number; longitude: number } =
		$props();
	let element: HTMLDivElement;
	let phase = $state<'loading' | 'ready' | 'error'>('loading');

	$effect(() => {
		const location = { label, latitude, longitude };
		const container = element;
		let disposed = false;
		let cleanup: (() => void) | undefined;
		phase = 'loading';
		const timeout = setTimeout(() => {
			if (!disposed) phase = 'error';
		}, 12_000);
		const fail = () => {
			clearTimeout(timeout);
			if (!disposed) phase = 'error';
		};
		void import('./event-map.js')
			.then(({ createEventMap }) => {
				if (disposed) return;
				cleanup = createEventMap(
					container,
					location,
					() => {
						clearTimeout(timeout);
						if (!disposed && phase !== 'error') phase = 'ready';
					},
					fail
				);
			})
			.catch(fail);
		return () => {
			disposed = true;
			clearTimeout(timeout);
			cleanup?.();
		};
	});
</script>

<section aria-label="Location map" class="min-w-0 overflow-hidden rounded-lg border">
	<div
		bind:this={element}
		class="relative z-0 h-64 w-full bg-muted"
		aria-label={`Map showing ${label}`}
	></div>
	<div class="flex flex-col gap-2 border-t bg-background p-3 text-sm">
		<p class="text-xs text-muted-foreground">
			<a class="underline underline-offset-4" href="https://openfreemap.org/">OpenFreeMap</a> · ©
			<a class="underline underline-offset-4" href="https://openmaptiles.org/">OpenMapTiles</a>
			· Data from
			<a class="underline underline-offset-4" href="https://www.openstreetmap.org/copyright"
				>OpenStreetMap</a
			>
		</p>
		{#if phase === 'loading'}
			<p role="status" class="text-muted-foreground">Loading map…</p>
		{:else if phase === 'error'}
			<p role="status">
				The map is unavailable. You can still use the Location label above and all Event details.
			</p>
			<Button variant="outline" class="min-h-11 self-start" onclick={() => window.location.reload()}
				>Retry map</Button
			>
		{/if}
	</div>
</section>
