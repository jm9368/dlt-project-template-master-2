// Log

"use strict";

export class TestLog {
    public static log(str: string) {
        console.log(str);
    }

    public static info(str: string) {
        TestLog.log(`[INFO] ${str}`);
    }

    public static debug(str: string) {
        TestLog.log(`[DEBUG] ${str}`);
    }

    public static warning(str: string) {
        TestLog.log(`[WARN] ${str}`);
    }
}
