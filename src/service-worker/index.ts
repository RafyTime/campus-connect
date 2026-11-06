import { self } from '$app/service-worker';
import { version } from '$app/env';
import { immutable } from '$app/manifest';
import offlinePage from '../lib/offline.html?raw';

const prefix = 'campus-connect-shell-';
const cacheName = `${prefix}${version}`;
const assets = new Set(immutable.map(({ path }) => `/${path}`));
const offlinePath = '/offline.html';

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(cacheName).then(async (cache) => {
			await cache.addAll([...assets]);
			await cache.put(
				offlinePath,
				new Response(offlinePage, {
					headers: { 'Content-Type': 'text/html; charset=utf-8' }
				})
			);
		})
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			// Keep older immutable assets while any loaded tab might still import them.
			// A natural activation with no open clients can reclaim previous releases.
			const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
			if (clients.length === 0) {
				for (const key of await caches.keys()) {
					if (key.startsWith(prefix) && key !== cacheName) await caches.delete(key);
				}
			}
			await self.clients.claim();
		})()
	);
});

self.addEventListener('message', (event) => {
	if (event.data?.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);
	if (request.method !== 'GET' || url.origin !== self.location.origin) return;
	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request).catch(async () => {
				const cache = await caches.open(cacheName);
				const fallback = await cache.match(offlinePath);
				return fallback ?? Response.error();
			})
		);
	} else if (url.pathname.startsWith('/_app/immutable/')) {
		// Only build assets are cached. HTML, API responses, maps and Event data stay online.
		event.respondWith(
			(async () => {
				const cached = await caches.match(request);
				return cached ?? fetch(request);
			})()
		);
	}
});
