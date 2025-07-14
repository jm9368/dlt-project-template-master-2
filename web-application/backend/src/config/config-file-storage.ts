// Reserved for license

"use strict";

import { Monitor } from "../monitor";
import { Config } from "./config";

export type FileStorageMode = "fs";

/**
 * File storage configuration 
 */
export class FileStorageConfig {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): FileStorageConfig {
        if (FileStorageConfig.instance) {
            return FileStorageConfig.instance;
        }

        const config: FileStorageConfig = new FileStorageConfig();

        switch (((process.env.FILE_STORAGE_MODE || "fs") + "").toLowerCase()) {
            case "fs":
            case "filesystem":
                config.storageMode = "fs";
                config.fileSystemPath = process.env.FILE_STORAGE_FS_PATH || "./data";
                config.privateFilesSecret = process.env.FILE_STORAGE_PRIVATE_SECRET || "";
                config.staticFilesBaseURL = process.env.FILE_STORAGE_SERVER_URL || Config.getInstance().getBackendURI("/static/");
                break;
            default:
                throw new Error("Configuration error: Unknown file storage type: " + process.env.FILE_STORAGE_MODE);
        }

        if (!config.privateFilesSecret) {
            Monitor.warning("The FILE_STORAGE_PRIVATE_SECRET variable is not set or empty. Private files authentication will fail.");
        }

        FileStorageConfig.instance = config;

        return config;
    }
    private static instance: FileStorageConfig = null;

    public storageMode: FileStorageMode;

    public staticFilesBaseURL: string;

    public privateFilesSecret: string;

    public fileSystemPath: string;

    constructor() {
        this.storageMode = "fs";
        this.fileSystemPath = "./data";
        this.privateFilesSecret = "secret";
        this.staticFilesBaseURL = "/static/";
    }
}
