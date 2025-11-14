import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
	plugins: [sveltekit()],
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
