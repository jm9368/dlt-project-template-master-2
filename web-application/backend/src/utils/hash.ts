// Hashing utilities

"use strict";

import Crypto from "crypto";

/**
 * Computes SHA256 hash
 * @param input The input data to hash
 * @returns The hash as a hex string
 */
export function sha256(input: string | Buffer): string {
    return Crypto.createHash("sha256").update(input).digest("hex");
}
