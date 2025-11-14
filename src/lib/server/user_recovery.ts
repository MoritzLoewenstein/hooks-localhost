import { prisma } from './db.js';
import { token } from './util/token.js';
import argon2 from 'argon2';

export async function createRecoveryCodes(user_id: string): Promise<string[]> {
	await prisma.userRecoveryCode.deleteMany({
		where: { userId: user_id }
	});

	const recovery_codes = Array.from({ length: 5 }, () => token());
	const recovery_codes_hash = await Promise.all(recovery_codes.map((code) => argon2.hash(code)));

	await prisma.userRecoveryCode.createMany({
		data: recovery_codes_hash.map((code) => ({
			userId: user_id,
			code
		}))
	});

	return recovery_codes;
}

export async function getRecoveryCodeCount(user_id: string): Promise<number> {
	return await prisma.userRecoveryCode.count({
		where: { userId: user_id }
	});
}

export async function useRecoveryCode(email: string, code: string): Promise<string | false> {
	const recovery_codes = await prisma.userRecoveryCode.findMany({
		where: {
			user: { email }
		},
		select: { userId: true, code: true }
	});

	for (const { userId, code: hashed_code } of recovery_codes) {
		const valid = await argon2.verify(hashed_code, code);
		if (valid) {
			await prisma.userRecoveryCode.delete({
				where: {
					userId_code: {
						userId,
						code: hashed_code
					}
				}
			});
			return userId;
		}
	}
	return false;
}
