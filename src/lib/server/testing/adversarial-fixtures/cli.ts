import { systemClock } from '../../clock';
import { createDb } from '../../db/client';
import { seedAdversarialFixtures } from '../adversarial-fixtures';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set');
const db = createDb(databaseUrl);
try {
	await seedAdversarialFixtures(db, systemClock);
} finally {
	db.$client.close();
}
