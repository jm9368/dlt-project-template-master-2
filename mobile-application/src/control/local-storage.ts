// Local storage management

"use strict";

import AsyncStorage from "@react-native-async-storage/async-storage";

const ASYNC_STORAGE_KEY = "hyperlender.data.local";

export class LocalStorage {
    public static Loaded = false;

    private static StoredData: any = Object.create(null);

    public static async Load() {
        const dataString = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);

        if (dataString) {
            try {
                LocalStorage.StoredData = JSON.parse(dataString);

                if (!LocalStorage.StoredData || typeof LocalStorage.StoredData !== "object") {
                    LocalStorage.StoredData = Object.create(null);
                }
            } catch (ex) {
                console.error(ex);
                LocalStorage.StoredData = Object.create(null);
            }
        }

        LocalStorage.Loaded = true;
    }

    private static Saving = false;
    private static SaveRequested = false;

    private static async DoSave() {
        const str = JSON.stringify(LocalStorage.StoredData);
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, str);

        while (LocalStorage.SaveRequested) {
            LocalStorage.SaveRequested = false;
            const str = JSON.stringify(LocalStorage.StoredData);
            await AsyncStorage.setItem(ASYNC_STORAGE_KEY, str);
        }
    }

    private static Save() {
        if (LocalStorage.Saving) {
            LocalStorage.SaveRequested = true;
            return;
        }

        LocalStorage.Saving = true;
        LocalStorage.DoSave()
            .then(() => {
                LocalStorage.Saving = false;
            })
            .catch(err => {
                console.error(err);
                LocalStorage.Saving = false;
            });
    }

    public static Get(key: string, defaultVal: any): any {
        const v = LocalStorage.StoredData[key];

        if (v === undefined || v === null) {
            return defaultVal;
        }

        return v;
    }

    public static Set(key: string, val: any) {
        LocalStorage.StoredData[key] = val;
        LocalStorage.Save();
    }
}
