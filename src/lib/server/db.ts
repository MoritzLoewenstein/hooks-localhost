import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

const dbUrl = building ? ':memory:' : env.DATABASE_URL;
const adapter = new PrismaBetterSQLite3({
	url: dbUrl
});
const prisma = new PrismaClient({
	adapter,
	log: ['error']
});

async function getDbBackup(): Promise<Buffer | null> {
	return Promise.resolve(null);
}

export { prisma, getDbBackup };
