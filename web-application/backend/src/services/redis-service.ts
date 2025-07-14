// Reserved for license

"use strict";

import Redis from "ioredis";
import { RedisConfig } from "../config/config-redis";
import { Monitor } from "../monitor";

/**
 * Redis client service
 */
export class RedisService {

    /* Singleton */

    public static instance: RedisService = null;

    public static getInstance(): RedisService {
        if (RedisService.instance !== null) {
            return RedisService.instance;
        } else {
            RedisService.instance = new RedisService();
            return RedisService.instance;
        }
    }

    /* Class */

    public pubClient: Redis;
    public subClient: Redis;
    public cacheClient: Redis;

    public config: RedisConfig;

    private subCount: Map<string, number>;

    private eventsMap: Map<string, ((message: string) => any)[]>;

    constructor() {
        this.pubClient = null;
        this.subClient = null;
        this.config = RedisConfig.getInstance();
        this.eventsMap = new Map();
        this.subCount = new Map();
    }

    /**
     * Emits a message event
     * @param channel - Channel
     * @param message - Message
     */
    public emit(channel: string, message: string) {
        const arrayCallbacks = this.eventsMap.get(channel);
        if (arrayCallbacks) {
            for (const callback of arrayCallbacks) {
                try {
                    callback(message);
                } catch (ex) {
                    Monitor.exception(ex);
                }
            }
        }
    }

    /**
     * Publish message
     * @param channel Channel
     * @param message Message
     */
    public async publish(channel: string, message: string): Promise<number> {
        if (!RedisConfig.getInstance().enabled) {
            return 0;
        }

        this.usePubClient();
        return new Promise<number>((resolve, reject) => {
            this.pubClient.publish(channel, message, (error: Error, n: number) => {
                if (error) {
                    return reject(error);
                }
                resolve(n);
            });
        });
    }

    /**
     * Subscribe to a channel
     * @param channel Channel
     * @param listener Message listener
     */
    public subscribe(channel: string, listener: (message: string) => void) {
        if (!RedisConfig.getInstance().enabled) {
            return;
        }

        this.useSubClient();
        if (this.subCount.get(channel)) {
            this.subCount.set(channel, this.subCount.get(channel) + 1);
        } else {
            this.subClient.subscribe(channel);
            this.subCount.set(channel, 1);
        }
        if (!this.eventsMap.has(channel)) {
            this.eventsMap.set(channel, []);
        }
        this.eventsMap.get(channel).push(listener);
    }

    /**
     * Removes a subscription
     * @param channel Channel
     * @param listener Message listener
     */
    public unsubscribe(channel: string, listener: (...args: any[]) => void) {
        if (!RedisConfig.getInstance().enabled) {
            return;
        }

        this.useSubClient();
        if (this.subCount.get(channel)) {
            this.subCount.set(channel, this.subCount.get(channel) - 1);
        }
        if (!this.subCount.get(channel)) {
            this.subClient.unsubscribe(channel);
            this.subCount.delete(channel);
        }
        if (!this.eventsMap.has(channel)) {
            return;
        }
        const arrayCallbacks = this.eventsMap.get(channel);
        const indexListener = arrayCallbacks.indexOf(listener);
        if (indexListener >= 0) {
            arrayCallbacks.splice(indexListener, 1);

            if (arrayCallbacks.length === 0) {
                this.eventsMap.delete(channel);
            }
        }
    }

    /**
     * Gets from cache
     * @param key Key
     * @returns Value
     */
    public async getFromCache(key: string): Promise<string> {
        if (!RedisConfig.getInstance().enabled) {
            return null;
        }

        this.useCacheClient();

        return new Promise<string>((resolve, reject) => {

            let timedOut = false;
            const timeout = setTimeout(() => {
                timedOut = true;
                resolve(null);
            }, 1000);

            this.cacheClient.get(key, (err, data) => {
                if (timedOut) { return; }
                clearTimeout(timeout);

                if (err) {
                    console.warn("[ERROR FROM REDIS] " + err.message);
                    return resolve(null);
                }

                if (data !== null) {
                    return resolve("" + data);
                } else {
                    return resolve(null);
                }
            });
        });
    }

    /**
     * Sets cache
     * @param key Key
     * @param value Value
     * @param ttl TTL (seconds)
     */
    public async setCache(key: string, value: string, ttl: number) {
        if (!RedisConfig.getInstance().enabled) {
            return;
        }

        this.useCacheClient();
        await this.cacheClient.setex(key, ttl, value);
    }

    /**
     * Deletes cache
     * @param key Key
     */
    public async delCache(key: string) {
        if (!RedisConfig.getInstance().enabled) {
            return;
        }

        this.useCacheClient();
        await this.cacheClient.del(key);
    }

    /* Private methods */

    private useCacheClient() {
        if (!this.cacheClient) {
            this.cacheClient = new Redis({
                host: this.config.host,
                port: this.config.port,
                password: this.config.password || undefined,
                tls: this.config.tls ? {} : undefined,
            });
        }
    }

    private useSubClient() {
        if (!this.subClient) {
            this.subClient = new Redis({
                host: this.config.host,
                port: this.config.port,
                password: this.config.password || undefined,
                tls: this.config.tls ? {} : undefined,
            });

            this.subClient.on("message", this.onMessage.bind(this));
        }
    }

    private usePubClient() {
        if (!this.pubClient) {
            this.pubClient = new Redis({
                host: this.config.host,
                port: this.config.port,
                password: this.config.password || undefined,
                tls: this.config.tls ? {} : undefined,
            });
        }
    }

    private async onMessage(channel: string, message: string) {
        Monitor.debug("[PUB/SUB] Reveived message from channel '" + channel + "' -> " + message);
        this.emit(channel, message);
    }
}
