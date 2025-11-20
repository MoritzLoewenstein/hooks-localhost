import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import { Server } from 'socket.io';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'sveltekit-socketio-server',
			configureServer(server) {
				if(server.httpServer === null) {
					console.error("sveltekit-socketio-server: vite httpServer not available");
					return;
				}
				globalThis.socketIo = new Server(server.httpServer, {
					cors: {
						origin: process.env.ORIGIN,
						methods: ['GET', 'POST'],
						credentials: true
					},
					path: '/socket.io/'
				});
			}
		}
	],
	test: {
		include: ['tests/**/*.test.ts'],
		browser: {
			enabled: false,
			provider: playwright(),
			// https://vitest.dev/guide/browser/playwright
			instances: [{ browser: 'chromium' }]
		}
	}
});
