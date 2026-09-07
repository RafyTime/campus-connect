import { createDb } from '../db/client';
import { systemClock } from '../clock';
import { seedCampusConnect } from '../seed';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const db = createDb(databaseUrl);

await seedCampusConnect(db, systemClock);
db.$client.close();
console.info('Seeded public Events and Groups.');
