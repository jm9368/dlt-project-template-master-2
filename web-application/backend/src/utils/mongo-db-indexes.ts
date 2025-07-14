// Util to setup MongoDB indexes

"use strict";

import Path from "path";
import { DataSource } from "tsbean-orm";
import { MongoDriver } from "tsbean-driver-mongo";
import { Monitor } from "../monitor";
import { DatabaseConfig } from "../config/config-database";
import { existsSync, readFileSync } from "fs";

export async function setupMongoDatabaseIndexes(options?: { dropDB?: boolean }) {
    DatabaseConfig.getInstance();
    const dataSource = DataSource.get(DataSource.DEFAULT);

    if (dataSource.driver instanceof MongoDriver) {
        const client = (<MongoDriver>dataSource.driver).mongoClient;

        if (options && options.dropDB === true) {
            await client.db().dropDatabase();
            Monitor.info("Database was dropped");
        }

        const setPrimaryKey = async function (collection: string, keyName: string) {
            const o: any = Object.create(null);
            o[keyName] = 1;
            await client.db().collection(collection).createIndex(o, { unique: true });
        };

        const mongoScript = Path.resolve(__dirname, "..", "..", "database", "mongo.auto.json");

        if (!existsSync(mongoScript)) {
            Monitor.warning("Could not find a database setup script (mongo.auto.json)");
            return;
        }

        const mongoData: {
            primaryKeys: {
                collection: string;
                field: string;
            }[],
            indexes: {
                collection: string;
                unique: boolean;
                fields: {
                    name: string,
                    dir: "ASC" | "DESC" | "",
                }[],
            }[],
        } = JSON.parse(readFileSync(mongoScript).toString());

        for (const pk of mongoData.primaryKeys) {
            await setPrimaryKey(pk.collection, pk.field);
            Monitor.info(`Set primary key ${pk.field} for ${pk.collection}`);
        }

        for (const ix of mongoData.indexes) {
            const ixConf = Object.create(null);

            for (const f of ix.fields) {
                if (f.dir === "DESC") {
                    ixConf[f.name] = -1;
                } else {
                    ixConf[f.name] = 1;
                }
            }

            await client.db().collection(ix.collection).createIndex(ixConf, { unique: ix.unique });

            Monitor.info(`Set ${ix.unique ? 'unique ' : ''}index for ${ix.collection} as ${JSON.stringify(ixConf)}`);
        }
    } else {
        Monitor.warning("Not a Mongo database set in the configuration");
    }
}
