import { PrismaClient } from '../../../generated/prisma/client';
import { env } from '$env/dynamic/private';

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: env.DATABASE_URL
		}
	}
});

async function getDbBackup(): Promise<Buffer | null> {
	return Promise.resolve(null);
}

export { prisma, getDbBackup };
