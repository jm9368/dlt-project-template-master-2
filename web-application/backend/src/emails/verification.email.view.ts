// Verification email

"use strict";

import Express from "express";
import { User } from "../models/users/user";
import { escapeDoubleQuotes, escapeHTML } from "../utils/text-utils";
import { InternationalizationService } from "../services/i18n-service";
import { Config } from "../config/config";

const PLATFORM_NAME = Config.getInstance().appName;

/**
 * Email: Verification
 */
export class VerificationEmailView {
    public static getSubject(request: Express.Request, user: User): string {
        const translator = InternationalizationService.getInstance().getTranslatorFromRequestOrUser(request, user);
        return PLATFORM_NAME + " - " + translator.__("Verify your email");
    }


    public static render(request: Express.Request, user: User, urlToRedirect: string): string {
        const translator = InternationalizationService.getInstance().getTranslatorFromRequestOrUser(request, user);
        let html = "";

        html += `<!DOCTYPE html>`;
        html += `<html>`;
        html += `   <head>`;
        html += `       <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />`;
        html += `       <meta http-equiv="Cache-control" content="no-cache">`;
        html += `       <title>${PLATFORM_NAME} - ${translator.__("Verify your email")}</title>`;
        html += `   </head>`;
        html += `   <body>`;
        html += `       <h2>${PLATFORM_NAME} - ${translator.__("Verify your email")}</h2>`;
        html += `       <p>${translator.__("Hi {0}, Welcome to {1}. In order to complete your registration, follow the link below.").replace("{1}", PLATFORM_NAME).replace("{0}", escapeHTML(user.username))}</p>`;
        html += `       <p><a href="${escapeDoubleQuotes(urlToRedirect)}" target="_blank">${escapeHTML(urlToRedirect)}</a></p>`;
        html += `   </body>`;
        html += `</html>`;

        return html;
    }

    public static renderText(request: Express.Request, user: User, urlToRedirect: string): string {
        const translator = InternationalizationService.getInstance().getTranslatorFromRequestOrUser(request, user);
        let text = "";

        text += `${PLATFORM_NAME} - ${translator.__("Verify your email")}` + `\n`;
        text += `` + `\n`;
        text += `${translator.__("Hi {0}, Welcome to {1}. In order to complete your registration, follow the link below.").replace("{1}", PLATFORM_NAME).replace("{0}", escapeHTML(user.username))}` + `\n`;
        text += `${escapeHTML(urlToRedirect)}` + `\n`;

        return text;
    }

}
