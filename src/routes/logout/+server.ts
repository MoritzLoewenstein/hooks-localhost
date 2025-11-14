import { redirect } from '@sveltejs/kit';
import { invalidateSession } from '$lib/server/session';
import type { RequestHandler } from './$types';
import HttpStatusCode from '$lib/shared/HttpStatusCode';

export const GET: RequestHandler = async ({ cookies }) => {
	const session_id = cookies.get('session_id');
	if (!session_id) {
		return redirect(HttpStatusCode.SEE_OTHER, '/');
	}

	await invalidateSession(session_id);
	cookies.delete('session_id', { path: '/' });
	return redirect(HttpStatusCode.SEE_OTHER, '/');
};
