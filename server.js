import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { handler } from './build/handler.js';

const httpServer = createServer(handler);

const io = new Server(httpServer, {
	cors: {
		origin: process.env.ORIGIN,
		methods: ['GET', 'POST'],
		credentials: true
	},
	path: '/socket.io/'
});

globalThis.socketIo = io;

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
