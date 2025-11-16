import { writable } from 'svelte/store';
import { io, type Socket } from 'socket.io-client';
import { dev } from '$app/environment';

export interface WebhookMessage {
	endpointId: string;
	target: string;
	method: string;
	headers: Record<string, string>;
	body: string | null;
}

interface WebSocketMessage {
	type: 'webhook';
	data: WebhookMessage;
}

export const webhookMessages = writable<WebhookMessage[]>([]);
export const connected = writable(false);

let socket: Socket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

export function connectWebSocket() {
	if (socket?.connected) {
		return;
	}

	const protocol = dev ? 'ws:' : 'wss:';
	const hostname = window.location.hostname;
	const socketPort = '3001';
	const url = `${protocol}//${hostname}:${socketPort}`;

	socket = io(url, {
		path: '/socket.io/',
		transports: ['websocket', 'polling'],
		reconnection: true,
		reconnectionDelay: 3000,
		reconnectionAttempts: Infinity,
		withCredentials: true
	});

	socket.on('connect', () => {
		connected.set(true);
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
	});

	socket.on('message', (message: WebSocketMessage) => {
		try {
			if (message.type === 'webhook') {
				webhookMessages.update((messages) => [message.data, ...messages]);
			}
		} catch (error) {
			console.error('Failed to parse Socket.IO message:', error);
		}
	});

	socket.on('disconnect', () => {
		connected.set(false);
	});

	socket.on('connect_error', (error) => {
		console.error('Socket.IO connection error:', error);
		connected.set(false);
	});
}

export function disconnectWebSocket() {
	if (reconnectTimeout) {
		clearTimeout(reconnectTimeout);
		reconnectTimeout = null;
	}
	if (socket) {
		socket.disconnect();
		socket = null;
	}
	connected.set(false);
}

export function clearMessages() {
	webhookMessages.set([]);
}
