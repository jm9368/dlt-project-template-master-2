// Reserved for license

"use strict";

import Path from "path";
import FS from "fs";
import { createRandomUID } from "../utils/text-utils";
import { FileStorageConfig } from "../config/config-file-storage";
import { Readable } from "stream";
import { sha256 } from "../utils/hash";

async function ensureFileDirnameExists(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        FS.mkdir(Path.dirname(path), { recursive: true }, err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

async function removeFileIfExists(path: string): Promise<void> {
    return new Promise<void>((resolve,) => {
        FS.unlink(path, () => {
            resolve();
        });
    });
}

/**
 * This service manages the file storage
 */
export class FileStorageFileSystem {
    public static instance: FileStorageFileSystem = null;

    public static getInstance(): FileStorageFileSystem {
        if (FileStorageFileSystem.instance) {
            return FileStorageFileSystem.instance;
        } else {
            FileStorageFileSystem.instance = new FileStorageFileSystem();
            return FileStorageFileSystem.instance;
        }
    }

    private path: string;

    constructor() {
        this.path = FileStorageConfig.getInstance().fileSystemPath;
    }

    /**
     * Gets the path of a file in the system
     * @param key The key
     * @returns The file path
     */
    public getFilePath(key: string): string {
        if (key.startsWith("/") || key.includes("..")) {
            throw new Error("Invalid key");
        }
        return Path.resolve(this.path, key);
    }

    /**
     * Generates a random file key
     * @param isPublic True if the file will be public
     * @param ext The file extension
     * @returns the file key
     */
    public async getRandomKey(isPublic: boolean, ext?: string): Promise<string> {
        let fileName: string;
        if (ext) {
            fileName = createRandomUID() + "." + ext;
        } else {
            fileName = createRandomUID();
        }
        const fileNameHash = sha256(fileName);
        const randomKey = (isPublic ? "public" : "private") + "/" + fileNameHash.substring(0, 2) + "/" + fileName;
        const path = this.getFilePath(randomKey);
        await ensureFileDirnameExists(path);
        return randomKey;
    }

    /**
     * Checks if the object exists
     * @param key Object key
     * @returns True if the object exists
     */
    public async checkExists(key: string): Promise<boolean> {
        const path = this.getFilePath(key);
        return new Promise<boolean>(function (resolve, reject) {
            FS.stat(path, function (err, stats) {
                if (err) {
                    return resolve(false);
                }
                resolve(stats.isFile());
            });
        });
    }

    /**
     * Gets contents of an object
     * @param key Object key
     * @returns Object contents
     */
    public async getObjectContents(key: string): Promise<Buffer> {
        const path = this.getFilePath(key);
        return new Promise<Buffer>(function (resolve, reject) {
            FS.readFile(path, function (err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    /**
     * Gets contents of an object as stream
     * @param key Object key
     * @returns Object contents
     */
    public async getObjectContentsStream(key: string): Promise<Readable> {
        const path = this.getFilePath(key);
        return FS.createReadStream(path);
    }

    /**
     * Set object contents
     * @param key Object key
     * @param contents Contents (as Buffer)
     */
    public async setObjectContents(key: string, contents: string | Buffer) {
        const path = this.getFilePath(key);
        await ensureFileDirnameExists(path);
        return new Promise<void>(function (resolve, reject) {
            FS.writeFile(path, contents, function (err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * Uploads file
     * @param key Object key
     * @param file File to upload
     */
    public async uploadFile(key: string, file: string) {
        const path = this.getFilePath(key);
        await ensureFileDirnameExists(path);
        await removeFileIfExists(path);
        return new Promise<void>(function (resolve, reject) {
            FS.copyFile(file, path, function (err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * Deletes file from storage
     * @param key Key
     */
    public async deleteFile(key: string) {
        const path = this.getFilePath(key);
        return new Promise<void>(function (resolve, reject) {
            FS.unlink(path, function (err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}
