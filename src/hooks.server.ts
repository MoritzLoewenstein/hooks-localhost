import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, message }) => {
	console.error(error);
	return {
		message
	};
};
