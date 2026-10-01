import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type Client } from '@libsql/client';
import * as schema from './schema';

export function createDb(url: string) {
	const client = createClient({ url });
	let pending: Promise<unknown> = Promise.resolve();
	function exclusively<T>(work: () => Promise<T>): Promise<T> {
		const result = pending.then(work);
		pending = result.catch(() => {});
		return result;
	}

	// Every ordinary statement waits for a transaction to commit or roll back.
	// Keeping one connection also preserves private in-memory databases.
	const queuedClient = new Proxy(client, {
		get(target, property) {
			const value = Reflect.get(target, property);
			if (typeof value !== 'function') return value;
			if (['execute', 'batch', 'migrate', 'executeMultiple', 'sync'].includes(String(property))) {
				return (...args: unknown[]) => exclusively(() => value.apply(target, args));
			}
			return value.bind(target);
		}
	});
	const db = connect(queuedClient);
	const transactionDb = connect(client);
	return Object.assign(db, {
		withTransaction<T>(work: (tx: ReturnType<typeof connect>) => Promise<T>): Promise<T> {
			return exclusively(async () => {
				await client.execute('BEGIN IMMEDIATE');
				try {
					const result = await work(transactionDb);
					await client.execute('COMMIT');
					return result;
				} catch (error) {
					try {
						await client.execute('ROLLBACK');
					} catch {
						// Preserve the operation's error if rollback also fails.
					}
					throw error;
				}
			});
		}
	});
}

function connect(client: Client) {
	return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
