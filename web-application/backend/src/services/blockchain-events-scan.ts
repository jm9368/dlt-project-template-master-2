// Blockchain event scanner

"use strict";

import { AsyncInterval } from "@asanrom/async-tools";
import { Quantity, SmartContractEvent, Web3RPCClient } from "@asanrom/smart-contract-wrapper";
import { Config } from "../config/config";
import { BlockchainConfig } from "../config/config-blockchain";
import { DynamicConfiguration } from "../models/dynconf";
import { Monitor } from "../monitor";

export const DYN_CONF_CURRENT_BLOCK = "event_sync_current_block";

export class BlockchainEventsScanner {
    public static instance: BlockchainEventsScanner = null;

    public static getInstance(): BlockchainEventsScanner {
        if (BlockchainEventsScanner.instance) {
            return BlockchainEventsScanner.instance;
        } else {
            BlockchainEventsScanner.instance = new BlockchainEventsScanner();
            return BlockchainEventsScanner.instance;
        }
    }

    public currentBlock: Quantity;
    public maxRange: number;

    private interval: AsyncInterval;

    constructor() {
        this.currentBlock = BlockchainConfig.getInstance().firstBlock;
        this.maxRange = BlockchainConfig.getInstance().eventSyncRange;
    }

    public async reset() {
        await DynamicConfiguration.setConfiguration(DYN_CONF_CURRENT_BLOCK, "");
    }

    public async start() {
        const currentBlock = await DynamicConfiguration.getStringConfiguration(DYN_CONF_CURRENT_BLOCK, "");

        if (currentBlock) {
            const blockQ = BigInt(currentBlock);
            if (blockQ > this.currentBlock) {
                this.currentBlock = blockQ;
            }
        }

        this.interval = new AsyncInterval(this.scan.bind(this), BlockchainConfig.getInstance().blockTime);
        this.interval.on("error", err => {
            Monitor.exception(err);
            Monitor.error("Error syncing the blockchain");
        });
        this.interval.start(true);
    }

    private async storeCurrentBlock() {
        const currentBlockHex = "0x" + this.currentBlock.toString(16);
        await DynamicConfiguration.setConfiguration(DYN_CONF_CURRENT_BLOCK, currentBlockHex);
    }

    private async scan() {
        const lastBlock = await Web3RPCClient.getInstance().getBlockByNumber("latest", { provider: BlockchainConfig.getInstance().provider });
        const lastBlockNumber = lastBlock.number;

        if (this.currentBlock >= lastBlockNumber) {
            return; // Nothing to sync
        }

        while (this.currentBlock < lastBlockNumber) {
            const rangeStart = this.currentBlock + BigInt(1);
            let rangeEnd = rangeStart + BigInt(this.maxRange);

            if (rangeEnd > lastBlockNumber) {
                rangeEnd = lastBlockNumber;
            }

            // Add scanning methods below this line
            
            // await this.scanEventsExampleContract(rangeStart, rangeEnd);

            this.currentBlock = rangeEnd;
            await this.storeCurrentBlock();
            Monitor.debug("[EVENTS SYNC] Sync block event / Block: 0x" + this.currentBlock.toString(16));
        }
    }

    /*private async scanEventsExampleContract(fromBlock: bigint, toBlock: bigint) {
        const events = await BlockchainConfig.getExampleSmartContract().findEvents(fromBlock, toBlock);

        this.logEvents(events.events);

        for (let i = 0; i < events.length(); i++) {
            const eventType = events.getEventType(i);
            switch (eventType) {
                case "ExampleEvent":
                    {
                        const ev = events.getExampleEvent(i);
                        const timestamp = await this.getBlockTimestamp(ev.event.log.blockNumber);
                        // Handle event. Eg: Store in database
                    }
                    break;
            }
        }
    }*/

    private logEvents(events: SmartContractEvent[]) {
        if (!Config.getInstance().isProduction) {
            for (const event of events) {
                Monitor.debug("[EVENT] " + event.signature + " | Data: " + event.parameters.map(p => {
                    if (typeof p === "bigint") {
                        return "0x" + p.toString(16);
                    } else if (typeof p === "string") {
                        return JSON.stringify(p);
                    } else if (p instanceof Buffer) {
                        return JSON.stringify(p.toString("hex"));
                    } else {
                        return "" + p;
                    }
                }).join(","));
            }
        }
    }

    private async getBlockTimestamp(blockNumber: Quantity): Promise<number> {
        const block = await Web3RPCClient.getInstance().getBlockByNumber(blockNumber, {
            provider: BlockchainConfig.getInstance().provider,
        });

        return parseInt(block.timestamp.toString(10), 10) * 1000;
    }
}
