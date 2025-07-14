// Reserved for license

"use strict";

import { FileStorageConfig, FileStorageMode } from "../config/config-file-storage";
import { resolveURL } from "../utils/http-utils";
import { FileStorageFileSystem } from "./file-storage-fs";
import { Readable } from "stream";
import JWT from "jsonwebtoken";

/**
 * Signature algorithm for file access authentication tokens
 */
export const TOKEN_SIGN_ALGO: JWT.Algorithm = "HS256";

/**
 * Subject for file access authentication tokens
 */
export const TOKEN_SUBJECT = "file_access";

/**
 * Default expiration time of tokens (seconds)
 */
const DEFAULT_TOKEN_EXPIRATION = 24 * 60 * 60;

/**
 * This service manages the file storage
 */
export class FileStorageService {
    public static instance: FileStorageService = null;

    public static getInstance(): FileStorageService {
        if (FileStorageService.instance) {
            return FileStorageService.instance;
        } else {
            FileStorageService.instance = new FileStorageService();
            return FileStorageService.instance;
        }
    }

    private mode: FileStorageMode;

    constructor() {
        this.mode = FileStorageConfig.getInstance().storageMode;
    }

    /**
     * Gets URL for static file, using the file storage key
     * @param key The file storage key
     * @param expirationSeconds The expiration time for the URL (seconds)
     * @returns The file URL
     */
    public getStaticFileURL(key: string, expirationSeconds?: number): string {
        if (!key) {
            return "";
        }

        if (key.startsWith("public/")) {
            return resolveURL(key, FileStorageConfig.getInstance().staticFilesBaseURL);
        } else {
            const authToken = JWT.sign(
                {
                    sub: TOKEN_SUBJECT,
                    key: key,
                },
                FileStorageConfig.getInstance().privateFilesSecret,
                {
                    algorithm: TOKEN_SIGN_ALGO, 
                    expiresIn: expirationSeconds || DEFAULT_TOKEN_EXPIRATION
                }
            );
            return resolveURL(key + "?auth=" + encodeURIComponent(authToken), FileStorageConfig.getInstance().staticFilesBaseURL);
        }
    }

    /**
     * Verifies authentication token for static file
     * @param key The file storage key
     * @param token The authentication token
     * @returns True if verified
     */
    public verifyAuthToken(key: string, token: string): boolean {
        try {
            const jwt = JWT.verify(token, FileStorageConfig.getInstance().privateFilesSecret, {algorithms: [TOKEN_SIGN_ALGO]}) as JWT.JwtPayload;
            return jwt.sub === TOKEN_SUBJECT && (jwt.key + "") === key;
        } catch (ex) {
            return false;
        }
    }

    /**
     * Generates a random file key
     * @param isPublic True if the file will be public
     * @param ext The file extension
     * @returns the file key
     */
    public async getRandomKey(isPublic: boolean, ext?: string): Promise<string> {
        switch (this.mode) {
            case "fs":
                return FileStorageFileSystem.getInstance().getRandomKey(isPublic, ext);
            default:
                throw new Error("File storage service is misconfigured");
        }
    }

    /**
     * Checks if the object exists
     * @param key Object key
     * @returns True if the object exists
     */
    public async checkExists(key: string): Promise<boolean> {
        switch (this.mode) {
            case "fs":
                return FileStorageFileSystem.getInstance().checkExists(key);
            default:
                throw new Error("File storage service is misconfigured");
        }
    }

    /**
     * Gets contents of an object
     * @param key Object key
     * @returns Object contents
     */
    public async getObjectContents(key: string): Promise<Buffer> {
        switch (this.mode) {
            case "fs":
                return FileStorageFileSystem.getInstance().getObjectContents(key);
            default:
                throw new Error("File storage service is misconfigured");
        }
    }

    /**
     * Gets contents of an object as stream
     * @param key Object key
     * @returns Object contents
     */
    public async getObjectContentsStream(key: string): Promise<Readable> {
        switch (this.mode) {
            case "fs":
                return FileStorageFileSystem.getInstance().getObjectContentsStream(key);
            default:
                throw new Error("File storage service is misconfigured");
        }
    }

    /**
     * Set object contents
     * @param key Object key
     * @param contents Contents (as Buffer)
     */
    public async setObjectContents(key: string, contents: string) {
        switch (this.mode) {
            case "fs":
                return FileStorageFileSystem.getInstance().setObjectContents(key, contents);
            default:
                throw new Error("File storage service is misconfigured");
        }
    }

    /**
     * Uploads file
     * @param key Object key
     * @param file File to upload
     */
    public async uploadFile(key: string, file: string) {
        switch (this.mode) {
            case "fs":
                return FileStorageFileSystem.getInstance().uploadFile(key, file);
            default:
                throw new Error("File storage service is misconfigured");
        }
    }

    /**
     * Deletes file from storage
     * @param key Key
     */
    public async deleteFile(key: string) {
        switch (this.mode) {
            case "fs":
                return FileStorageFileSystem.getInstance().deleteFile(key);
            default:
                throw new Error("File storage service is misconfigured");
        }
    }
}
