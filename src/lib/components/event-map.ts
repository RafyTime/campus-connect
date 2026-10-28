import { divIcon, map, marker } from 'leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const defaultZoom = 16;

// The renderer, worker and styles load only for mapped Locations.
export function createEventMap(
	element: HTMLDivElement,
	location: { label: string; latitude: number; longitude: number },
	onLoad: () => void,
	onError: () => void
) {
	const coordinates: [number, number] = [location.latitude, location.longitude];
	const instance = map(element, {
		center: coordinates,
		// The bridge subtracts one level because MapLibre uses a 512px tile grid.
		zoom: defaultZoom + 1,
		zoomControl: false,
		attributionControl: false,
		keyboard: false,
		dragging: false,
		touchZoom: false,
		doubleClickZoom: false,
		scrollWheelZoom: false,
		boxZoom: false
	});
	const markerElement = document.createElement('span');
	markerElement.className =
		'block size-6 rounded-full border-3 border-background bg-primary shadow-md';
	markerElement.setAttribute('role', 'img');
	markerElement.setAttribute('aria-label', location.label);
	marker(coordinates, {
		keyboard: false,
		interactive: false,
		icon: divIcon({
			html: markerElement,
			className: '',
			iconSize: [24, 24],
			iconAnchor: [12, 12]
		})
	}).addTo(instance);
	try {
		setWorkerUrl(workerUrl);
		const layer = maplibreGL({
			style: 'https://tiles.openfreemap.org/styles/positron',
			interactive: false,
			attributionControl: false,
			renderWorldCopies: false
		}).addTo(instance);
		const renderer = layer.getMaplibreMap();
		renderer.on('error', onError);
		renderer.once('load', onLoad);
		const observer = new ResizeObserver(() => instance.invalidateSize());
		observer.observe(element);
		return () => {
			observer.disconnect();
			instance.remove();
		};
	} catch (error) {
		instance.remove();
		throw error;
	}
}
