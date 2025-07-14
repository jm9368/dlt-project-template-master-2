// Reserved for license

"use strict";

import { Monitor } from "../monitor";
import { DataSource } from "tsbean-orm";
import { Config } from "./config";

/**
 * Database configuration 
 */
export class DatabaseConfig {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): DatabaseConfig {
        if (DatabaseConfig.instance) {
            return DatabaseConfig.instance;
        }

        const config: DatabaseConfig = new DatabaseConfig();

        if (Config.IS_TEST) {
            // Use test mongo database
            config.type = "mongo";

            config.url = process.env.TEST_DB_MONGO_URL || "mongodb://127.0.0.1:27017/test_database";

            DataSource.set(DataSource.DEFAULT, require("tsbean-driver-mongo").MongoDriver.createDataSource(config.url));
        } else {
            switch ((process.env.DB_TYPE + "").toLowerCase()) {
                case "mongo":
                case "mongodb":
                    config.type = "mongo";

                    config.url = process.env.DB_MONGO_URL || "";


                    DataSource.set(DataSource.DEFAULT, require("tsbean-driver-mongo").MongoDriver.createDataSource(config.url));
                    break;
                case "mysql":
                case "mariadb":
                    config.type = "mysql";

                    config.host = process.env.DB_HOST || "127.0.0.1";
                    config.port = parseInt(process.env.DB_PORT || "3306", 10) || 3306;
                    config.user = process.env.DB_USER || "";
                    config.password = process.env.DB_PASSWORD || "";
                    config.databaseName = process.env.DB_NAME || "";
                    config.connections = parseInt(process.env.DB_PORT || "4", 10) || 4;

                    DataSource.set(DataSource.DEFAULT, require("tsbean-driver-mysql").MySQLDriver.createDataSource({
                        host: config.host,
                        port: config.port,
                        user: config.user,
                        password: config.password,
                        connections: config.connections,
                        database: config.databaseName,
                        debug: process.env.DB_TRACE === "YES" ? Monitor.debug : null,
                    }));
                    break;
                case "postgres":
                case "postgre":
                case "postgresql":
                case "psql":
                    config.type = "postgres";

                    config.host = process.env.DB_HOST || "127.0.0.1";
                    config.port = parseInt(process.env.DB_PORT || "3306", 10) || 3306;
                    config.user = process.env.DB_USER || "";
                    config.password = process.env.DB_PASSWORD || "";
                    config.databaseName = process.env.DB_NAME || "";
                    config.connections = parseInt(process.env.DB_PORT || "4", 10) || 4;

                    DataSource.set(DataSource.DEFAULT, require("tsbean-driver-postgres").PostgreSQLDriver.createDataSource({
                        host: config.host,
                        port: config.port,
                        user: config.user,
                        password: config.password,
                        connections: config.connections,
                        database: config.databaseName,
                    }));
                    break;
                default:
                    throw new Error("Configuration error: Unknown data source type: " + process.env.DB_TYPE);
            }
        }

        DatabaseConfig.instance = config;

        return config;
    }
    private static instance: DatabaseConfig = null;

    public type: "mongo" | "mysql" | "postgres";
    public databaseName: string;
    public host: string;
    public port: number;
    public user: string;
    public password: string;
    public connections: number;
    public url: string;

    constructor() {
        this.type = "mongo";
        this.databaseName = "database";
        this.host = "localhost";
        this.port = 3306;
        this.user = "";
        this.password = "";
        this.connections = 4;
        this.url = "mongodb://127.0.0.1:27017/database_name";
    }
}
