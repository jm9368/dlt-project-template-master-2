// Reserved for license

"use strict";

import Express from "express";
import { NOT_FOUND, TEXT_HTML } from "../../utils/http-utils";
import { Controller } from "../controller";
import { IndexController } from "../index-controller";

/**
 * Default controller
 * Controller for not-found routes.
 */
export class DefaultController extends Controller {
    private indexController: IndexController;

    constructor() {
        super();
        this.indexController = new IndexController();
    }

    /**
     * Registers routes for this controller.
     * @param application Express application.
     */
    public register(application: Express.Express): any {
        // Add routes
        application.get("*", this.indexController.serveIndex.bind(this.indexController));
        application.all("*", this.notFound.bind(this));
    }

    public async notFound(request: Express.Request, response: Express.Response) {
        response.status(NOT_FOUND);
        response.send("Not Found.");
    }
}
