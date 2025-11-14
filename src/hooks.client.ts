import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, message }) => {
	console.error(error);
	return {
		message
	};
};
