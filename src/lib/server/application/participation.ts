import { and, asc, eq } from 'drizzle-orm';
import type { Database } from '#lib/server/db/index.js';
import type { Clock } from '#lib/server/clock.js';
import { event, participation } from '#lib/server/db/schema.js';
import { getPublicEvent } from './events';

type Actor = { id: string } | null;
export type InterestResult =
	| { ok: true; interested: boolean }
	| {
			ok: false;
			reason: 'unauthenticated' | 'forbidden' | 'not-available' | 'response-mode' | 'unavailable';
	  };

export async function getInterestState(db: Database, clock: Clock, actor: Actor, eventId: string) {
	const row = await db.query.event.findFirst({
		where: eq(event.id, eventId),
		with: { post: true }
	});
	const record = actor
		? await db
				.select()
				.from(participation)
				.where(and(eq(participation.eventId, eventId), eq(participation.userId, actor.id)))
				.get()
		: undefined;
	return {
		interested: record?.kind === 'interest',
		author: Boolean(actor && row?.post.authorId === actor.id),
		available: Boolean(
			row && row.visibility === 'public' && row.status === 'scheduled' && row.endsAt > clock.now()
		)
	};
}

/** A write transaction keeps response-mode and status checks consistent with the mutation. */
export async function setInterest(
	db: Database,
	clock: Clock,
	actor: Actor,
	eventId: string,
	interested: boolean
): Promise<InterestResult> {
	if (!actor) return { ok: false, reason: 'unauthenticated' };
	try {
		return await db.withTransaction(async (tx) => {
			const row = await tx.query.event.findFirst({
				where: eq(event.id, eventId),
				with: { post: true }
			});
			if (
				!row ||
				row.visibility !== 'public' ||
				row.status !== 'scheduled' ||
				row.endsAt <= clock.now()
			)
				return { ok: false, reason: 'not-available' };
			if (row.post.authorId === actor.id) return { ok: false, reason: 'forbidden' };
			if (row.responseMode !== 'interest') return { ok: false, reason: 'response-mode' };
			if (interested) {
				await tx
					.insert(participation)
					.values({ userId: actor.id, eventId, kind: 'interest', createdAt: clock.now() })
					.onConflictDoNothing();
			} else {
				await tx
					.delete(participation)
					.where(
						and(
							eq(participation.userId, actor.id),
							eq(participation.eventId, eventId),
							eq(participation.kind, 'interest')
						)
					);
			}
			return { ok: true, interested };
		});
	} catch {
		return { ok: false, reason: 'unavailable' };
	}
}

export async function listMyActivity(db: Database, clock: Clock, actor: Actor) {
	if (!actor) return [];
	const records = await db
		.select({ eventId: participation.eventId })
		.from(participation)
		.innerJoin(event, eq(event.id, participation.eventId))
		.where(and(eq(participation.userId, actor.id), eq(participation.kind, 'interest')))
		.orderBy(asc(event.startsAt));
	const events = await Promise.all(
		records.map((record) => getPublicEvent(db, clock, record.eventId))
	);
	return events.filter((event) => event !== null);
}
