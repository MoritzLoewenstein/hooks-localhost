import { command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { getSessionUserInfo } from '$lib/server/session';
import { createWebhookEndpoint, deleteWebhookEndpoint } from '$lib/server/webhook';
import HttpStatusCode from '$lib/shared/HttpStatusCode';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import { env } from '$env/dynamic/private';

export const createEndpoint = command(
	v.object({
		target: v.string(),
		method: v.string()
	}),
	async (data) => {
		const { cookies } = getRequestEvent();
		const session_id = cookies.get('session_id');
		if (!session_id) {
			return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized' });
		}

		const user = await getSessionUserInfo(session_id);
		if (!user) {
			return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized' });
		}

		const endpoint = await createWebhookEndpoint(user.id, data.target, data.method);
		return {
			...endpoint,
			url: `${env.ORIGIN}/hook/${endpoint.id}`,
			createdAt: endpoint.createdAt.toISOString()
		};
	}
);

export const removeEndpoint = command(v.string(), async (id) => {
	const { cookies } = getRequestEvent();
	const session_id = cookies.get('session_id');
	if (!session_id) {
		return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized' });
	}

	const user = await getSessionUserInfo(session_id);
	if (!user) {
		return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized' });
	}

	await deleteWebhookEndpoint(user.id, id);
});
