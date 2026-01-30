import type { HandleServerError } from '@sveltejs/kit';
import { initializeWebsocketServer } from '$lib/server/websocket';
import { db } from '$lib/server/db';

db.init();
await initializeWebsocketServer();

export const handleError: HandleServerError = async ({ error, message }) => {
	console.error(error);
	return {
		message
	};
};
