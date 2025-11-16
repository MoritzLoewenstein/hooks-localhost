import type { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { getSessionUserInfo } from './session';
import { env } from '$env/dynamic/private';

const connections = new Map<string, Socket>();
let io: SocketIOServer | null = null;

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
	if (io) return;

	const httpServer = createServer();

	io = new Server(httpServer, {
		cors: {
			origin: env.ORIGIN,
			methods: ['GET', 'POST'],
			credentials: true
		},
		path: '/socket.io/'
	});

	io.on('connection', async (socket) => {
		const cookieHeader = socket.handshake.headers.cookie;
		const sessionId = parseCookie(cookieHeader, 'session_id');

		if (!sessionId) {
			console.error('Connection rejected: No session_id cookie');
			socket.disconnect();
			return;
		}

		const userInfo = await getSessionUserInfo(sessionId);
		if (!userInfo) {
			console.error('Connection rejected: Invalid or expired session');
			socket.disconnect();
			return;
		}

		const userId = userInfo.id;
		console.log(`User ${userId} connected via Socket.IO`);
		addConnection(userId, socket);

		socket.on('disconnect', () => {
			console.log(`User ${userId} disconnected`);
			removeConnection(userId);
		});
	});

	const port = env.PORT ? env.PORT + 1 : 3001;
	await httpServer.listen(port);
	console.log(`Socket.IO server listening on port ${port}`);
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
