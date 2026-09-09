import { error } from '@sveltejs/kit';
import { command, getRequestEvent, query } from '$app/server';
import { systemClock } from '$lib/server/clock';
import {
	followGroup as followGroupFromApplication,
	getPublicGroup,
	listPublicGroups as listPublicGroupsFromApplication,
	unfollowGroup as unfollowGroupFromApplication
} from '$lib/server/application/groups';
import { getDb } from '$lib/server/db';

export const listPublicGroups = query(async () => {
	return listPublicGroupsFromApplication(getDb());
});

export const loadPublicGroup = query('unchecked', async (groupId: string) => {
	if (typeof groupId !== 'string' || groupId.length === 0) {
		error(404, 'Page not found');
	}

	const record = await getPublicGroup(
		getDb(),
		systemClock,
		groupId,
		getRequestEvent().locals.user?.id
	);

	if (!record) {
		error(404, 'Page not found');
	}

	return record;
});

export const followGroup = command('unchecked', async (groupId: unknown) => {
	return mutateFollow(groupId, followGroupFromApplication);
});

export const unfollowGroup = command('unchecked', async (groupId: unknown) => {
	return mutateFollow(groupId, unfollowGroupFromApplication);
});

async function mutateFollow(groupId: unknown, mutate: typeof followGroupFromApplication) {
	if (typeof groupId !== 'string' || groupId.length === 0) {
		error(400, 'Invalid Group');
	}

	const result = await mutate(getDb(), getRequestEvent().locals.user ?? null, groupId);

	if (result.ok) {
		void loadPublicGroup(groupId).refresh();
		void listPublicGroups().refresh();
	}

	return result;
}
