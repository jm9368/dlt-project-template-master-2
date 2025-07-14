// Reserved for license

import Express from "express";

/**
 * Represents a controller. Handles http requests.
 */
export class Controller {
    /**
     * Registers the handlers for the current Express application.
     * @param app The application
     */
    public register(app: Express.Express): any {
        return;
    }

    /**
     * Registers the handlers for the current Express application.
     * @param prefix Prefix
     * @param application The application
     */
    public registerAPI(prefix: string, application: Express.Express): any {
        return;
    }
}
