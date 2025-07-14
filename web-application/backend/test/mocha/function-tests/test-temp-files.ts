// Function tests

"use strict";

import Path from "path";
import assert from "assert";
import { makeTempFile, getTempFilePath, moveUploadedFileToTempFile } from "../../../src/utils/file-utils";

// Test group
describe("Temp files", () => {
    it('Should be able to create random temp files', async () => {
        const tempPath = Path.resolve(__dirname, "..", "..", "..", "temp");
        const randomTempFile = makeTempFile();

        assert.equal(Path.dirname(randomTempFile), tempPath);
    });

    it('Should be able to get a custom named temp file', async () => {
        const tempPath = Path.resolve(__dirname, "..", "..", "..", "temp");
        const randomTempFile = getTempFilePath("custom.txt");

        assert.equal(Path.dirname(randomTempFile), tempPath);
        assert.equal(Path.basename(randomTempFile), "custom.txt");
    });

    it('Should move an uploaded file to the temp path for handling', async () => {
        const tempPath = Path.resolve(__dirname, "..", "..", "..", "temp");
        
        const fakeUploadedFile: any = {
            name: "fake.txt",
            mv: (path: string, callback?: (err?: any) => void) => {
                try {
                    assert.equal(Path.dirname(path), tempPath);
                    if (callback) {
                        callback();
                    } else {
                        return Promise.resolve();
                    }
                } catch (err) {
                    if (callback) {
                        callback(err);
                    } else {
                        return Promise.reject(err);
                    }
                }
            },
        };

        const file = await moveUploadedFileToTempFile(fakeUploadedFile);

        assert.equal(Path.dirname(file), tempPath);
    });
});
