// Reserved for license

"use strict";

import Express from "express";
import { UserSystemConfig } from "../../config/config-users";
import { Session } from "../../models/users/session";
import { User } from "../../models/users/user";
import { TwoFactorAuthenticationService } from "../../services/tfa-service";
import { UsersService } from "../../services/users-service";
import { BAD_REQUEST, ensureObjectBody, noCache, sendApiError, sendApiResult, sendApiSuccess, sendUnauthorized } from "../../utils/http-utils";
import { createRandomToken, validateEmail } from "../../utils/text-utils";
import { Controller } from "../controller";
import { DEFAULT_LOCALE, InternationalizationService } from "../../services/i18n-service";
import { CaptchaConfig } from "../../config/config-captcha";
import { CaptchaService } from "../../services/captcha-service";

/**
 * Account API
 * @group account
 */
export class AccountController extends Controller {
    public registerAPI(prefix: string, application: Express.Express): any {
        // Change username
        application.post(prefix + "/account/username", ensureObjectBody(this.changeUsername.bind(this)));

        // Change email
        application.post(prefix + "/account/email", ensureObjectBody(this.changeEmail.bind(this)));

        // Change password
        application.post(prefix + "/account/password", ensureObjectBody(this.changePassword.bind(this)));

        // TFA
        application.get(prefix + "/account/tfa/generate", ensureObjectBody(noCache(this.generateTFA.bind(this))));
        application.post(prefix + "/account/tfa/setup", ensureObjectBody(this.setupTFA.bind(this)));
        application.post(prefix + "/account/tfa/disable", ensureObjectBody(this.removeTFA.bind(this)));

        // Sessions
        application.get(prefix + "/account/sessions", ensureObjectBody(noCache(this.getSessions.bind(this))));
        application.delete(prefix + "/account/sessions/:id", ensureObjectBody(this.closeSession.bind(this)));
        application.post(prefix + "/account/sessions/close", ensureObjectBody(this.closeSessions.bind(this)));

        // Change locale
        application.post(prefix + "/account/locale", ensureObjectBody(this.changeLocale.bind(this)));

        // Delete account
        application.post(prefix + "/account/delete", ensureObjectBody(this.deleteAccount.bind(this)));
    }

    /**
     * @typedef UsernameChangeRequest
     * @property {string} username.required - New username
     * @property {string} password.required - Account password
     * @property {string} tfa_token - Two factor authentication code, if you have it enabled is required
     */

    /**
     * @typedef UsernameChangeBadRequest
     * @property {string} code.required - Error Code:
     *  - WRONG_PASSWORD: Wrong password
     *  - USERNAME_INVALID: Invalid username
     *  - USERNAME_IN_USE: Username in use
     *  - INVALID_TFA_CODE: Invalid two factor authentication
     */

    /**
     * Changes username
     * Binding: ChangeUsername
     * @route POST /account/username
     * @group account
     * @param {UsernameChangeRequest.model} request.body - Request body
     * @returns {UsernameChangeBadRequest.model} 400 - Bad request
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async changeUsername(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        // Password

        const password = (request.body.password || "") + "";

        if (!user.checkPassword(password)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WRONG_PASSWORD",
                "The client provided a wrong password",
            );
            return;
        }

        // Validate token

        if (user.tfa) {
            const token = (request.body.tfa_token || request.body.token || "") + "";
            if (!TwoFactorAuthenticationService.getInstance().check(token, user.tfaSecret)) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "INVALID_TFA_CODE",
                    "The client provided an invalid TFA code",
                );
                return;
            }
        }

        // Username
        const username = (request.body.username || "") + "";

        if (!username || !User.validateUserName(username)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "USERNAME_INVALID",
                "The client provided an invalid username",
            );
            return;
        }

        if (await User.findUser(username) !== null) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "USERNAME_IN_USE",
                "The client provided an username that is in use by another account",
            );
            return;
        }

        user.username = username;
        user.usernameLowerCase = username.toLowerCase();

        await user.save();

        await UsersService.getInstance().clearProfileCache(user.id);

        sendApiSuccess(request, response);
    }

    /**
     * @typedef EmailChangeRequest
     * @property {string} email.required - New email
     * @property {string} password.required - Account password
     * @property {string} tfa_token - Two factor authentication code, if you have it enabled is required
     * @property {string} captcha - Captcha (Action = "change_email")
     */

    /**
     * @typedef EmailChangeBadRequest
     * @property {string} code.required - Error Code:
     *  - CAPTCHA: Invalid captcha
     *  - WRONG_PASSWORD: Wrong password
     *  - EMAIL_INVALID: Invalid email
     *  - EMAIL_IN_USE: Email is in use
     *  - INVALID_TFA_CODE: Invalid two factor authentication
     */

    /**
     * Changes email.
     * Binding: ChangeEmail
     * Warning: This just requests the change (sends email). The email must be validated.
     * @route POST /account/email
     * @group account
     * @param {EmailChangeRequest.model} request.body - Request body
     * @returns {EmailChangeBadRequest.model} 400 - Bad request
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async changeEmail(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        // Check captcha

        if (CaptchaConfig.getInstance().captchaMode !== "none") {
            const valid = await CaptchaService.getInstance().verifyCaptcha(request.body.captcha + "", "change_email");
            if (!valid) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "CAPTCHA",
                    "The client provided an invalid captcha code",
                );
                return;
            }
        }

        // Password

        const password = (request.body.password || "") + "";

        if (!user.checkPassword(password)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WRONG_PASSWORD",
                "The client provided a wrong password",
            );
            return;
        }

        // Validate token

        if (user.tfa) {
            const token = (request.body.tfa_token || request.body.token || "") + "";
            if (!TwoFactorAuthenticationService.getInstance().check(token, user.tfaSecret)) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "INVALID_TFA_CODE",
                    "The client provided an invalid TFA code",
                );
                return;
            }
        }

        const email = (request.body.email || "").toLowerCase();

        if (!email || !validateEmail(email)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "EMAIL_INVALID",
                "The client provided an invalid email",
            );
            return;
        }

        const otherAccount = (await User.findUser(email));
        if (otherAccount) {
            if (otherAccount.emailVerified) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "EMAIL_IN_USE",
                    "The client provided an email being used by another account.",
                );
                return;
            } else {
                // Not verified account exists, we can remove it
                await otherAccount.delete();
            }
        }

        if (!UserSystemConfig.getInstance().emailValidationDisabled) {
            // Email must be verified
            user.emailRequest = email;
            user.emailVerificationCode = createRandomToken();
            await UsersService.getInstance().sendVerificationChangeEmail(user, request);
        } else {
            user.email = email;
        }

        await user.save();

        sendApiSuccess(request, response);
    }

    /**
     * @typedef PasswordChangeRequest
     * @property {string} old_password.required - Old password
     * @property {string} new_password.required - New password
     */

    /**
     * @typedef PasswordChangeBadRequest
     * @property {string} code.required - Error Code:
     *  - WRONG_PASSWORD: Wrong old password
     *  - WEAK_PASSWORD: Password too weak
     */

    /**
     * Changes password.
     * Binding: ChangePassword
     * @route POST /account/password
     * @group account
     * @param {PasswordChangeRequest.model} request.body - Request body
     * @returns {PasswordChangeBadRequest.model} 400 - Bad request
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async changePassword(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const password = (request.body.old_password || "") + "";

        if (!user.checkPassword(password)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WRONG_PASSWORD",
                "The client provided a wrong password",
            );
            return;
        }

        const newPassword = (request.body.new_password || "") + "";

        if (!newPassword || newPassword.length < 6) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WEAK_PASSWORD",
                "The client provided an empty or too weak password",
            );
            return;
        }

        await user.changePassword(newPassword);

        sendApiSuccess(request, response);
    }

    /**
     * @typedef TFAGenResponse
     * @property {string} secret.required - TFA secret
     * @property {string} uri.required - URL for QR code
     */

    /**
     * Generates two factor authentication secret
     * Binding: GenerateTFA
     * @route GET /account/tfa/generate
     * @group account
     * @returns {TFAGenResponse.model} 200 - Success
     * @security AuthToken
     */
    public async generateTFA(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        sendApiResult(request, response, TwoFactorAuthenticationService.getInstance().generateSecret(auth.user.username + ""));
    }

    /**
     * @typedef TFASetupRequest
     * @property {string} password.required - Account password
     * @property {string} secret.required - TFA secret
     * @property {string} token.required - Current TFA token to validate the secret
     */

    /**
     * @typedef TFASetupBadRequest
     * @property {string} code.required - Error Code:
     *  - WRONG_PASSWORD: Wrong password
     *  - ALREADY: TFA already setup
     *  - INVALID: Invalid tfa secret or validation code
     */

    /**
     * Setup two factor authentication
     * Binding: SetupTFA
     * Warning: This closes all user sessions
     * @route POST /account/tfa/setup
     * @group account
     * @param {TFASetupRequest.model} request.body - Request body
     * @returns {TFASetupBadRequest.model} 400 - Bad request
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async setupTFA(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        if (user.tfa) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "ALREADY",
                "The user already has two factor authentication enabled",
            );
            return;
        }

        // Password

        const password = (request.body.password || "") + "";

        if (!user.checkPassword(password)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WRONG_PASSWORD",
                "The client provided a wrong password",
            );
            return;
        }

        // Validate token

        const secret = (request.body.secret || "") + "";
        const token = (request.body.token || "") + "";

        if (!TwoFactorAuthenticationService.getInstance().check(token, secret)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "INVALID",
                "The client provided an invalid TOTP secret-token pair",
            );
            return;
        }

        user.tfa = true;
        user.tfaSecret = secret;
        await user.save();

        await Session.closeSessions(user);

        sendApiSuccess(request, response);
    }

    /**
     * @typedef TFARemoveRequest
     * @property {string} token.required - Current TFA token to validate the request
     */

    /**
     * @typedef TFARemoveBadRequest
     * @property {string} code.required - Error Code:
     *  - NOT_ENABLED: TFA not enabled
     *  - INVALID: Invalid tfa secret or validation code
     */

    /**
     * Disables two factor authentication
     * Binding: RemoveTFA
     * @route POST /account/tfa/disable
     * @group account
     * @param {TFARemoveRequest.model} request.body - Request body
     * @returns {TFARemoveBadRequest.model} 400 - Bad request
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async removeTFA(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        if (!user.tfa) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "NOT_ENABLED",
                "The user does not have two factor authentication enabled",
            );
            return;
        }

        // Validate token

        const token = (request.body.token || "") + "";
        if (!TwoFactorAuthenticationService.getInstance().check(token, user.tfaSecret)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "INVALID",
                "The client provided an invalid TOTP secret-token pair",
            );
            return;
        }

        user.tfa = false;
        user.tfaSecret = "";
        await user.save();

        sendApiSuccess(request, response);
    }

    /**
     * @typedef SessionListItem
     * @property {string} session.required - Session Token
     * @property {number} created - Session creation timestamp
     * @property {string} remote - Remote address
     * @property {string} os - Operating system
     * @property {string} browser - Browser / Platform
     * @property {boolean} current - Is current Session?
     */

    /**
     * Gets all sessions open, so you can close them
     * This is a security feature
     * Binding: GetSessions
     * @route GET /account/sessions
     * @group account
     * @returns {Array.<SessionListItem>} 200 - Session List
     * @security AuthToken
     */
    public async getSessions(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const sessions = await Session.findSessionsByUser(user.id);

        const result = sessions.map(session => {
            return {
                session: session.id,
                created: session.created,
                remote: session.remote,
                os: session.os,
                browser: session.browser,
                current: session.id === auth.session.id,
            };
        });

        sendApiResult(request, response, result);
    }

    /**
     * Closes an active session
     * Binding: CloseSession
     * @route DELETE /account/sessions/{id}
     * @group account
     * @param {string} id.path.required - Session ID
     * @returns {void} 200 - Success, the session was deleted or not found
     * @security AuthToken
     */
    public async closeSession(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const session = await Session.finder.findByKey((request.params.id || "") + "");

        if (session && session.uid === user.id) {
            await session.delete();
        }

        sendApiSuccess(request, response);
    }

    /**
     * Closes all user sessions
     * Binding: CloseAllSessions
     * @route POST /account/sessions/close
     * @group account
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async closeSessions(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        await Session.closeSessions(user);

        sendApiSuccess(request, response);
    }

    /**
     * @typedef ChangeLocaleBody
     * @property {string} locale - Locale to use, If wrong, it will use the default locale.
     */

    /**
     * Changes user locale
     * The user locale is the language used for emails
     * Binding: ChangeLocale
     * @route POST /account/locale
     * @group account
     * @param {ChangeLocaleBody.model} request.body - Request body
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async changeLocale(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        let locale = request.body.locale + "";

        if (!InternationalizationService.getInstance().availableLocales.has(locale)) {
            locale = DEFAULT_LOCALE;
        }

        user.locale = locale;

        await user.save();

        sendApiSuccess(request, response);
    }

    /**
     * @typedef AccountDeleteBadRequest
     * @property {string} code.required - Error Code:
     *  - WRONG_PASSWORD: Wrong password
     *  - INVALID_TFA_CODE: Invalid two factor authentication
     */

    /**
     * @typedef DeleteAccountRequest
     * @property {string} password.required - Account password
     * @property {string} tfa_token.required - Two factor authentication code, if you have it enabled is required
     */

    /**
     * Deletes account
     * Binding: DeleteAccount
     * @route POST /account/delete
     * @group account
     * @param {DeleteAccountRequest.model} request.body - Request body
     * @returns {AccountDeleteBadRequest.model} 400 - Bad request
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async deleteAccount(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        // validate password

        const password = (request.body.password || "") + "";

        if (!user.checkPassword(password)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WRONG_PASSWORD",
                "The client provided a wrong password",
            );
            return;
        }

        // Validate token

        if (user.tfa) {
            const token = (request.body.tfa_token || request.body.token || "") + "";
            if (!TwoFactorAuthenticationService.getInstance().check(token, user.tfaSecret)) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "INVALID_TFA_CODE",
                    "The client provided an invalid TFA code",
                );
                return;
            }
        }

        // Close all sessions

        await Session.closeSessions(user);

        // Delete associated data with the account

        // Delete the user entry from the database

        await user.delete();

        await UsersService.getInstance().clearProfileCache(user.id);

        sendApiSuccess(request, response);
    }
}

