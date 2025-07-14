// Setup mongoDB script

"use strict";

require('dotenv').config();

process.env.LOG_ELASTIC_SEARCH_ENABLED = "NO";

import { setupMongoDatabaseIndexes } from "./utils/mongo-db-indexes";
import { Monitor } from "./monitor";

setupMongoDatabaseIndexes().then(() => {
    Monitor.info("Successfully setup MongoDB Indexes");
    process.exit(0);
}).catch(err => {
    Monitor.exception(err);
    process.exit(1);
});
