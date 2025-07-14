// Hex utils

"use strict";

/**
 * Adds a 0x prefix to hex string, if missing
 * @param hex The input hex
 * @param pad Optional pad size
 * @returns The hex string, with 0x prefix 
 */
export function hexWithPrefix(hex: string, pad?: number) {
    hex = (hex + "").toLowerCase();

    if (hex.substring(0, 2) !== "0x") {
        hex = "0x" + hex;
    }

    if (pad) {
        while (hex.length - 2 < pad) {
            hex = hex + "0";
        }
    }

    return hex;
}

/**
 * Removes the 0x prefix from a hex string, if it has it
 * @param hex The input hex string
 * @returns The hex string, without any prefix
 */
export function hexNoPrefix(hex: string) {
    hex = (hex + "").toLowerCase();

    if (hex.substring(0, 2) !== "0x") {
        return hex;
    } else {
        return hex.substring(2);
    }
}

/**
 * Parses hex string to big integer
 * @param hex The hex string
 * @returns The big integer
 */
export function parseHex(hex: string): bigint {
    hex = hexNoPrefix(hex);
    while (hex.length > 0 && hex.charAt(0) === '0') {
        hex = hex.substring(1);
    }
    try {
        return BigInt("0x" + hex);
    } catch (ex) {
        return BigInt(0);
    }
}

/**
 * Parses a hex string and returns the number as decimal
 * @param hex The hex string
 * @returns The decimal string
 */
export function hexToDecimal(hex: string): string {
    const h = parseHex(hex);
    return h.toString(10);
}
