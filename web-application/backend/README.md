# Web server

This is the web server to provide an API to the clients. Built with [Express](https://expressjs.com/) and [NodeJS](https://nodejs.org/en).

## Requirements

 - [NodeJS](https://nodejs.org/) - Last stable version

## Installation

To install dependencies run:

```sh
npm install
```

## Build the project

To compile the project run:

```sh
npm run build
```

## Configuration

In order to set the environment variables in a file, copy `.env.example` to `.env` and edit the parameters.

```sh
cp .env.example .env
```

For more information, check the [Configuration reference](./CONFIG.md)

## Database setup

In order to set up the database schema and indexes, run the database setup scrips.

You can find the database setup script in the [database](./database/) folder.

## Running

To run the server after compilation and configuration use:

```sh
npm start
```

For development mode, to run and watch for changes, you can run the following command:

```sh
npm run dev
```

## Tests

In order to run the tests, use the following command:

```sh
npm test
```

## HTTP API

The API documentation is auto generated with Swagger from the controller files, and can be accessed at `http://localhost/api-docs` (In production, replace `localhost` with the application domain).

## Translation files

The server uses [i18n](https://github.com/mashpie/i18n-node) in order to translate text to multiple languages, mainly for email templates.

The translation files are located at the [locales](./locales/) folder, as `.json` files. The keys are the texts from the source code, and the values are the translated texts.

In order to search the code for translation usages and update the keys, use the following command:

```sh
npm run update-translations
```

## Development guide

For more information about how the project is structured and how to develop it, check the [Development guide](./DEV_GUIDE.md)
