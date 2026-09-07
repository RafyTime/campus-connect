import { error } from '@sveltejs/kit';
import { query } from '$app/server';
import { systemClock } from '$lib/server/clock';
import {
	getPublicGroup,
	listPublicGroups as listPublicGroupsFromApplication
} from '$lib/server/application/groups';
import { getDb } from '$lib/server/db';

export const listPublicGroups = query(async () => {
	return listPublicGroupsFromApplication(getDb());
});

export const loadPublicGroup = query('unchecked', async (groupId: string) => {
	if (typeof groupId !== 'string' || groupId.length === 0) {
		error(404, 'Page not found');
	}

	const record = await getPublicGroup(getDb(), systemClock, groupId);

	if (!record) {
		error(404, 'Page not found');
	}

	return record;
});
