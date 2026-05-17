import { command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { getSessionUserInfo } from '$lib/server/session';
import {
	createWebhookEndpoint,
	deleteWebhookEndpoint,
	updateWebhookEndpoint
} from '$lib/server/webhook';
import HttpStatusCode from '$lib/shared/HttpStatusCode';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import { HTTP_METHODS } from '$lib/constants';

const methodsSchema = v.pipe(
	v.array(v.picklist(HTTP_METHODS)),
	v.minLength(1, 'At least one HTTP method must be selected')
);

export const createEndpoint = command(
	v.object({
		target: v.string(),
		methods: methodsSchema
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

		return await createWebhookEndpoint(user.id, data.target, data.methods);
	}
);

export const updateEndpoint = command(
	v.object({
		id: v.string(),
		target: v.string(),
		methods: methodsSchema
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

		return await updateWebhookEndpoint(user.id, data.id, data.target, data.methods);
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
