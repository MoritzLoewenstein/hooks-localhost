import { PrismaClient } from '../../../generated/prisma/client';
import { env } from '$env/dynamic/private';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const adapter = new PrismaBetterSqlite3({
	url: env.DATABASE_URL
});

export const prisma = new PrismaClient({
	adapter
});

class Db {
	#db: InstanceType<typeof Database> | null = null;
	init() {
		this.#db = new Database(env.DATABASE_URL.replace('file:', ''));
		this.#db.pragma('journal_mode = WAL');
	}
	getBackup() {
		return this.#db!.serialize();
	}
}
export const db = new Db();
