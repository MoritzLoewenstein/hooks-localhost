import { createServer } from 'node:http';
import { Server } from 'socket.io';

let handler = null;
const httpServer = createServer((request, response) => {
	if (handler === null) {
		response.statusCode = 503;
		response.end();
		return;
	}
	handler(request, response);
});

globalThis.socketIo = new Server(httpServer, {
	cors: {
		origin: process.env.ORIGIN,
		methods: ['GET', 'POST'],
		credentials: true
	},
	path: '/socket.io/'
});

const { handler: svelteHandler } = await import('./build/handler.js');
handler = svelteHandler;

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
