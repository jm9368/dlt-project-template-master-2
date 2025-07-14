// Reserved for license

"use strict";

import { FFmpegConfig } from "../config/config-ffmpeg";
import ChildProcess from "child_process";
import { Monitor } from "../monitor";
import FFProbe from "ffprobe";
import { clearTempFile, makeTempFile } from "../utils/file-utils";
import { FileStorageService } from "./file-storage";

/**
 * Probed image
 */
export interface ProbedImage {
    /**
     * True if valid
     */
    valid: boolean;

    /**
     * Width (pixels)
     */
    width?: number;

    /**
     * Height (pixels)
     */
    height?: number;
}

/**
 * Represents image resolution to encode
 */
export interface ImageResolution {
    /**
     * Width (pixels)
     */
    width: number;

    /**
     * Height (pixels)
     */
    height: number;
}

/**
 * Two factor authentication service
 */
export class ImagesService {
    /* Singleton */

    public static instance: ImagesService = null;

    public static getInstance(): ImagesService {
        if (ImagesService.instance) {
            return ImagesService.instance;
        } else {
            ImagesService.instance = new ImagesService();
            return ImagesService.instance;
        }
    }

    /**
     * Resolutions for app assets (Pre-Defined)
     */
    public static RESOLUTIONS = {
        /**
         * Profile images
         */
        PROFILE_IMAGES: { width: 300, height: 300 },
    };

    constructor() {

    }

    /* Private */

    private async runEncodingProcess(args: string[]): Promise<void> {
        return new Promise<void>(function (resolve, reject) {
            const process = ChildProcess.spawn(FFmpegConfig.getInstance().ffmpegBinary, args);
            process.on('close', (code, signal) => {
                if (code !== 0) {
                    reject(new Error(`FFMPEG ended with code=${code} AND signal=${signal}`));
                } else {
                    resolve();
                }
            });
            process.stderr.on("data", (data) => {
                Monitor.debug("[FFMPEG] " + data.toString());
            });
        });
    }

    private getVideoFilter(resolution: { width: number, height: number }): string {
        return "scale=" + resolution.width + ":" + resolution.height + ":force_original_aspect_ratio=decrease,format=rgba,pad=" + resolution.width + ":" + resolution.height + ":(ow-iw)/2:(oh-ih)/2:color=#00000000";
    }

    private getEncodingArguments(originalFile: string, destFiles: { path: string, width: number, height: number }[]): string[] {
        const args: string[] = [];

        // Do not ask any confirmations
        args.push('-y');

        // Input
        args.push('-i', originalFile);

        for (const output of destFiles) {
            // Options
            args.push('-frames:v', '1', '-an');
            args.push('-vf', this.getVideoFilter({ width: output.width, height: output.height }));

            // Dest
            args.push(output.path);
        }

        return args;
    }

    private getEncodingArgumentsNoResize(originalFile: string, destFile: string): string[] {
        const args: string[] = [];

        // Do not ask any confirmations
        args.push('-y');

        // Input
        args.push('-i', originalFile);

        // Output
        args.push('-frames:v', '1', '-an');
        args.push(destFile);

        return args;
    }

    /* Public */

    /**
     * Validates image
     * @param file The file
     * @returns The validation result
     */
    public async probeImage(file: string): Promise<ProbedImage> {
        return new Promise<ProbedImage>((resolve) => {
            FFProbe(file, { path: FFmpegConfig.getInstance().ffprobeBinary }, (err, info) => {
                if (err) {
                    Monitor.debugException(err);
                    return resolve({ valid: false });
                }

                Monitor.debug("Probed image.", info as any);

                if (info.streams && info.streams[0] && (info.streams[0].codec_type === "images" || info.streams[0].codec_type === "video")) {
                    return resolve({ valid: true, width: info.streams[0].width, height: info.streams[0].height });
                } else {
                    return resolve({ valid: false });
                }
            });
        });
    }

    /**
     * Encodes image
     * @param original Original file
     * @param destination Destination file
     */
    public async encodeImage(original: string, destination: string) {
        const args = this.getEncodingArgumentsNoResize(original, destination);

        // Encode
        await this.runEncodingProcess(args);
    }

    /**
     * Encodes and resizes image
     * @param original Original file
     * @param destination Destination file
     * @param resolution Destination resolution
     */
    public async encodeAndResizeImage(original: string, destination: string, resolution: ImageResolution) {
        const args = this.getEncodingArguments(original, [{
            width: resolution.width,
            height: resolution.height,
            path: destination,
        }]);

        // Encode
        await this.runEncodingProcess(args);
    }

    /**
     * Encodes and stores an image asset
     * @param image The original image file
     * @param format The format. PNG will allow transparency, JPG will not.
     * @param resolution The resolution
     * @param isPublic True if the asset should be public, false for private
     * @returns The storage key for the encoded image
     */
    public async encodeAndStoreImage(image: string, format: "png" | "jpg", isPublic: boolean): Promise<string> {
        const tempDestination = makeTempFile() + "." + format;

        await this.encodeImage(image, tempDestination);

        let key: string;

        try {
            key = await FileStorageService.getInstance().getRandomKey(isPublic, format);

            await FileStorageService.getInstance().uploadFile(key, tempDestination);
        } catch (ex) {
            clearTempFile(tempDestination);
            throw ex;
        }

        clearTempFile(tempDestination);

        return key;
    }

    /**
     * Encodes, resizes and stores an image asset
     * @param image The original image file
     * @param format The format. PNG will allow transparency, JPG will not.
     * @param resolution The resolution
     * @param isPublic True if the asset should be public, false for private
     * @returns The storage key for the encoded image
     */
    public async encodeResizeAndStoreImage(image: string, format: "png" | "jpg", resolution: ImageResolution, isPublic: boolean): Promise<string> {
        const tempDestination = makeTempFile() + "." + format;

        await this.encodeAndResizeImage(image, tempDestination, resolution);

        let key: string;

        try {
            key = await FileStorageService.getInstance().getRandomKey(isPublic, format);

            await FileStorageService.getInstance().uploadFile(key, tempDestination);
        } catch (ex) {
            clearTempFile(tempDestination);
            throw ex;
        }

        clearTempFile(tempDestination);

        return key;
    }
}
