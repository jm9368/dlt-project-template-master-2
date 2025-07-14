# Monitoring tools (production)

Use this Docker Compose setup to run the monitoring tools in production mode:

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

### Authentication

When logging into Kibana, you will be asked for an erollment token, to generate it, run:

```sh
docker exec -it production_elasticsearch_1 /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana
```

Copy the enrollment token from the console, and copy it into the Kibana panel.

Then, you will be asked for a verification code, to get it, type:

```sh
docker exec -it production_kibana_1 /usr/share/kibana/bin/kibana-verification-code
```

After everything is setup, you will be asked to login. In order to do that, you must reset the password of the `elastic` user:

```sh
docker exec -it production_elasticsearch_1 /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic
```

A new random password will be generated and printed to the console. You can use that password, and the user `elastic` to log into Kibana.

### Configure indexes and views

1. **Index Management**:
   - Navigate to the left sidebar: `Index Management`.

2. **Create Index Template**:
   - Go to `Index Templates` > `Create template`.
   - Set Name: `app-log`.
   - Set Index patterns: `app-log-*`.

3. **Create Index**:
   - Name the index: `app-log`.

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
