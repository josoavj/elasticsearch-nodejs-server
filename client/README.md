# Syslog Explorer Client

Modern React client for searching and exploring syslog data indexed in Elasticsearch.

## Features

- Search with fields, query modes, and pagination
- Glassmorphism UI with responsive layout
- Uses REST API provided by the server

## Getting started

```bash
cd client
npm install
npm start
```

The app runs on http://localhost:3000 by default.

## Configuration

The client proxies API calls to the server via `proxy` in [client/package.json](package.json).
If your server runs on a different host/port, update that value.

## Build

```bash
npm run build
```

## API endpoints used

- `GET /api/health`
- `GET /api/indices`
- `GET /api/search`
