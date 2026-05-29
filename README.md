# About

- **Description:** A simple integration of an elasticsearch node into a nodejs server, which filters the data integrated into elasticsearch. The data source in this mini-project is Fortinet, which sends real-time logs into elasticsearch via Filebeat.
- **Type:** Web server (Node server)
- **Language or techno:** Javascript, NodeJS, ExpressJS

## Contributor

- **[josoavj](https://github.com/josoavj)**
- **[Haritsimba](https://github.com/haritsimba)**


### Running the project

- **Install server deps:** `cd server && npm install`
- **Run server:** `npm run start`
- **Run dev server:** `npm run dev`
- **Run test script:** `npm run test`

### Configuration

Create a `.env` file inside the `server` folder. You can copy from `server/.env.example` and set the values for your cluster.

### REST API

- `GET /api/health`
- `GET /api/indices?index=*&includeHidden=false`
- `GET /api/search?index=my-index&q=my%20query&fields=message,source&size=10&from=0&mode=match`
- Pagination (page/perPage): `GET /api/search?index=my-index&q=error&page=2&perPage=25`
- Cursor pagination (search_after): `GET /api/search?index=my-index&q=error&sortField=@timestamp&sortOrder=desc&searchAfter=1690896000000`

#### Configuring elasticsearch 

- A short tutorial on setting up elastic stack (elasticsearch, Kibana, Beats or Filebeat) [goTo](https://github.com/josoavj/elasticsearch-config)

[![My Skills](https://skillicons.dev/icons?i=elasticsearch,nodejs,expressjs)](https://skillicons.dev)
