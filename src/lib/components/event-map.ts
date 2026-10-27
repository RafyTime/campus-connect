import { icon, map, marker, tileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerUrl from 'leaflet/dist/images/marker-icon.png';
import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

// This entire module, including Leaflet's styles and images, loads only for mapped Locations.
export function createEventMap(
	element: HTMLDivElement,
	location: { label: string; latitude: number; longitude: number },
	onLoad: () => void,
	onError: () => void
) {
	const coordinates: [number, number] = [location.latitude, location.longitude];
	const instance = map(element, {
		center: coordinates,
		zoom: 16,
		zoomControl: false,
		attributionControl: false,
		keyboard: false,
		dragging: false,
		touchZoom: false,
		doubleClickZoom: false,
		scrollWheelZoom: false,
		boxZoom: false
	});
	marker(coordinates, {
		alt: location.label,
		keyboard: false,
		interactive: false,
		icon: icon({
			iconUrl: markerUrl,
			iconRetinaUrl: markerRetinaUrl,
			shadowUrl: markerShadowUrl,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			shadowSize: [41, 41]
		})
	}).addTo(instance);
	tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 })
		.on('tileload', onLoad)
		.on('tileerror', onError)
		.addTo(instance);
	const observer = new ResizeObserver(() => instance.invalidateSize());
	observer.observe(element);
	return () => {
		observer.disconnect();
		instance.remove();
	};
}
