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

Create a `.env` file inside the `server/` folder:

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

---

## 🌐 REST API

### Health check

```
GET /api/health
```

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

---

## 🏗️ Server architecture

| File | Description |
|---|---|
| `server/elasticsearch.js` | Express server bootstrap and error handling |
| `server/esClient.js` | Elasticsearch client — auth & TLS configuration |
| `server/config.js` | Environment-based config loader |
| `server/routes/api.js` | REST API endpoint definitions |

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
