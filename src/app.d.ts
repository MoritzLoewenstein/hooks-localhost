// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Server as SocketIOServer } from 'socket.io';

declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
			email?: string;
			invite_token?: string;
		}
		interface Locals {
			session?: {
				userId: string;
				id: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	var socketIo: SocketIOServer | undefined;
}

export {};
