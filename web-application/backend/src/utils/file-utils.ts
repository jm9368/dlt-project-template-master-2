/* File utils */

"use strict";

import fileUpload from "express-fileupload";
import Path from "path";
import { createRandomUID } from "./text-utils";
import { unlink } from "fs";
import { Monitor } from "../monitor";

/**
 * @returns A random temp file path
 */
export function makeTempFile() {
    return Path.resolve(__dirname, "..", "..", "temp", createRandomUID());
}

/**
 * Gets path to temp file
 * @param file Temp file name
 * @returns Temp file full path
 */
export function getTempFilePath(file: string) {
    return Path.resolve(__dirname, "..", "..", "temp", file);
}

/**
 * Moves uploaded file to temp file
 * @param file Uploaded file
 * @returns Temp file path
 */
export async function moveUploadedFileToTempFile(file: fileUpload.UploadedFile): Promise<string> {
    const tmpFile = makeTempFile();
    return new Promise<string>(function (resolve, reject) {
        file.mv(tmpFile, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(tmpFile);
        });
    });
}

/**
 * Clears a temp file
 * @param file The temp file to delete
 */
export function clearTempFile(file: string) {
    unlink(file, err => {
        if (err) {
            Monitor.exception(err);
        }
    });
}
