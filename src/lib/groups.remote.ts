import { error, invalid, redirect } from '@sveltejs/kit';
import { command, form, getRequestEvent, query } from '$app/server';
import { systemClock } from '$lib/server/clock';
import {
	followGroup as followGroupFromApplication,
	createGroup as createGroupFromApplication,
	editGroup as editGroupFromApplication,
	getPublicGroup,
	listPublicGroups as listPublicGroupsFromApplication,
	unfollowGroup as unfollowGroupFromApplication
} from '$lib/server/application/groups';
import { getDb } from '$lib/server/db';
import type { GroupSaveResult } from '$lib/server/application/groups';

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

export const createGroupForm = form('unchecked', async (data) => {
	const result = await createGroupFromApplication(
		getDb(),
		systemClock,
		getRequestEvent().locals.user ?? null,
		data
	);
	if (!result.ok) groupSaveError(result);
	void listPublicGroups().refresh();
	redirect(303, `/groups/${result.groupId}`);
});

export const editGroupForm = form('unchecked', async (data) => {
	const groupId = typeof data.groupId === 'string' ? data.groupId : '';
	const result = await editGroupFromApplication(
		getDb(),
		systemClock,
		getRequestEvent().locals.user ?? null,
		groupId,
		data
	);
	if (!result.ok) groupSaveError(result);
	void loadPublicGroup(groupId).refresh();
	void listPublicGroups().refresh();
	redirect(303, `/groups/${result.groupId}`);
});

function groupSaveError(result: Extract<GroupSaveResult, { ok: false }>): never {
	if (result.reason === 'invalid') {
		invalid(
			...Object.entries(result.fieldErrors ?? {}).map(([field, message]) => ({
				path: [field],
				message
			}))
		);
	}
	if (result.reason === 'name-taken') {
		invalid({ path: ['name'], message: 'A Group already uses this name.' });
	}
	const messages = {
		unauthenticated: 'Sign in to manage Groups.',
		forbidden: 'Only the Group owner can edit its details.',
		'system-managed': 'Campus Updates cannot be edited.',
		'not-found': 'This Group no longer exists.',
		unavailable: 'Could not save the Group. Try again.'
	} as const;
	invalid(messages[result.reason]);
}

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
