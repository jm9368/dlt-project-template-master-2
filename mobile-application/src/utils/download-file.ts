// Utils to download a file

"use strict";

import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

let pendingShare = false;

async function ensureDirAsync(dir: string, intermediates: boolean): Promise<void> {
    const props = await FileSystem.getInfoAsync(dir);
    if (props.exists && props.isDirectory) {
        return;
    }
    await FileSystem.makeDirectoryAsync(dir, { intermediates });
    return await ensureDirAsync(dir, intermediates);
}

export function downloadFile(url: string, fileName: string, session: string): Promise<boolean> {
    const fileUri = FileSystem.documentDirectory + fileName;

    return new Promise<boolean>((resolve, reject) => {
        ensureDirAsync(FileSystem.documentDirectory, true)
            .then(() => {
                FileSystem.downloadAsync(url, fileUri, { headers: { Cookie: `session_id=${session}` } })
                    .then(({ uri }) => {
                        MediaLibrary.createAssetAsync(uri)
                            .then(asset => {
                                if (pendingShare) {
                                    resolve(false);
                                    return;
                                }
                                pendingShare = true;
                                shareAsync(asset.uri)
                                    .then(() => {
                                        pendingShare = false;
                                        resolve(true);
                                    })
                                    .catch(err => {
                                        pendingShare = false;
                                        reject(err);
                                    });
                            })
                            .catch(err => {
                                reject(err);
                            });
                    })
                    .catch(err => {
                        reject(err);
                    });
            })
            .catch(err => {
                reject(err);
            });
    });
}
