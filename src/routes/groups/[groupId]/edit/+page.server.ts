import { error, redirect } from '@sveltejs/kit';
import { authenticationHref } from '$lib/auth-paths';
import { getDb } from '$lib/server/db';
import { getPublicGroup } from '$lib/server/application/groups';
import { systemClock } from '$lib/server/clock';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(303, authenticationHref('/sign-in', `/groups/${params.groupId}/edit`));
	const group = await getPublicGroup(getDb(), systemClock, params.groupId, locals.user.id);
	if (!group) error(404, 'Group not found');
	if (group.systemManaged || group.viewerRole !== 'owner')
		error(403, 'Only the Group owner can edit its details.');
	return { groupId: group.id, name: group.name, description: group.description };
};
