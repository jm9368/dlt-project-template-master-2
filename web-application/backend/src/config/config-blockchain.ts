// Reserved for license

"use strict";

import { Quantity, RPCProvider, RPC_HTTP_Provider, RPC_WebSocket_Provider, hexNoPrefix } from "@asanrom/smart-contract-wrapper";

const TIMEOUT_MS = 30000;

/**
 * Mailer configuration.
 */
export class BlockchainConfig {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): BlockchainConfig {
        if (BlockchainConfig.instance) {
            return BlockchainConfig.instance;
        }

        const config: BlockchainConfig = new BlockchainConfig();

        switch (process.env.BLOCKCHAIN_NODE_PROTOCOL || "http") {
            case "http":
            case "https":
                config.protocol = "http";
                config.url = process.env.BLOCKCHAIN_NODE_RPC_URL || "http://localhost:8545";
                config.provider = new RPC_HTTP_Provider(config.url);
                break;
            case "ws":
                config.protocol = "ws";
                config.url = process.env.BLOCKCHAIN_NODE_RPC_URL || "ws://localhost:8546";
                config.provider = new RPC_WebSocket_Provider(config.url);
                break;
            default:
                throw new Error("Invalid protocol: " + config.protocol + " | Allowed protocols for blockchain connections: http, ws");
        }

        config.privateKeys.admin = Buffer.from(hexNoPrefix(process.env.BLOCKCHAIN_PK_ADMIN || "0000000000000000000000000000000000000000000000000000000000000000"), "hex");

        config.sync = process.env.BLOCKCHAIN_SYNC === "YES";

        config.firstBlock = BigInt(process.env.BLOCKCHAIN_SYNC_FIRST_BLOCK || 0);

        config.eventSyncRange = parseInt(process.env.BLOCKCHAIN_SYNC_RANGE || "1", 10) || 1;

        config.blockTime = parseInt(process.env.BLOCKCHAIN_SYNC_TIME || "1000", 10) || 1000;

        BlockchainConfig.instance = config;

        return config;
    }
    private static instance: BlockchainConfig = null;

    public protocol: "http" | "ws";
    public url: string;

    public provider: RPCProvider;

    public firstBlock: Quantity;

    public sync: boolean;
    public eventSyncRange: number;
    public blockTime: number;

    public contracts: any;

    public privateKeys: {
        admin: Buffer,
    };

    constructor() {
        this.protocol = "http";
        this.url = "http://localhost:8545";
        this.provider = null;
        this.contracts = Object.create(null);
        this.privateKeys = Object.create(null);
        this.firstBlock = BigInt(0);
        this.eventSyncRange = 1;
        this.blockTime = 1000;
        this.sync = true;
    }
}
