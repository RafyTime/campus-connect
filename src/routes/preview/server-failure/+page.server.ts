import { error } from '@sveltejs/kit';

export function load() {
	error(500, 'Campus Connect could not complete this request.');
}
