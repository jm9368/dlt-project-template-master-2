// Reserved for license

"use strict";

import { DataModel, DataSource, DataFinder } from "tsbean-orm";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "dynamic_configuration";
const PRIMARY_KEY = "configKey";


/**
 * Represents a dynamic configuration.
 */
export class DynamicConfiguration extends DataModel {

    public static finder = new DataFinder<DynamicConfiguration>(DATA_SOURCE, TABLE, PRIMARY_KEY, function (data) {
        return new DynamicConfiguration(data);
    });

    /**
     * Gets a configuration value as String
     * @param key The key
     * @param defaultValue the default value
     */
    public static async getStringConfiguration(key: string, defaultValue?: string): Promise<string> {
        const config = await DynamicConfiguration.findByID(key);
        if (config) {
            return config.configValue;
        } else {
            return defaultValue || "";
        }
    }

    /**
     * Gets a configuration value as Number
     * @param key The key
     * @param defaultValue The default value
     */
    public static async getNumberConfiguration(key: string, defaultValue?: number): Promise<number> {
        const config = await DynamicConfiguration.findByID(key);
        if (config) {
            return Number(config.configValue);
        } else {
            return defaultValue || 0;
        }
    }

    /**
     * Sets a dynamic configuration value
     * @param key The key
     * @param value The value
     */
    public static async setConfiguration(key: string, value: any): Promise<void> {
        let config = await DynamicConfiguration.findByID(key);
        if (config) {
            config.configValue = "" + value;
            await config.save();
        } else {
            config = new DynamicConfiguration({
                configKey: key,
                configValue: value,
            });
            try {
                await config.insert();
            } catch (ex) {
                config = await DynamicConfiguration.findByID(key);
                if (config) {
                    config.configValue = "" + value;
                    await config.save();
                }
            }
        }
    }

    /**
     * Finds configuration by ID
     * @param id The configuration id.
     */
    public static async findByID(id: string): Promise<DynamicConfiguration> {
        return DynamicConfiguration.finder.findByKey(id);
    }

    public configKey: string;

    /* db-type: medium-text */
    public configValue: string;

    constructor(data: any) {
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        this.configKey = data.configKey || "";
        this.configValue = data.configValue || "";

        this.init();
    }
}
