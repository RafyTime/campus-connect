import { describe, expect, it, vi } from 'vitest';
import type { Client, InStatement } from '@libsql/client';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { setImmediate } from 'node:timers/promises';
import { createDb } from '$lib/server/db/client';
import { applyMigrations } from '$lib/server/db/migrate';
import { createTestDatabase } from '$lib/server/testing/database';
import { createTestClock } from '$lib/server/testing/clock';
import { insertGroup, insertUser } from '$lib/server/fixtures';
import { group, groupMembership } from '$lib/server/db/schema';
import {
	createGroup,
	editGroup,
	followGroup,
	getPublicGroup,
	listPublicGroups,
	unfollowGroup
} from './groups';

// Control scheduling at the SQL driver boundary while using real application operations.
const clients = vi.hoisted(() => [] as Client[]);
vi.mock('@libsql/client', async (importOriginal) => {
	const original = await importOriginal<typeof import('@libsql/client')>();
	return {
		...original,
		createClient: (...args: Parameters<typeof original.createClient>) => {
			const client = original.createClient(...args);
			clients.push(client);
			return client;
		}
	};
});

function pauseOwnerInsertion(client: Client) {
	let insertedGroupId = '';
	let signalPaused!: () => void;
	let release!: () => void;
	const paused = new Promise<void>((resolve) => (signalPaused = resolve));
	const released = new Promise<void>((resolve) => (release = resolve));
	const execute = client.execute.bind(client);
	const spy = vi.spyOn(client, 'execute').mockImplementation(async (statement: InStatement) => {
		const sql = typeof statement === 'string' ? statement : statement.sql;
		if (
			sql.startsWith('insert into "group_membership"') &&
			typeof statement !== 'string' &&
			Array.isArray(statement.args) &&
			statement.args[2] === 'owner'
		) {
			if (typeof statement !== 'string' && Array.isArray(statement.args)) {
				insertedGroupId = String(statement.args[1]);
			}
			signalPaused();
			await released;
		}
		return execute(statement);
	});
	return {
		paused,
		release,
		spy,
		get groupId() {
			return insertedGroupId;
		}
	};
}

const owner = { id: 'owner', name: 'Group Owner', email: 'owner@example.com' };
const details = { name: 'Students Club', description: 'A place for campus students to meet.' };
const clock = createTestClock('2026-09-01T08:00:00.000Z');

async function removeTestDatabase(directory: string) {
	// libsql's native statements can retain Windows file handles until collection.
	// Collect only in this disposable test helper, after the client has closed.
	if (process.platform === 'win32') {
		setFlagsFromString('--expose-gc');
		const collect = runInNewContext('gc') as () => void;
		setFlagsFromString('--no-expose-gc');
		collect();
		await setImmediate();
	}
	await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
}

async function testDatabase(storage: 'memory' | 'file') {
	if (storage === 'memory') return createTestDatabase();
	const testResults = join(process.cwd(), 'test-results');
	mkdirSync(testResults, { recursive: true });
	const directory = mkdtempSync(join(testResults, 'transactions-'));
	const url = pathToFileURL(join(directory, 'test.db')).href;
	const db = createDb(url);
	try {
		await applyMigrations(db);
	} catch (error) {
		db.$client.close();
		await removeTestDatabase(directory);
		throw error;
	}
	return {
		db,
		url,
		async [Symbol.asyncDispose]() {
			db.$client.close();
			await removeTestDatabase(directory);
		}
	};
}

describe.each(['memory', 'file'] as const)(
	'Group transaction isolation with %s SQLite',
	(storage) => {
		it('keeps concurrent public directory and detail reads consistent during creation', async () => {
			await using database = await testDatabase(storage);
			await insertUser(database.db, clock, owner);
			const pause = pauseOwnerInsertion(clients.at(-1)!);
			const creation = createGroup(database.db, clock, owner, details);
			await pause.paused;
			try {
				// Attach assertions before releasing creation so the old failure is observed.
				const directory = expect(listPublicGroups(database.db)).resolves.toEqual([
					expect.objectContaining({
						name: details.name,
						owner: { id: owner.id, displayName: owner.name }
					})
				]);
				const detail = expect(
					getPublicGroup(database.db, clock, pause.groupId)
				).resolves.toMatchObject({
					name: details.name,
					owner: { id: owner.id, displayName: owner.name }
				});
				pause.release();
				await Promise.all([directory, detail]);
				await expect(creation).resolves.toMatchObject({ ok: true });
			} finally {
				pause.release();
				await creation;
				pause.spy.mockRestore();
			}
		});

		it('rolls back failed ownership without discarding overlapping creation, editing, follow or unfollow', async () => {
			await using database = await testDatabase(storage);
			const subscriber = { id: 'subscriber', name: 'Subscriber', email: 'subscriber@example.com' };
			const newSubscriber = {
				id: 'new-subscriber',
				name: 'New Subscriber',
				email: 'new-subscriber@example.com'
			};
			await insertGroup(database.db, clock, {
				id: 'existing',
				...details,
				owner,
				subscribers: [subscriber]
			});
			await insertUser(database.db, clock, newSubscriber);
			const pause = pauseOwnerInsertion(clients.at(-1)!);
			const failed = createGroup(
				database.db,
				clock,
				{ id: 'missing-user' },
				{ ...details, name: 'Failed Club' }
			);
			await pause.paused;
			const failedGroupId = pause.groupId;
			const created = createGroup(database.db, clock, owner, {
				...details,
				name: 'Successful Club'
			});
			const edited = editGroup(database.db, clock, owner, 'existing', {
				...details,
				name: 'Edited Club'
			});
			const followed = followGroup(database.db, newSubscriber, 'existing');
			const unfollowed = unfollowGroup(database.db, subscriber, 'existing');
			const requests = [failed, created, edited, followed, unfollowed];
			try {
				pause.release();
				const [failure, creation, edit, follow, unfollow] = await Promise.all(requests);
				expect(failure).toEqual({ ok: false, reason: 'unavailable' });
				expect(creation).toMatchObject({ ok: true });
				expect(edit).toEqual({ ok: true, groupId: 'existing' });
				expect(follow).toEqual({ ok: true, following: true, subscriberCount: 2 });
				expect(unfollow).toEqual({ ok: true, following: false, subscriberCount: 1 });
				expect((await listPublicGroups(database.db)).map((row) => row.name)).toEqual([
					'Edited Club',
					'Successful Club'
				]);
				await expect(
					getPublicGroup(database.db, clock, 'existing', newSubscriber.id)
				).resolves.toMatchObject({ viewerRole: 'subscriber', subscriberCount: 1 });
				await expect(
					getPublicGroup(database.db, clock, 'existing', subscriber.id)
				).resolves.toMatchObject({ viewerRole: null });
				await expect(getPublicGroup(database.db, clock, failedGroupId)).resolves.toBeNull();
				expect(
					await database.db.query.groupMembership.findMany({
						where: (row, { eq }) => eq(row.groupId, failedGroupId)
					})
				).toEqual([]);
			} finally {
				pause.release();
				await Promise.all(requests);
				pause.spy.mockRestore();
			}
		});

		it('preserves successful requests when an overlapping edit fails', async () => {
			await using database = await testDatabase(storage);
			await insertGroup(database.db, clock, { id: 'existing', ...details, owner });
			const pause = pauseOwnerInsertion(clients.at(-1)!);
			const created = createGroup(database.db, clock, owner, {
				...details,
				name: 'Successful Club'
			});
			await pause.paused;
			const failed = editGroup(database.db, clock, owner, 'existing', {
				...details,
				name: 'Successful Club'
			});
			try {
				pause.release();
				await expect(created).resolves.toMatchObject({ ok: true });
				await expect(failed).resolves.toEqual({ ok: false, reason: 'name-taken' });
				expect((await listPublicGroups(database.db)).map((row) => row.name)).toEqual([
					'Students Club',
					'Successful Club'
				]);
			} finally {
				pause.release();
				await Promise.all([created, failed]);
				pause.spy.mockRestore();
			}
		});

		it('leaves neither a Group nor a membership after failed owner insertion', async () => {
			await using database = await testDatabase(storage);
			await expect(
				createGroup(database.db, clock, { id: 'missing-user' }, details)
			).resolves.toEqual({ ok: false, reason: 'unavailable' });
			await expect(listPublicGroups(database.db)).resolves.toEqual([]);
			expect(await database.db.select().from(group)).toEqual([]);
			expect(await database.db.select().from(groupMembership)).toEqual([]);
		});
	}
);

it('publishes complete ownership to another file-backed connection only after commit', async () => {
	await using database = await testDatabase('file');
	if (!('url' in database)) throw new Error('Expected a file-backed database');
	await insertUser(database.db, clock, owner);
	const pause = pauseOwnerInsertion(clients.at(-1)!);
	const reader = createDb(database.url);
	const creation = createGroup(database.db, clock, owner, details);
	await pause.paused;
	try {
		await expect(listPublicGroups(reader)).resolves.toEqual([]);
		await expect(getPublicGroup(reader, clock, pause.groupId)).resolves.toBeNull();
		pause.release();
		await expect(creation).resolves.toMatchObject({ ok: true });
		await expect(getPublicGroup(reader, clock, pause.groupId, owner.id)).resolves.toMatchObject({
			name: details.name,
			owner: { id: owner.id, displayName: owner.name },
			viewerRole: 'owner'
		});
	} finally {
		pause.release();
		await creation;
		pause.spy.mockRestore();
		reader.$client.close();
	}
});
