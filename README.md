# 🔍 Syslog Explorer

> Elasticsearch-backed Node.js server with a modern React client to search and explore syslog data.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=flat&logo=elasticsearch&logoColor=white)

---

## 📋 Table of contents

- [Getting started](#-getting-started)
- [Configuration](#-configuration)
- [REST API](#-rest-api)
- [Realtime stream](#-realtime-stream)
- [Server architecture](#-server-architecture)
- [Elastic stack setup](#-elastic-stack-setup)
- [Contributors](#-contributors)

---

## 🚀 Getting started

### Root scripts *(recommended)*

Run both server and client from the project root:

| Command | Description |
|---|---|
| `npm run install:all` | Install all dependencies |
| `npm run dev` | Run server + client in dev mode |
| `npm run start` | Run server + client in production |
| `npm run build` | Build the client |

### Server only

```bash
cd server && npm install   # Install dependencies
npm run dev                # Development mode
npm run start              # Production mode
```

### Client only

```bash
cd client && npm install   # Install dependencies
npm run start              # Start client
npm run build              # Build for production
```

---

## ⚙️ Configuration

Create a `.env` file inside the `server/` folder (or inject env vars at runtime):

```bash
cp server/.env.example server/.env
```

Then set the following variables:

| Variable | Description | Required |
|---|---|---|
| `ES_NODE` | Elasticsearch URL (e.g. `https://localhost:9200`) | ✅ |
| `ES_API_KEY` | API key authentication | ✅ *(or user/pass)* |
| `ES_USERNAME` | Basic auth username | ✅ *(or API key)* |
| `ES_PASSWORD` | Basic auth password | ✅ *(or API key)* |
| `ES_CA_CERT_PATH` | Path to TLS CA certificate | optional |
| `ES_REJECT_UNAUTHORIZED` | Reject unauthorized TLS (default: `true`) | optional |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | optional |
| `JWT_REQUIRED` | Enforce JWT on API routes | optional |
| `JWT_SECRET` | JWT signing secret (HS256) | ✅ if JWT enabled |
| `JWT_ISSUER` | JWT issuer | optional |
| `JWT_AUDIENCE` | JWT audience | optional |
| `ES_REQUEST_TIMEOUT` | ES request timeout in ms | optional |
| `ES_MAX_RETRIES` | ES retry count | optional |
| `ES_SNIFF_ON_START` | Enable sniff on start | optional |
| `ES_SNIFF_INTERVAL` | Sniff interval in ms (0 disables) | optional |
| `ES_TRACK_TOTAL_HITS` | Default track_total_hits | optional |
| `ES_TERMINATE_AFTER` | Default terminate_after | optional |
| `ES_TERMINATE_AFTER_MAX` | Max terminate_after accepted | optional |
| `ES_ALLOW_WILDCARDS` | Allow wildcard indices | optional |
| `ES_ALLOWED_INDICES` | Comma-separated allowed indices | optional |
| `ES_BREAKER_ENABLED` | Circuit breaker enabled | optional |
| `ES_BREAKER_THRESHOLD` | Failures before breaker opens | optional |
| `ES_BREAKER_RESET_MS` | Breaker reset window in ms | optional |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | optional |
| `RATE_LIMIT_MAX` | Max requests per window | optional |
| `CACHE_TTL_MS` | Cache TTL for /health and /indices | optional |
| `CACHE_MAX_ENTRIES` | Cache max entries | optional |
| `WS_POLL_INTERVAL_MS` | WebSocket poll interval | optional |
| `WS_BATCH_SIZE` | WebSocket batch size | optional |

### Secure options (recommended)

#### 1) Runtime environment variables

No secrets stored on disk, just inject when starting the server:

```bash
ES_NODE=https://localhost:9200 \
ES_USERNAME=elastic \
ES_PASSWORD=supersecret \
npm --prefix server run dev
```

#### 3) Encrypted `.env` with dotenv-vault

Use an encrypted `.env.vault` and only share the vault key with trusted members.

```bash
cd server
npm run env:open   # opens the vault UI
npm run env:push   # encrypt and push local .env into the vault
npm run env:pull   # pull the encrypted env
```

Run with the vault key:

```bash
DOTENV_KEY=your_vault_key npm run env:run -- node elasticsearch.js
```

From the project root:

```bash
npm run vault:open
npm run vault:push
npm run vault:pull
DOTENV_KEY=your_vault_key npm run vault:run -- node server/elasticsearch.js
```

---

## 🌐 REST API

### Health check

```
GET /api/health
```

JWT-protected routes require `Authorization: Bearer <token>`.

### List indices

```
GET /api/indices?index=*&includeHidden=false
```

### Search

```
GET /api/search?index=<index>&q=<query>&fields=message,source&size=10&from=0&mode=match
```

**Pagination options:**

```bash
# Offset pagination
GET /api/search?index=my-index&q=error&page=2&perPage=25

# Cursor pagination (search_after)
GET /api/search?index=my-index&q=error&sortField=@timestamp&sortOrder=desc&searchAfter=1690896000000
```

**Output format:**

```bash
# Normalized syslog output (default)
GET /api/search?index=my-index&q=error

# Raw Elasticsearch output
GET /api/search?index=my-index&q=error&normalize=false
```

**Safety controls:**

- `trackTotalHits` (optional) to override `ES_TRACK_TOTAL_HITS`
- `terminateAfter` (optional) to cap heavy queries

---

## 📡 Realtime stream

WebSocket endpoint for near real-time logs (polling Elasticsearch):

```
ws://localhost:3000/api/stream?index=filebeat-*&q=error
```

Optional parameters: `fields`, `mode`, `sortField`, `sortOrder`, `normalize`.

---

## 🔐 Security (JWT + HTTPS)

### JWT

Set `JWT_REQUIRED=true` and configure `JWT_SECRET` (plus optional issuer/audience).
Tokens must be sent in the `Authorization` header.

### HTTPS (Nginx)

Use a reverse proxy for TLS termination:

```nginx
server {
	listen 443 ssl;
	server_name networkmonigoring.elasticsearch.mg;

	ssl_certificate /etc/letsencrypt/live/networkmonigoring.elasticsearch.mg/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/networkmonigoring.elasticsearch.mg/privkey.pem;

	location / {
		proxy_pass http://127.0.0.1:3000;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
}
```

---

## 🏗️ Server architecture

| File | Description |
|---|---|
| `server/elasticsearch.js` | Express server bootstrap and error handling |
| `server/esClient.js` | Elasticsearch client — auth & TLS configuration |
| `server/config.js` | Environment-based config loader |
| `server/routes/api.js` | REST API endpoint definitions |
| `server/mappers/syslogMapper.js` | Normalized syslog mapper |
| `server/validators.js` | API input safety checks |
| `server/esGuard.js` | Circuit breaker + latency logging |
| `server/logger.js` | Structured logging |

---

## 📚 Elastic stack setup

A step-by-step guide to setting up the full Elastic stack (Elasticsearch, Kibana, Beats / Filebeat) is available here:

👉 [elasticsearch-config](https://github.com/josoavj/elasticsearch-config)

---

## 👥 Contributors

| | Username |
|---|---|
| [![josoavj](https://github.com/josoavj.png?size=40)](https://github.com/josoavj) | [@josoavj](https://github.com/josoavj) |
| [![haritsimba](https://github.com/haritsimba.png?size=40)](https://github.com/haritsimba) | [@Haritsimba](https://github.com/haritsimba) |
