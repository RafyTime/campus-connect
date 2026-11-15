<script lang="ts">
	import { mode } from 'mode-watcher';
	import { Button } from '#lib/components/ui/button/index.js';

	let { label, latitude, longitude }: { label: string; latitude: number; longitude: number } =
		$props();
	let element: HTMLDivElement;
	let phase = $state<'loading' | 'ready' | 'error'>('loading');
	// Retry rebuilds the map in place; a page reload would discard unsaved Event form input.
	let attempt = $state(0);
	// Vite never re-inserts a stylesheet link it already added, even one that failed to load.
	let failedStylesheets: HTMLLinkElement[] = [];
	// The next attempt succeeds only once every re-requested stylesheet has loaded.
	let stylesheetsReloaded: Promise<unknown> = Promise.resolve();
	function retry() {
		stylesheetsReloaded = Promise.all(failedStylesheets.map(requestAgain));
		failedStylesheets = [];
		attempt++;
	}
	function requestAgain(failed: HTMLLinkElement) {
		const link = document.createElement('link');
		for (const { name, value } of failed.attributes) link.setAttribute(name, value);
		const loaded = new Promise((resolve, reject) => {
			link.addEventListener('load', resolve);
			link.addEventListener('error', () => reject(new Error(`Stylesheet ${link.href} failed`)));
		});
		failed.replaceWith(link);
		return loaded;
	}
	// Link load errors do not bubble, so they are only observable while capturing.
	function noteFailedStylesheet(event: Event) {
		if (event.target instanceof HTMLLinkElement && event.target.rel === 'stylesheet')
			failedStylesheets.push(event.target);
	}

	$effect(() => {
		// Read `attempt` so Retry re-runs this effect.
		void attempt;
		const appearance = mode.current;
		if (!appearance) return;
		const location = { label, latitude, longitude };
		const container = element;
		let disposed = false;
		let cleanup: (() => void) | undefined;
		phase = 'loading';
		document.addEventListener('error', noteFailedStylesheet, true);
		const timeout = setTimeout(() => {
			if (!disposed) phase = 'error';
		}, 12_000);
		const fail = () => {
			clearTimeout(timeout);
			if (!disposed) phase = 'error';
		};
		void Promise.all([import('./event-map.js'), stylesheetsReloaded])
			.then(([{ createEventMap }]) => {
				if (disposed) return;
				cleanup = createEventMap(
					container,
					location,
					appearance,
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
			document.removeEventListener('error', noteFailedStylesheet, true);
			clearTimeout(timeout);
			cleanup?.();
		};
	});
</script>

<section aria-label="Location map" class="min-w-0 overflow-hidden rounded-lg border">
	<div
		bind:this={element}
		class="relative z-0 h-64 w-full bg-muted"
		role="group"
		style:background-color="var(--muted)"
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
			<Button variant="outline" class="min-h-11 self-start" onclick={retry}>Retry map</Button>
		{/if}
	</div>
</section>
<Button
	href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
	target="_blank"
	rel="noopener noreferrer"
	variant="outline"
	class="min-h-11 self-start">Open in Google Maps</Button
>
