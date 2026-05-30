# About

- **Description:** Elasticsearch-backed Node.js service with a modern React client to search and explore syslog data.
- **Type:** Web server + client UI
- **Language or techno:** Javascript, NodeJS, ExpressJS, React

## Contributor

- **[josoavj](https://github.com/josoavj)**
- **[Haritsimba](https://github.com/haritsimba)**


### Running the project

#### Root scripts (recommended)

- **Install all deps:** `npm run install:all`
- **Run dev (server + client):** `npm run dev`
- **Run start (server + client):** `npm run start`
- **Build client:** `npm run build`

#### Server only

- **Install server deps:** `cd server && npm install`
- **Run server:** `npm run start`
- **Run dev server:** `npm run dev`

#### Client only

- **Install client deps:** `cd client && npm install`
- **Run client:** `npm run start`
- **Build client:** `npm run build`

### Configuration

Create a `.env` file inside the `server` folder. You can copy from `server/.env.example` and set the values for your cluster.

Key variables:

- `ES_NODE` (ex: `https://localhost:9200`)
- `ES_API_KEY` or `ES_USERNAME`/`ES_PASSWORD`
- `ES_CA_CERT_PATH` (optional)
- `ES_REJECT_UNAUTHORIZED` (default: true)

### REST API

- `GET /api/health`
- `GET /api/indices?index=*&includeHidden=false`
- `GET /api/search?index=my-index&q=my%20query&fields=message,source&size=10&from=0&mode=match`
- Pagination (page/perPage): `GET /api/search?index=my-index&q=error&page=2&perPage=25`
- Cursor pagination (search_after): `GET /api/search?index=my-index&q=error&sortField=@timestamp&sortOrder=desc&searchAfter=1690896000000`
- Normalized syslog output (default): `GET /api/search?index=my-index&q=error`
- Raw Elasticsearch output: `GET /api/search?index=my-index&q=error&normalize=false`

### Server architecture

Server entrypoint and core files:

- `server/elasticsearch.js` : Express server bootstrap and error handling.
- `server/esClient.js` : Elasticsearch client configuration (auth + TLS).
- `server/config.js` : Environment-based config loader.
- `server/routes/api.js` : REST API endpoints.

#### Configuring elasticsearch 

- A short tutorial on setting up elastic stack (elasticsearch, Kibana, Beats or Filebeat) [goTo](https://github.com/josoavj/elasticsearch-config)

[![My Skills](https://skillicons.dev/icons?i=elasticsearch,nodejs,expressjs)](https://skillicons.dev)
