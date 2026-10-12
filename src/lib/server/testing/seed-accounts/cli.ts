import { createDb } from '../../db/client';
import { seedGroupEventTestAccounts } from '../seed-accounts';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set');
const db = createDb(databaseUrl);
try {
	// Repeating setup verifies that role credentials remain usable after an idempotent seed.
	await seedGroupEventTestAccounts(db);
	await seedGroupEventTestAccounts(db);
} finally {
	db.$client.close();
}
