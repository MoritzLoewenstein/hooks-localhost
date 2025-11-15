import { getWebhookEndpoints } from '$lib/server/webhook';
import type { PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import {
	createSession,
	getSessionUserInfo,
	updateSession,
	SESSION_MAX_AGE
} from '$lib/server/session';
import {
	isFirstUser,
	loginUser,
	createFirstUser,
	updateUserPassword,
	getUser,
	createUser
} from '$lib/server/user';
import {
	useRecoveryCode,
	getRecoveryCodeCount,
	createRecoveryCodes
} from '$lib/server/user_recovery';
import { getUserInvites, createInvite, getInvite, verifyInvite } from '$lib/server/user_invite';
import { getDbBackup } from '$lib/server/db';
import type { Actions } from './$types';
import HttpStatusCode from '$lib/shared/HttpStatusCode';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const firstUser = await isFirstUser();
	if (firstUser) {
		return error(HttpStatusCode.UNAUTHORIZED, {
			message: 'unauthorized',
			code: 'register'
		});
	}
	const session_id = cookies.get('session_id');
	if (!session_id) {
		const data = await getUnauthorizedData(url.searchParams);
		return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', ...data } as App.Error);
	}

	const user = await getSessionUserInfo(session_id);
	if (!user) {
		const data = await getUnauthorizedData(url.searchParams);
		return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', ...data } as App.Error);
	}
	await updateSession(session_id);
	const recovery_codes = user.first_login ? await createRecoveryCodes(user.id) : [];
	const [recovery_code_count, user_invites, endpoints] = await Promise.all([
		getRecoveryCodeCount(user.id),
		getUserInvites(user.id),
		getWebhookEndpoints(user.id)
	]);

	return {
		user,
		user_invites,
		first_login: user.first_login,
		recovery_codes,
		recovery_code_count,
		endpoints
	};
};

async function getUnauthorizedData(searchParams: URLSearchParams) {
	if (searchParams.has('recovery_code')) {
		return {
			code: 'recovery_code',
			recovery_code: searchParams.get('recovery_code')
		};
	}

	if (searchParams.has('invite_token')) {
		const invite_token = searchParams.get('invite_token');
		const email = await getInvite(invite_token!);
		if (!email) {
			return {
				code: 'invite_token_validation',
				message: 'invalid invite token'
			};
		}
		return {
			code: 'invite_token',
			invite_token,
			email
		};
	}

	return {
		code: 'unauthorized'
	};
}

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		if (!email || !password) {
			return fail(HttpStatusCode.UNPROCESSABLE_ENTITY, {
				message: 'missing email or password',
				code: 'unauthorized_validation'
			});
		}
		const user = await loginUser(email as string, password as string);
		if (!user) {
			return fail(HttpStatusCode.UNAUTHORIZED, {
				message: 'invalid login',
				code: 'unauthorized_validation'
			});
		}
		const session_id = await createSession(user.id);
		cookies.set('session_id', session_id, {
			path: '/',
			maxAge: SESSION_MAX_AGE
		});
		return {
			user,
			recovery_code_count: await getRecoveryCodeCount(user.id),
			user_invites: await getUserInvites(user.id)
		};
	},
	register: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		if (!email || !password) {
			return fail(HttpStatusCode.UNPROCESSABLE_ENTITY, {
				message: 'missing email or password',
				code: 'register_validation'
			});
		}
		let user;
		try {
			user = await createFirstUser(email as string, password as string);
		} catch {
			return fail(HttpStatusCode.CONFLICT, {
				message: 'invalid action',
				code: 'register_validation'
			});
		}
		const recovery_codes = await createRecoveryCodes(user.id);
		const session_id = await createSession(user.id);
		cookies.set('session_id', session_id, {
			path: '/',
			maxAge: SESSION_MAX_AGE
		});
		return {
			user,
			recovery_code_count: await getRecoveryCodeCount(user.id),
			user_invites: await getUserInvites(user.id),
			first_login: true,
			recovery_codes
		};
	},
	register_invite: async ({ request, cookies }) => {
		const formData = await request.formData();
		const invite_token = formData.get('invite_token');
		const password = formData.get('password');
		if (!password) {
			return fail(HttpStatusCode.UNPROCESSABLE_ENTITY, {
				message: 'missing email or password',
				code: 'invite_token_validation'
			});
		}

		const email = await verifyInvite(invite_token as string);
		if (!email) {
			return fail(HttpStatusCode.FORBIDDEN, {
				message: 'invalid invite token',
				code: 'invite_token_validation'
			});
		}
		let user;
		try {
			user = await createUser(email, password as string);
		} catch {
			return fail(HttpStatusCode.INTERNAL_SERVER_ERROR, {
				message: 'failed to register with invite token',
				code: 'invite_token_validation'
			});
		}
		const recovery_codes = await createRecoveryCodes(user.id);
		const session_id = await createSession(user.id);
		cookies.set('session_id', session_id, {
			path: '/',
			maxAge: SESSION_MAX_AGE
		});
		return {
			user,
			recovery_code_count: await getRecoveryCodeCount(user.id),
			first_login: true,
			recovery_codes
		};
	},
	recovery_code: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		if (!email) {
			return fail(HttpStatusCode.UNPROCESSABLE_ENTITY, {
				message: 'missing email',
				code: 'recovery_code_validation'
			});
		}
		const recovery_code = formData.get('recovery_code');
		const password = formData.get('password');
		if (!recovery_code || !password) {
			return fail(HttpStatusCode.UNPROCESSABLE_ENTITY, {
				message: 'missing recovery_code or password',
				code: 'recovery_code_validation'
			});
		}

		const user_id = await useRecoveryCode(email as string, recovery_code as string);
		if (!user_id) {
			return fail(HttpStatusCode.UNAUTHORIZED, {
				message: 'invalid recovery code',
				code: 'recovery_code_validation'
			});
		}

		await updateUserPassword(user_id, password as string);
		const user = await getUser(user_id);
		const session_id = await createSession(user_id);
		cookies.set('session_id', session_id, {
			path: '/',
			maxAge: SESSION_MAX_AGE
		});
		return {
			user,
			recovery_code_count: await getRecoveryCodeCount(user_id),
			user_invites: await getUserInvites(user_id)
		};
	},
	recovery_codes: async ({ request, cookies }) => {
		const session_id = cookies.get('session_id');
		if (!session_id) {
			return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', code: 'unauthorized' });
		}

		const user = await getSessionUserInfo(session_id);
		if (!user) {
			return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', code: 'unauthorized' });
		}

		const formData = await request.formData();
		const password = formData.get('password');
		if (!password) {
			return fail(HttpStatusCode.UNPROCESSABLE_ENTITY, {
				message: 'missing password',
				code: 'recovery_codes_validation'
			});
		}

		const result = await loginUser(user.email, password as string);
		if (!result) {
			return fail(HttpStatusCode.FORBIDDEN, {
				message: 'invalid password',
				code: 'recovery_codes_validation'
			});
		}

		const recovery_codes = await createRecoveryCodes(user.id);
		return {
			recovery_codes,
			recovery_code_count: recovery_codes.length
		};
	},
	invite: async ({ request, cookies }) => {
		const session_id = cookies.get('session_id');
		if (!session_id) {
			return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', code: 'unauthorized' });
		}

		const user = await getSessionUserInfo(session_id);
		if (!user) {
			return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', code: 'unauthorized' });
		}

		if (!user.is_admin) {
			return fail(HttpStatusCode.FORBIDDEN, {
				message: 'unauthorized',
				code: 'unauthorized'
			});
		}

		const formData = await request.formData();
		const email = formData.get('email');
		if (!email) {
			return fail(HttpStatusCode.UNPROCESSABLE_ENTITY, {
				message: 'missing email',
				code: 'invite_validation'
			});
		}

		await createInvite(user.id, email as string);
		const user_invites = await getUserInvites(user.id);
		return {
			user_invites
		};
	},
	db_backup: async ({ cookies }) => {
		const session_id = cookies.get('session_id');
		if (!session_id) {
			return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', code: 'unauthorized' });
		}

		const user = await getSessionUserInfo(session_id);
		if (!user) {
			return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', code: 'unauthorized' });
		}

		if (!user.is_admin) {
			return fail(HttpStatusCode.FORBIDDEN, {
				message: 'unauthorized',
				code: 'unauthorized'
			});
		}

		const backup = await getDbBackup();
		if (!backup) {
			return fail(HttpStatusCode.INTERNAL_SERVER_ERROR, {
				message: 'failed to create database backup',
				code: 'db_backup_validation'
			});
		}
		return {
			db_backup: backup.toString('base64')
		};
	}
};
