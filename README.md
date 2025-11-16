# hooks-localhost

A webhook relay service that forwards webhook requests from public endpoints to your local development environment.

## Features

- **Webhook Relay**: Receive webhooks at public endpoints and forward them to localhost
- **Real-time Delivery**: WebSocket connection for instant webhook forwarding
- **Multiple Endpoints**: Create unlimited webhook endpoints per user
- **Method Support**: GET, POST, PUT, PATCH, DELETE
- Secure user authentication
- Simple web interface for endpoint management

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Quick Start with Docker

1. **Create environment file**

```bash
cp .env.example .env
```

2. **Configure environment variables**

Edit `.env` and set:

```env
ORIGIN=https://your-domain.com
DATABASE_URL=file:./data/database.db
```

3. **Start the service**

```bash
docker compose up -d
```

The application will be available at `http://localhost:3000` (or your configured PORT).
The Websocket Server will listen at PORT + 1 (or 3001).

## Usage

### Creating a Webhook Endpoint

1. Enter your localhost target URL (e.g., `http://localhost:3000/api/webhook`)
2. Select the expected HTTP method
3. Click "Create Endpoint"
4. Copy the generated webhook URL

### Receiving Webhooks

- **Keep the app open**: The browser must remain open to maintain the WebSocket connection
- **Share webhook URL**: Provide the generated URL to external services (GitHub, Stripe, etc.)
- **Monitor requests**: View incoming webhooks in real-time on the dashboard
- **Automatic forwarding**: All matching requests are automatically forwarded to your localhost

### Important Notes

- ⚠️ Webhooks are **only** forwarded while the app is open in your browser
- ✓ The server always responds with `204 No Content` immediately
- ✓ Your localhost server receives the exact same request (method, headers, body)
- ⚠️ Target must be `http://localhost` (IP addresses not allowed)
- ✓ Supports GET, POST, PUT, PATCH, DELETE methods

## Documentation

For technical details, architecture, and development information, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
