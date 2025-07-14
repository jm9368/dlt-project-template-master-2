// Blockchain and smart contract utilities

"use strict";

import { hexWithPrefix } from "./hex";
import Decimal from "decimal.js";

/* Addresses */

/**
 * Zero address
 */
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Turns address into standard format
 * @param addr The address
 * @returns The normalized address
 */
export function normalizeAddress(addr: string): string {
    return hexWithPrefix(addr).toLowerCase();
}

/**
 * Compares two addresses
 * @param addr1 Address 1
 * @param addr2 Address 2
 * @returns True if the address are equal
 */
export function compareAddresses(addr1: string, addr2: string): boolean {
    return normalizeAddress(addr1) === normalizeAddress(addr2);
}

/**
 * Checks if an address is the zero address
 * @param addr The address
 * @returns True if the address is the zero address
 */
export function isZeroAddress(addr: string): boolean {
    return compareAddresses(ZERO_ADDRESS, addr);
}

/**
 * Validates an Ethereum address
 * @param addr The address 
 * @returns True if the address is valid
 */
export function validateAddress(addr: string): boolean {
    return ((/^0x[0-9a-f]{40}$/i).test(hexWithPrefix(addr)));
}

/* Bytes32 */

/**
 * Normalizes a bytes hex string to be in standard format
 * @param bytes The hex string
 * @returns The normalized hex string
 */
export function normalizeBytes32(bytes: string): string {
    return hexWithPrefix(bytes).toLowerCase();
}

/**
 * Compares 2 bytes hex strings
 * @param bytes1 Hex 1
 * @param bytes2 Hex 2
 * @returns True if they are equal
 */
export function compareBytes32(bytes1: string, bytes2: string): boolean {
    return normalizeBytes32(bytes1) === normalizeBytes32(bytes2);
}

/**
 * Validates a bytes32 hex string
 * @param bytes The hex string
 * @returns 
 */
export function validateBytes32(bytes: string): boolean {
    return (/^0x[0-9a-f]{64}$/i).test(bytes);
}

/* Quantity */

/**
 * Turns big integer quantity to decimal string
 * @param q The quantity
 * @param decimals The number of decimal places
 * @returns The decimal string
 */
export function quantityToDecimalString(q: bigint, decimals: number): string {
    let decimal = new Decimal(q.toString(10));

    decimal = decimal.div((new Decimal(10)).pow(new Decimal(decimals)));

    return decimal.toFixed(decimals);
}

/**
 * Validates quantity string
 * @param str The decimal string
 * @param decimals Number of decimal places
 * @returns True if the decimal string is valid
 */
export function validateQuantityDecimalString(str: string, decimals: number): boolean {
    try {
        const decimal = new Decimal(str.trim().split(" ")[0]);
        const decimalMod = decimal.mul((new Decimal(10)).pow(new Decimal(decimals)));
        const decimalFloor = decimalMod.floor();

        return decimalMod.equals(decimalFloor);
    } catch (ex) {
        return false;
    }
}

/**
 * Parses quantity string
 * @param str The decimal string
 * @param decimals Number of decimal places
 * @returns The big integer quantity
 */
export function parseQuantityDecimalString(str: string, decimals: number): bigint {
    try {
        const decimal = new Decimal(str.trim().split(" ")[0]);
        const decimalMod = decimal.mul((new Decimal(10)).pow(new Decimal(decimals)));
        const decimalFloor = decimalMod.floor();

        return BigInt(decimalFloor.toHex());
    } catch (ex) {
        return BigInt(0);
    }
}
