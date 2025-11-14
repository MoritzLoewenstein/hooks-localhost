import { ulid } from 'ulid';
import argon2 from 'argon2';
import { prisma } from './db.js';

export interface User {
	id: string;
	email: string;
	is_admin?: boolean;
}

interface UserWithFirstLogin extends User {
	first_login: boolean;
}

export async function isFirstUser(): Promise<boolean> {
	const user_count = await prisma.user.count();
	return user_count === 0;
}

export async function createFirstUser(email: string, password: string): Promise<User> {
	const user_id = ulid();
	const hashed_password = await argon2.hash(password);

	const user_count = await prisma.user.count();
	if (user_count !== 0) {
		throw new Error('First user already exists');
	}

	await prisma.user.create({
		data: {
			id: user_id,
			email,
			password: hashed_password,
			isAdmin: true
		}
	});

	return {
		id: user_id,
		email,
		is_admin: true
	};
}

export async function createUser(email: string, password: string): Promise<User> {
	const user_id = ulid();
	const hashed_password = await argon2.hash(password);

	await prisma.user.create({
		data: {
			id: user_id,
			email,
			password: hashed_password
		}
	});

	return {
		id: user_id,
		email
	};
}

export async function getUser(user_id: string): Promise<User | null> {
	const user = await prisma.user.findUnique({
		where: { id: user_id },
		select: { id: true, email: true, isAdmin: true }
	});

	if (!user) return null;

	return {
		id: user.id,
		email: user.email,
		is_admin: user.isAdmin
	};
}

export async function updateUserPassword(user_id: string, password: string): Promise<void> {
	const hashed_password = await argon2.hash(password);
	await prisma.user.update({
		where: { id: user_id },
		data: { password: hashed_password }
	});
}

export async function loginUser(
	email: string,
	password: string
): Promise<UserWithFirstLogin | false> {
	const firstLoginCutoff = new Date(Date.now() - 60 * 1000);

	const user = await prisma.user.findUnique({
		where: { email }
	});

	if (!user) {
		return false;
	}

	const valid = await argon2.verify(user.password, password);
	if (!valid) {
		return false;
	}

	return {
		id: user.id,
		email: user.email,
		is_admin: user.isAdmin,
		first_login: user.createdAt > firstLoginCutoff
	};
}
