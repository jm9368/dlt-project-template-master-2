# Web application

This folder contains the web application.

## Components

### Backend

The [backend](./backend/) folder contains the backend server, powered by [Express](https://expressjs.com/) and [NodeJS](https://nodejs.org/en).

### Frontend

The [frontend](./frontend/) folder contains the web user interface, powered by [Vue.js](https://vuejs.org/) and [Vite](https://vitejs.dev/)

## Docker

You can create a Docker image of the web application using the `Dockerfile` in this folder.

In order to create it, you can use the following command:

```sh
docker build --tag web-application-name .
```

This folder also has a [docker-compose](./docker-compose.yml) setup to run the web application, in order to run it, you can use:

```sh
docker compose up --build # Add --build to update the image
```

The image will allow environment variables for both, the backend and the frontend you can change them in the `docker-compose.yml` file or by creating a `.env` file in this folder.
