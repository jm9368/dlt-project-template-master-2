// Reserved for license

"use strict";

import { MainWebApplication } from "./app";

/**
 * Worker process behaviour.
 */
export class WorkerProcess {
    public run() {
        const app = new MainWebApplication();
        app.start();
    }
}
