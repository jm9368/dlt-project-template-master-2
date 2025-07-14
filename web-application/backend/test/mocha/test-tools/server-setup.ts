// Server setup
// Setups config, smart contracts and a test server

"use strict";

import FS from "fs";
import Path from "path";
import { AsyncSemaphore } from "@asanrom/async-tools";
import { TestLog } from "./log";
import { setupMongoDatabaseIndexes } from "../../../src/utils/mongo-db-indexes";
import { MainWebApplication } from "../../../src/app";
import { BlockchainEventsScanner } from "../../../src/services/blockchain-events-scan";
import { Config } from "../../../src/config/config";
import { FileStorageConfig } from "../../../src/config/config-file-storage";
import { DatabaseConfig } from "../../../src/config/config-database";
import { TaskService } from "../../../src/services/task-service";

export interface TestServerState {
    port: number;
}

const SETUP_STATE: {
    sem: AsyncSemaphore,
    ready: boolean,
    state: TestServerState,
} = {
    sem: new AsyncSemaphore(),
    ready: false,
    state: {
        port: 0,
    },
};

export function getServerStatus(): TestServerState {
    return SETUP_STATE.state;
}


/**
 * Setups a test server and return the listening port
 * IMPORTANT: Must call this before any API tests
 */
export async function setupTestServer(): Promise<TestServerState> {
    await SETUP_STATE.sem.acquire();

    if (SETUP_STATE.ready) {
        SETUP_STATE.sem.release();

        return SETUP_STATE.state;
    }

    try {
        await setupAll();
        // Set the status to ready
        SETUP_STATE.ready = true;
    } catch (ex) {
        SETUP_STATE.sem.release();
        throw ex;
    }

    SETUP_STATE.sem.release();

    return SETUP_STATE.state;
}

const TEST_BESU_NODE_RPC = "http://localhost:8545"
const TEST_PRIVATE_KEY = "3de106f01f3fa595f215f50a0daf2ddd1bd061663b69396783a70dcee9f1f755";
const TEST_PRIVATE_KEY_BUFFER = Buffer.from(TEST_PRIVATE_KEY, "hex");

export const TEST_BINANCE_KEY = "jzfohdbb0tte42sgfzj9fkmpb5hmsswwnxbjy8waohjpytndpwck8lgpg5xxxitb";

async function setupAll() {
    // Initial config

    TestLog.info("Initializing test configuration...");

    require("dotenv").config();

    // Clear temp dir

    try {
        FS.mkdirSync(Path.resolve(__dirname, "..", "..", "..", "temp"));
    } catch (ex) { }

    const tempFiles = FS.readdirSync(Path.resolve(__dirname, "..", "..", "..", "temp"));

    for (const tempFile of tempFiles) {
        try {
            FS.unlinkSync(Path.resolve(__dirname, "..", "..", "..", "temp", tempFile));
        } catch (e) { }
    }

    // Override config

    Config.IS_TEST = true;

    process.env.DISABLE_EMAIL_VALIDATION = "YES";
    process.env.REDIS_ENABLED = "NO";
    process.env.MAIL_ENABLED = "NO";
    process.env.LOG_ELASTIC_SEARCH_ENABLED = "NO";
    process.env.FILE_STORAGE_PRIVATE_SECRET = "secret";

    // Deploy smart contracts
    TestLog.info("Deploying test smart contracts...");

    await deploySmartContracts();

    // Load config
    Config.getInstance();

    // Setup database
    TestLog.info("Preparing test database...");

    DatabaseConfig.getInstance();

    await setupMongoDatabaseIndexes({
        dropDB: true,
    });

    // Start test server
    TestLog.info("Starting test HTTP server...");
    const app = new MainWebApplication();
    SETUP_STATE.state.port = await app.startTest();

    Config.getInstance().uriBackend = `http://127.0.0.1:${SETUP_STATE.state.port}`;
    FileStorageConfig.getInstance().staticFilesBaseURL = Config.getInstance().uriBackend + "/static/";

    // Start services
    TestLog.info("Starting rest of services...");

    // Run blockchain sync
    await BlockchainEventsScanner.getInstance().start();

    // Start task service
    TaskService.getInstance().start();
}


async function deploySmartContracts() {
    // Deploy smart contracts
    // We assume they are already compiled



    // Change configuration (env)
}
