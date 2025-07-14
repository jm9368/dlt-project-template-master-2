# Database scripts

This folder is meant for database setup scripts, in order to set the database schema and indexes.

## Usage

Depending on the database you are using, you may use one script or another.

### MongoDB

For MongoDB, run the following script:

```sh
npm run setup-mongo
```

### Mysql

For MySQL, run the script [mysql.auto.sql](./mysql.auto.sql) using a compatible client.

### PostgreSQL

For PostgreSQL, run the script [postgres.auto.sql](./postgres.auto.sql) using a compatible client.

## Automatic generation

This project has a script to automatically generate the database scripts from the model classes in the source code.

In order to generate or update the scripts, type:

```sh
npm run update-db-scripts
```

## Migrations

Once in production, if you change the database schema or indexes, you will need to write migrations.

Place any migration scripts in the [migrations](./migrations/) folder.
