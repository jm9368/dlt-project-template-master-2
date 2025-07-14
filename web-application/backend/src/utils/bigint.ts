// Utils for big integers

"use strict";

/**
 * Checks if a string is a valid big-integer
 * @param str The string
 * @returns True if the string can be parsed to big integer
 */
export function isBigInteger(str: string): boolean {
    try {
        BigInt(str);
        return true;
    } catch (ex) {
        return false;
    }
}

/**
 * Parses big-integer
 * @param bi The big integer as string
 * @returns The big integer
 */
export function parseBigInteger(bi: string): bigint {
    try {
        return BigInt(bi);
    } catch (ex) {
        return BigInt(0);
    }
}

/**
 * Creates identifier from big integer
 * @param b The big integer
 * @param size The identifier size 
 * @returns The identifier
 */
export function uintToId(b: bigint, size: number): string {
    let hex = b.toString(16);

    while (hex.length < size) {
        hex = "0" + hex;
    }

    return hex;
}
