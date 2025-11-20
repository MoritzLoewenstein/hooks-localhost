import type { Socket } from 'socket.io';
import { getSessionUserInfo } from './session';

const connections = new Map<string, Socket>();

function parseCookie(cookieHeader: string | undefined, name: string): string | null {
	if (!cookieHeader) return null;
	const cookies = cookieHeader.split(';');
	for (const cookie of cookies) {
		const [key, value] = cookie.trim().split('=');
		if (key === name) {
			return decodeURIComponent(value);
		}
	}
	return null;
}

export async function initializeWebsocketServer() {
	const io = globalThis.socketIo;
	if (!io) {
		console.warn('Socket.IO server not available in globalThis.socketIo');
		return;
	}

	io.on('connection', async (socket) => {
		const cookieHeader = socket.handshake.headers.cookie;
		const sessionId = parseCookie(cookieHeader, 'session_id');

		if (!sessionId) {
			socket.disconnect();
			return;
		}

		const userInfo = await getSessionUserInfo(sessionId);
		if (!userInfo) {
			socket.disconnect();
			return;
		}

		const userId = userInfo.id;
		addConnection(userId, socket);

		socket.on('disconnect', () => {
			removeConnection(userId);
		});
	});
}

function addConnection(userId: string, socket: Socket) {
	connections.set(userId, socket);
}

function removeConnection(userId: string) {
	connections.delete(userId);
}

export function sendToUser(userId: string, data: unknown): boolean {
	const socket = connections.get(userId);
	if (!socket?.connected) {
		return false;
	}
	const success = socket.emit('message', data);
	return success;
}

export function isUserConnected(userId: string): boolean {
	const socket = connections.get(userId);
	return !!socket?.connected;
}
