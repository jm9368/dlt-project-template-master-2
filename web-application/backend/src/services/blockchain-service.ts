// Blockchain service

"use strict";

import { MethodTransactionOptions, TransactionSendingOptions } from "@asanrom/smart-contract-wrapper";
import { BlockchainConfig } from "../config/config-blockchain";
import { DynamicConfiguration } from "../models/dynconf";
import { Monitor } from "../monitor";
import { DYN_CONF_CURRENT_BLOCK } from "./blockchain-events-scan";
import { Wallet } from "../models/wallet";
import { User } from "../models/users/user";

/**
 * User wallet information
 */
export interface ProvidedUserWallet {
    /**
     * The wallet retrieved from the database
     * This is null if the wallet was not found
     */
    wallet: Wallet | null,

    /**
     * The private key of the wallet
     * This is null if the password is not specified or invalid
     */
    privateKey: Buffer | null,
}

/**
 * Blockchain service
 */
export class BlockchainService {
    /* Singleton */

    public static instance: BlockchainService = null;

    public static getInstance(): BlockchainService {
        if (BlockchainService.instance) {
            return BlockchainService.instance;
        } else {
            BlockchainService.instance = new BlockchainService();
            return BlockchainService.instance;
        }
    }

    constructor() {
    }

    /**
     * Gets a wallet from the request
     * @param walletId The wallet ID
     * @param user The user that is authenticated
     * @param walletPassword The wallet password (required to get the private key)
     * @returns The wallet + private key (if unlocked)
     */
    public async getWallet(walletId: string, user: User, walletPassword?: string): Promise<ProvidedUserWallet> {
        if (!walletId) {
            return {
                wallet: null,
                privateKey: null,
            };
        }

        const wallet = await Wallet.findById(walletId);

        if (!wallet || wallet.uid !== user.id) {
            return {
                wallet: null,
                privateKey: null,
            };
        }

        if (!walletPassword || !wallet.checkPassword(walletPassword)) {
            return {
                wallet: wallet,
                privateKey: null,
            };
        }

        const privateKey = wallet.unlock(walletPassword);

        return {
            wallet: wallet,
            privateKey: privateKey,
        };
    }

    /**
     * Gets smart contract method transaction options for an user wallet
     * Note: The private key must be not null for this to work
     * @param wallet The user wallet information
     * @returns The smart contract method transaction options
     */
    public getMethodTransactionOptions(wallet: ProvidedUserWallet): MethodTransactionOptions {
        return {
            privateKey: wallet.privateKey,
            logFunction: msg => {
                Monitor.debug(msg);
            },
        };
    }

    /**
     * Gets transaction sending options for an user wallet
     * Note: The private key must be not null for this to work
     * @param wallet The user wallet information
     * @returns The transaction sending options
     */
    public getTransactionSendingOptions(wallet: ProvidedUserWallet): TransactionSendingOptions {
        return {
            provider: BlockchainConfig.getInstance().provider,
            privateKey: wallet.privateKey,
            logFunction: msg => {
                Monitor.debug(msg);
            },
        };
    }

    /**
     * Gets smart contract method transaction options for the administrator private key
     * @returns The smart contract method transaction options
     */
    public getMethodTransactionOptionsAdmin(): MethodTransactionOptions {
        return {
            privateKey: BlockchainConfig.getInstance().privateKeys.admin,
            logFunction: msg => {
                Monitor.debug(msg);
            },
        };
    }

    /**
     * Gets transaction sending options for the administrator private key
     * @returns The transaction sending options
     */
    public getTransactionSendingOptionsAdmin(): TransactionSendingOptions {
        return {
            provider: BlockchainConfig.getInstance().provider,
            privateKey: BlockchainConfig.getInstance().privateKeys.admin,
            logFunction: msg => {
                Monitor.debug(msg);
            },
        };
    }

    /**
     * Waits for a block to be synced
     * @param block The block number to wait for
     * @param maxSecondsWait Max number of seconds to wait
     */
    public async waitForBlockSync(block: bigint, maxSecondsWait?: number) {
        let remainingTries = maxSecondsWait || 10;

        while (remainingTries > 0) {
            const currentBlock = await DynamicConfiguration.getStringConfiguration(DYN_CONF_CURRENT_BLOCK, "");

            if (currentBlock) {
                const blockQ = BigInt(currentBlock);
                if (blockQ >= block) {
                    return; // Done
                }
            }

            remainingTries--;

            await (new Promise(resolve => {
                setTimeout(resolve, 1000);
            }));
        }
    }
}
