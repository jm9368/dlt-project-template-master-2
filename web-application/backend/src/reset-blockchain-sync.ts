// Setup mongoDB script

"use strict";

require('dotenv').config();

process.env.LOG_ELASTIC_SEARCH_ENABLED = "NO";

import { DatabaseConfig } from "./config/config-database";
import { Monitor } from "./monitor";
import { BlockchainEventsScanner } from "./services/blockchain-events-scan";

DatabaseConfig.getInstance();

BlockchainEventsScanner.getInstance().reset().then(() => {
    Monitor.info("Successfully reset blockchain event synchronization data");
    process.exit(0);
}).catch(err => {
    Monitor.exception(err);
    process.exit(1);
});
