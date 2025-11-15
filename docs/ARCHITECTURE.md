# Architecture Documentation

## Tech Stack

- **Framework**: SvelteKit 5 with Remote Functions
- **Database**: SQLite with Prisma ORM
- **Authentication**: Argon2 password hashing
- **WebSockets**: Socket.IO for real-time webhook delivery
- **Validation**: Valibot for schema validation
- **Testing**: Vitest
- **Language**: TypeScript

## How It Works

### Request Flow

1. **Webhook Reception**
   - External service sends HTTP request to `/hook/{id}`
   - Server validates endpoint exists and user is connected
   - Server serializes request (method, headers, body)
   - Server responds immediately with `204 No Content`

2. **WebSocket Delivery**
   - Serialized request sent via WebSocket to connected browser
   - Connection identified by `userId` from endpoint configuration
   - Only active when user has app open in browser

3. **Local Forwarding**
   - Browser receives WebSocket message
   - Executes `fetch()` to configured localhost target
   - Preserves original method, headers, and body
   - Response is not sent back (fire-and-forget)

### Architecture Components

#### Server-Side

- **`src/hooks.server.ts`**: Calls initializeWebsocketServer() to set up Socket.IO
- **`src/lib/server/webhook.ts`**: Webhook endpoint CRUD operations, target validation
- **`src/lib/server/websocket.ts`**: Socket.IO connection management (userId → Socket mapping)
- **`src/routes/hook/[id]/+server.ts`**: Webhook receiver (handles GET, POST, PUT, PATCH, DELETE)
- **`src/routes/webhooks.remote.ts`**: Remote functions for endpoint management

#### Client-Side

- **`src/lib/client/websocket.ts`**: Socket.IO client connection with auto-reconnect, message store
- **`src/lib/client/webhook-forwarder.ts`**: Executes HTTP requests to localhost
- **`src/routes/+page.svelte`**: UI for managing endpoints and viewing webhook logs

#### Database

- **`src/lib/server/db.ts`**: Prisma client configuration with SQLite adapter
- **`prisma/schema.prisma`**: Database schema definition

### Socket.IO Implementation

Socket.IO is initialized in `src/lib/server/websocket.ts` using node:http `createServer()` and called from `src/hooks.server.ts`.

**Server Setup** (`src/lib/server/websocket.ts`):

```javascript
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
	cors: { 
		origin: env.ORIGIN, 
		methods: ['GET', 'POST'],
		credentials: true 
	},
	path: '/socket.io/'
});

io.on('connection', async (socket) => {
	const sessionId = parseCookie(socket.handshake.headers.cookie, 'session_id');
	const userInfo = await getSessionUserInfo(sessionId);
	addConnection(userInfo.id, socket);
});

httpServer.listen(3001); // Socket.IO runs on separate port
```

**Client Connection**:

```javascript
const socket = io(url, {
	path: '/socket.io/',
	transports: ['websocket', 'polling'],
	reconnection: true,
	reconnectionDelay: 3000,
	reconnectionAttempts: Infinity,
	withCredentials: true
});
```

**Key Features**:

- Socket.IO server runs on separate HTTP server (default port 3001)
- SvelteKit app runs on main port (default 3000)
- Connections authenticated using session cookies (not auth handshake)
- Each user can have one active Socket.IO connection
- Automatic reconnection with 3-second delay and infinite attempts
- Supports both WebSocket and polling transports

### Security Considerations

1. **Target Validation**
   - Only `http://localhost` URLs allowed (no IP addresses)
   - Uses `new URL()` constructor for parsing and validation
   - Checks `url.protocol === 'http:'` and `url.hostname === 'localhost'`

2. **Authentication**
   - Socket.IO connection requires valid session cookie
   - Endpoint creation/deletion requires authenticated user
   - Endpoints only forward to user who created them

3. **Data Serialization**
   - Request headers and body sent via Socket.IO
   - No response data sent back to server
   - One-way communication: server → client → localhost

## Database Schema

### WebhookEndpoint

```prisma
model WebhookEndpoint {
  id        String   @id
  userId    String   @map("user_id")
  target    String
  method    String
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("webhook_endpoints")
}
```

- `id`: ULID primary key (also used in webhook URL path)
- `userId`: Foreign key to User
- `target`: Localhost URL where webhook should forward
- `method`: Expected HTTP method (GET, POST, PUT, PATCH, DELETE)
- `createdAt`: Timestamp

### Other Tables

- **Users**: User accounts with email, password, and admin status
- **Sessions**: User sessions
- **UserInvites**: Invitation tokens for new users
- **UserRecoveryCode**: Recovery codes for account access

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run check` - Type check
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:generate` - Generate Prisma client

## Remote Functions

SvelteKit Remote Functions are used for type-safe client-server communication:

- **`createEndpoint`**: Creates new webhook endpoint
- **`removeEndpoint`**: Deletes webhook endpoint

These are defined in `src/routes/webhooks.remote.ts` and use the `command` function from `$app/server`. They automatically access the request context via `getRequestEvent()` to retrieve user session data.

## Deployment Considerations

1. **Socket.IO Support**
   - Socket.IO works with Node.js adapter out of the box
   - Supports WebSocket and polling transports
   - Ensure deployment platform supports WebSocket connections
   - CORS is configured to accept all origins for Socket.IO endpoint

2. **Database Migrations**
   - Run `npx prisma migrate deploy` before starting production server
   - Ensure `DATABASE_URL` environment variable is set

3. **CORS**
   - Webhook receiver endpoints accept requests from any origin
   - No CORS restrictions on `/hook/{id}` routes
   - Socket.IO CORS configured to accept origin from env.ORIGIN with credentials enabled

4. **Connection Persistence**
   - Socket.IO connections stored in-memory (Map)
   - Connections lost on server restart
   - Client auto-reconnects with 3-second delay and infinite attempts using Socket.IO built-in reconnection
