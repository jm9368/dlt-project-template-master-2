# Monitoring tools (development)

Use this Docker Compose setup to run the monitoring tools in development mode:

 - [ElasticSearch](https://www.elastic.co/en/elasticsearch)
 - [Kibana](https://www.elastic.co/en/kibana)

## Requirements

 - [Docker](https://www.docker.com/)
 - [Docker Compose](https://docs.docker.com/compose/)

## Start the tools

In order to start the tools, type:

```sh
docker-compose up
```

or:

```sh
docker compose up
```

## Using the tools

The Kibana panel will be accesible from http://127.0.0.1:5601

The ElasticSearch will be accesible from http://127.0.0.1:9200

In order to enable sending logs to the ElasticSearch node, add / modify the following configuration in `.env` of the [backend](../../../web-application/backend/):

```conf
LOG_ELASTIC_SEARCH_ENABLED=YES

LOG_ELASTIC_SEARCH_NODE=http://127.0.0.1:9200

LOG_ELASTIC_SEARCH_USER=elastic
LOG_ELASTIC_SEARCH_PASSWORD=

LOG_ELASTIC_SEARCH_INDEX_PREFIX=app-log-

LOG_ELASTIC_SEARCH_TLS_REJECT_UNAUTHORIZED=NO
```

## Configuring Kibana

1. **Index Management**:
   - Navigate to the left sidebar: `Index Management`.

2. **Create Index Template**:
   - Go to `Index Templates` > `Create template`.
   - Set Name: `app-log`.
   - Set Index patterns: `app-log-*`.

3. **Create Index**:
   - Name the index: `app-log-log`.

4. **Configure Data Views**:
   - In Kibana, navigate to `Data Views`.
   - Create new with Name: `app-log`.
   - Set Index pattern: `app-log-*`.

5. **Index Lifecycle Policies**:
   - Go to `Data` > `Index Lifecycle Policies`.
   - In the `Hot phase`, create a policy to limit sizes.

## Stopping the tools

In order to stop the tools, type:

```sh
docker-compose down
```

or:

```sh
docker compose down
```
