// Local storage management

"use strict";

const localStorageCache = new Map();

/**
 * Fetches a value from local storage
 * @param key The local storage key
 * @param defaultVal The default value
 * @returns The fetched value, or the default value
 */
export function fetchFromLocalStorage<T>(key: string, defaultVal: T): T {
    const v = localStorage.getItem(key);

    if (v === undefined || v === null) {
        return defaultVal;
    }

    try {
        return JSON.parse(v);
    } catch (ex) {
        console.error(ex);
        return defaultVal;
    }
}

/**
 * Fetches a value from local storage or the cache
 * @param key The local storage key
 * @param defaultVal The default value
 * @returns The fetched value, or the default value
 */
export function fetchFromLocalStorageCache<T>(key: string, defaultVal: T): T {
    if (localStorageCache.has(key)) {
        return localStorageCache.get(key);
    }

    const v = fetchFromLocalStorage(key, defaultVal);
    localStorageCache.set(key, v);

    return v;
}

/**
 * Saves a value in the local storage
 * @param key The local storage key
 * @param val The value to store
 * @param cache True to cache the value
 */
export function saveIntoLocalStorage(key: string, val: any, cache?: boolean) {
    localStorage.setItem(key, JSON.stringify(val));
    if (cache || localStorageCache.has(key)) {
        localStorageCache.set(key, val);
    }
}
