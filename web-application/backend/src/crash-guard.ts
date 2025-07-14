// Reserved for license

"use strict";

import { Monitor } from "./monitor";

/**
 * Logs an application error.
 * @param error The uncaught exception.
 */
function logCrash(error: Error) {
    Monitor.exception(error);
    Monitor.error("[UNCAUGHT EXCEPTION] " + error.name + ": " + error.message + "\n" + error.stack);
}

/**
 * Prevents the application from crashing.
 * Logs the uncaught exceptions.
 */
export class CrashGuard {
    /**
     * Enables the crashguard.
     */
    public static enable() {
        process.on("uncaughtException", logCrash);
    }

    /**
     * Disables the crashguard.
     */
    public static disable() {
        process.removeListener("uncaughtException", logCrash);
    }
}
