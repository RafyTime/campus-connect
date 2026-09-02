import { createDb } from '../db/client';
import { systemClock } from '../clock';
import { seedPublicPersonalEvents } from '../seed';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const db = createDb(databaseUrl);

await seedPublicPersonalEvents(db, systemClock);
db.$client.close();
console.info('Seeded public personal Events.');
