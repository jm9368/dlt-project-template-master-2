// Reserved for license

"use strict";

import Express from "express";
import { BAD_REQUEST, ensureObjectBody, FORBIDDEN, getRequestRemoteAddress, getUserAgentInfo, INTERNAL_SERVER_ERROR, noCache, NOT_FOUND, sendApiError, sendApiResult, sendApiSuccess } from "../../utils/http-utils";
import { secureStringCompare, validateEmail } from "../../utils/text-utils";
import { Controller } from "../controller";
import { TwoFactorAuthenticationService } from "../../services/tfa-service";
import { ADMIN_ROLE, UsersService } from "../../services/users-service";
import { CaptchaConfig } from "../../config/config-captcha";
import { User } from "../../models/users/user";
import { Session } from "../../models/users/session";
import { UserSystemConfig } from "../../config/config-users";
import { ThirdPartyUser } from "../../models/users/user-tp";
import { CaptchaService } from "../../services/captcha-service";
import { GLOBAL_PERMISSIONS, UserRole } from "../../models/users/user-role";
import { UserProfile } from "../../models/users/user-profile";
import { FileStorageService } from "../../services/file-storage";
import { InternationalizationService, DEFAULT_LOCALE } from "../../services/i18n-service";
import { GoogleLoginService } from "../../services/google-login-service";

/**
 * Authentication API
 * @group auth - Authentication API
 */
export class AuthController extends Controller {
    public registerAPI(prefix: string, application: Express.Express): any {
        // Context
        application.get(prefix + "/auth/context", noCache(this.context.bind(this)));

        // Login
        application.post(prefix + "/auth/login", ensureObjectBody(this.login.bind(this)));

        // Logout
        application.post(prefix + "/auth/logout", ensureObjectBody(this.logout.bind(this)));

        // Two factor authentication
        application.post(prefix + "/auth/tfa", ensureObjectBody(this.tfaLogin.bind(this)));

        // Signup
        application.post(prefix + "/auth/signup", ensureObjectBody(this.signup.bind(this)));

        // Email verification
        application.post(prefix + "/auth/email/verify", ensureObjectBody(this.verifyEmail.bind(this)));

        // Password recovery
        application.post(prefix + "/auth/password/forgot", ensureObjectBody(this.sendResetAccountPassword.bind(this)));
        application.post(prefix + "/auth/password/reset", ensureObjectBody(this.resetAccountPasswordAction.bind(this)));

        // Third-party login information
        application.get(prefix + "/auth/tp", ensureObjectBody(noCache(this.thirdPartyLoginDetails.bind(this))));
        application.post(prefix + "/auth/login/tp", ensureObjectBody(this.thirdPartyLogin.bind(this)));
        application.post(prefix + "/auth/signup/tp", ensureObjectBody(this.thirdPartyRegister.bind(this)));
    }

    /**
     * @typedef ErrorResponse
     * @property {string} code - Error code - eg: ERROR_TYPE
     */

    /**
     * @typedef AuthenticationContext
     * @property {enum} status.required - Auth status - eg: UNAUTHORIZED,TFA_REQUIRED,USER_NOT_FOUND,LOGGED_IN
     * @property {string} uid - User ID
     * @property {string} role - User role.
     * @property {Array.<string>} permissions - List of permissions
     * @property {string} username - Username
     * @property {string} email - User email
     * @property {boolean} tfa - Is the account protected by two factor authentication?
     * @property {string} locale - User locale
     * @property {string} profileName - Profile name
     * @property {string} profileImage - Profile image URL
     */

    /**
     * @typedef AuthenticationContextError
     * @property {string} code.required - Authentication status: UNAUTHORIZED, TFA_REQUIRED (requires two, factor authentication), USER_NOT_FOUND
     */

    /**
     * Authentication context
     * Binding: GetContext
     * @route GET /auth/context
     * @group auth
     * @returns {AuthenticationContext.model} 200 - Authentication context
     * @security AuthToken
     */
    public async context(request: Express.Request, response: Express.Response) {
        const session = await UsersService.getInstance().session(request, true);
        let user: User;
        let status = "UNAUTHORIZED";
        let permissions = [];
        let profile: UserProfile;

        if (session) {
            if (session.tfaPending) {
                status = "TFA_REQUIRED";
            } else {
                status = "LOGGED_IN";
            }

            user = await session.findUser();

            if (!user) {
                status = "USER_NOT_FOUND";
            } else {
                if (user.role === ADMIN_ROLE) {
                    permissions = Object.keys(GLOBAL_PERMISSIONS);
                } else {
                    const role = await UserRole.finder.findByKey(user.role);

                    if (role) {
                        permissions = role.getPermissionsList();
                    }
                }

                profile = await UserProfile.findByUser(user.id);
            }
        }

        response.json({
            status: status,
            uid: user ? user.id : "",
            role: user ? user.role : "",
            permissions: permissions,
            username: user ? user.username : "",
            email: user ? user.email : "",
            tfa: user ? user.tfa : false,
            locale: user ? user.locale : "",
            profileName: profile ? profile.name : "",
            profileImage: profile ? FileStorageService.getInstance().getStaticFileURL(profile.image) : "",
        });
    }

    /**
     * @typedef LoginRequest
     * @property {string} username.required - Username or email
     * @property {string} password.required - Password
     * @property {string} captcha - Captcha (Action = "login")
     * @property {boolean} remember - Send true to keep the session active until closed
     */

    /**
     * @typedef LoginErrorBadRequest
     * @property {string} code.required - Error Code:
     *  - CAPTCHA: Invalid captcha
     *  - INVALID_CREDENTIALS: Invalid username or empty password
     */

    /**
     * @typedef LoginErrorForbidden
     * @property {string} code.required - Error Code:
     *  - CAPTCHA: Invalid captcha
     *  - INVALID_CREDENTIALS: Invalid credentials
     *  - USER_BANNED: User is banned
     */

    /**
     * @typedef LoginResponse
     * @property {string} uid.required - User Id
     * @property {string} session_id.required - Session ID
     */

    /**
     * Login with username and password
     * Binding: Login
     * @route POST /auth/login
     * @group auth
     * @param {LoginRequest.model} request.body - Username or email
     * @returns {LoginErrorBadRequest.model} 400 - Bad request
     * @returns {LoginErrorForbidden.model} 403 - Access denied to the account
     * @returns {LoginResponse.model} 200 - Success
     */
    public async login(request: Express.Request, response: Express.Response) {
        // Check captcha
        if (CaptchaConfig.getInstance().captchaMode !== "none") {
            const valid = await CaptchaService.getInstance().verifyCaptcha(request.body.captcha + "", "login");
            if (!valid) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "CAPTCHA",
                    "The client provided an invalid captcha token",
                );
                return;
            }
        }

        const username = (request.body.username || "") + "";
        const password = (request.body.password || "") + "";
        const remember = (request.body.remember + "").toLowerCase() === "yes" || (request.body.remember + "").toLowerCase() === "true";

        if (!username || !password) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "INVALID_CREDENTIALS",
                "The client provided empty credentials",
            );
            return;
        }

        const user = await User.findUser(username);

        if (!user) {
            request.logger.debug("User was not found.");
        }

        if (user && user.emailVerified && user.checkPassword(password)) {
            // Check user banned
            if (user.banned) {
                sendApiError(
                    request,
                    response,
                    FORBIDDEN,
                    "USER_BANNED",
                    "The user trying to log into is banned",
                );
                return;
            }
            // Login successful, create new session
            try {
                const session = await Session.createSession(user, !remember, getRequestRemoteAddress(request), getUserAgentInfo(request, "os"), getUserAgentInfo(request, "browser"));

                response.cookie("session_id", session.getSession(), { path: "/" });
                sendApiResult(request, response, { uid: user.id, session_id: session.getSession() });

                // Update locale
                user.locale = request.getLocale();
                await user.save();
            } catch (ex) {
                request.logger.error(ex);
                sendApiError(
                    request,
                    response,
                    INTERNAL_SERVER_ERROR,
                    "INTERNAL_SERVER_ERROR",
                    ex.message,
                );
                return;
            }
        } else {
            request.logger.warning("Failed login attempt", { user: username });
            sendApiError(
                request,
                response,
                FORBIDDEN,
                "INVALID_CREDENTIALS",
                "The client provided invalid login credentials",
            );
            return;
        }
    }

    /**
     * @typedef ThirdPartyLoginService
     * @property {string} id.required - Service ID
     * @property {string} name.required - Service name
     * @property {string} client_id.required - App public client ID
     * @property {string} url.required - Login URL
     * @property {string} redirect_url.required - Redirect URL
     */

    /**
     * Get Third party login information
     * Binding: ThirdPartyLoginDetails
     * @group auth
     * @route GET /auth/tp
     * @returns {Array.<ThirdPartyLoginService>} 200 - Authentication information for third party accounts
     */
    public async thirdPartyLoginDetails(request: Express.Request, response: Express.Response) {
        const result: {
            id: string;
            name: string;
            client_id: string;
            url: string;
            redirect_url: string;
        }[] = [];

        if (UserSystemConfig.getInstance().google.clientId) {
            result.push({
                id: "google",
                name: "Google",
                client_id: UserSystemConfig.getInstance().google.clientId,
                url: GoogleLoginService.getInstance().getLoginWithGoogleURL(),
                redirect_url: GoogleLoginService.getInstance().getRedirectUri(),
            });
        }

        response.json(result);
    }

    /**
     * @typedef ThirdPartyLoginBody
     * @property {string} service.required - Service ID
     * @property {string} code.required - OAuth 2.0 code
     */

    /**
     * @typedef LoginTPErrorBadRequest
     * @property {string} code.required - Error Code:
     *  - SERVICE_INVALID: Invalid service ID
     *  - NO_CODE: No code provided
     *  - OAUTH_ERROR: OAuth 2.0 error (probably an invalid code)
     *  - BANNED: User is banned
     */

    /**
     * @typedef ThirdPartyLoginResponse
     * @property {enum} result.required - Result. - eg: SESSION,MUST_REGISTER
     * @property {string} session_id - Session ID
     * @property {string} email - Email to register
     * @property {string} id - Third party user OD to register
     * @property {string} token - Token to register the user
     */

    /**
     * Login with a third party service
     * Binding: ThirdPartyLogin
     * @route POST /auth/login/tp
     * @group auth
     * @param {ThirdPartyLoginBody.model} request.body - Request body
     * @returns {LoginTPErrorBadRequest.model} 400 - Bad request
     * @returns {ThirdPartyLoginResponse.model} 200 - Success
     */
    public async thirdPartyLogin(request: Express.Request, response: Express.Response) {
        const service = request.body.service + "";
        const code = (request.body.code || "") + "";

        if (!code) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "NO_CODE",
                "No code provided",
            );
            return;
        }

        let userTp: ThirdPartyUser;
        let user: User;

        switch (service) {
            case "google":
                {
                    const res = await GoogleLoginService.getInstance().loginWithOpenAuth2(code);
                    userTp = res.userTP;
                    user = res.user;
                }
                break;
            default:
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "SERVICE_INVALID",
                    "The service provided by the client was invalid: " + service,
                );
                return;
        }

        if (!userTp) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "OAUTH_ERROR",
                "Could not find the user entry in the database",
            );
            return;
        }

        if (!user) {
            // Must register
            sendApiResult(request, response, {
                result: "MUST_REGISTER",
                email: userTp.tpEmail,
                id: userTp.id,
                token: userTp.secret,
            });
            return;
        }

        if (user.banned) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "BANNED",
                "The user trying to log into is banned",
            );
            return;
        }

        // Create session
        const session = await Session.createSession(user, false, getRequestRemoteAddress(request), getUserAgentInfo(request, "os"), getUserAgentInfo(request, "browser"));
        response.cookie("session_id", session.getSession(), { path: "/" });

        sendApiResult(request, response, { result: "SESSION", session_id: session.getSession() });
    }

    /**
     * @typedef SignupTPRequest
     * @property {string} id.required - Third Party user ID
     * @property {string} username.required - Username
     * @property {string} password.required - Password
     * @property {string} token.required - Token received after authorizing (Oauth 2.0)
     * @property {string} locale - User locale
     */

    /**
     * @typedef SignupTPErrorBadRequest
     * @property {string} code.required - Error Code:
     *  - ID_INVALID: Invalid ID
     *  - TOKEN_INVALID: Invalid token
     *  - USERNAME_INVALID: Invalid username
     *  - USERNAME_IN_USE: Username in use
     *  - EMAIL_IN_USE: The email is in use by other account
     *  - WEAK_PASSWORD: Password too short
     */

    /**
     * @typedef SignupTPResponse
     * @property {string} uid.required - User ID of the new user
     * @property {string} session_id.required - Session ID
     */

    /**
     * Creates an account using a third party user provider
     * Binding: ThirdPartyRegister
     * @route POST /auth/signup/tp
     * @group auth
     * @param {SignupTPRequest.model} request.body - Request body
     * @returns {SignupTPErrorBadRequest.model} 400 - Bad request
     * @returns {SignupTPResponse.model} 200 - Success
     */
    public async thirdPartyRegister(request: Express.Request, response: Express.Response) {
        const userTp = await ThirdPartyUser.finder.findByKey(request.body.id + "");
        if (!userTp) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "ID_INVALID",
                "Could not find the user entry in the database",
            );
            return;
        }

        if (!secureStringCompare(userTp.secret, request.body.token + "")) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "TOKEN_INVALID",
                "Invalid third-party authentication token",
            );
            return;
        }

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
                "The username is already in use by another account",
            );
            return;
        }

        const otherAccount = (await User.findUser(userTp.tpEmail));
        if (otherAccount) {
            if (otherAccount.emailVerified) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "EMAIL_IN_USE",
                    "The email is already in use by another account",
                );
                return;
            } else {
                // Not verified account exists, we can remove it
                await otherAccount.delete();
            }
        }

        const password = (request.body.password || "") + "";

        if (!password || password.length < 6) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WEAK_PASSWORD",
                "The client provided an empty or too-weak password",
            );
            return;
        }

        let locale = request.body.locale + "";

        if (!InternationalizationService.getInstance().availableLocales.has(locale)) {
            locale = DEFAULT_LOCALE;
        }

        // Create the new user.
        let createdUser: User;

        try {
            createdUser = await User.registerUser(userTp.tpEmail, username, password, true, locale);
        } catch (ex) {
            request.logger.error(ex);
            sendApiError(
                request,
                response,
                INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                ex.message,
            );
            return;
        }

        // Assign user to third party user
        userTp.uid = createdUser.id;
        await userTp.save();

        // Create session
        const session = await Session.createSession(createdUser, false, getRequestRemoteAddress(request), getUserAgentInfo(request, "os"), getUserAgentInfo(request, "browser"));
        response.cookie("session_id", session.getSession(), { path: "/" });

        sendApiResult(request, response, { uid: createdUser.id, session_id: session.getSession() });
    }

    /**
     * @typedef TFAErrorBadRequest
     * @property {string} code.required - Error Code:
     *  - CAPTCHA: Invalid captcha
     */

    /**
     * @typedef TFAErrorForbidden
     * @property {string} code.required - Error Code:
     *  - INVALID_CODE: Invalid code provided
     */

    /**
     * @typedef TFALoginRequest
     * @property {string} captcha.required - Captcha (action = "tfa")
     * @property {string} token.required - Two-factor authentication single-use code
     */

    /**
     * Two factor authentication login. Input the one-use code
     * Binding: LoginTFA
     * @route POST /auth/tfa
     * @group auth
     * @param {TFALoginRequest.model} request.body - Request body
     * @returns {TFAErrorBadRequest.model} 400 - Bad request
     * @returns {TFAErrorForbidden.model} 403 - Invalid code
     * @returns {void} 404 - If session is not found or the user does not have two factor authentication
     * @returns {void} 200 - Success, now the user is full logged in, use the same session ID
     * @security AuthToken
     */
    public async tfaLogin(request: Express.Request, response: Express.Response) {
        const session = await UsersService.getInstance().session(request, true);

        if (!session) {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "",
                "Session not found",
            );
        }

        const user = await session.findUser();

        if (!user || !user.tfa) {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "",
                "The user does not have TFA enabled",
            );
            return;
        }

        // Check captcha

        if (CaptchaConfig.getInstance().captchaMode !== "none") {
            const valid = await CaptchaService.getInstance().verifyCaptcha(request.body.captcha + "", "tfa");
            if (!valid) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "CAPTCHA",
                    "The client provided an invalid captcha token",
                );
                return;
            }
        }

        // Validate token

        const token = (request.body.token || "") + "";
        if (!TwoFactorAuthenticationService.getInstance().check(token, user.tfaSecret)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "INVALID_CODE",
                "The client provided an invalid TFA code",
            );
            return;
        }

        session.tfaPending = false;
        await session.save();

        sendApiSuccess(request, response);
    }

    /**
     * Logout
     * Binding: Logout
     * @route POST /auth/logout
     * @group auth
     * @returns {void} 200 - Success, the session was deleted
     * @security AuthToken
     */
    public async logout(request: Express.Request, response: Express.Response) {
        const session = await UsersService.getInstance().session(request, true);
        if (session) {
            try {
                await session.delete();
            } catch (ex) {
                request.logger.error(ex);
                sendApiError(
                    request,
                    response,
                    INTERNAL_SERVER_ERROR,
                    "INTERNAL_SERVER_ERROR",
                    ex.message,
                );
                return;
            }
        }

        sendApiSuccess(request, response);
    }

    /**
     * @typedef SignupRequest
     * @property {string} email.required - Email
     * @property {string} username.required - Username
     * @property {string} password.required - Password
     * @property {string} captcha - Captcha (action = "signup")
     * @property {string} locale - User locale
     */

    /**
     * @typedef SignupErrorBadRequest
     * @property {string} code.required - Error Code:
     *  - CAPTCHA: Invalid captcha
     *  - EMAIL_INVALID: Invalid email
     *  - EMAIL_IN_USE: Email is in use
     *  - USERNAME_INVALID: Invalid username
     *  - USERNAME_IN_USE: Username in use
     *  - WEAK_PASSWORD: Password too short
     */

    /**
     * @typedef SignupResponse
     * @property {string} uid.required - User ID of the new user
     * @property {string} session_id - Session ID (Only if email validation is disabled)
     */

    /**
     * Creates an account using email + password
     * Binding: Signup
     * @route POST /auth/signup
     * @group auth
     * @param {SignupRequest.model} request.body - Request body
     * @returns {SignupErrorBadRequest.model} 400 - Bad request
     * @returns {SignupResponse.model} 200 - Success
     */
    public async signup(request: Express.Request, response: Express.Response) {
        // Check captcha
        if (CaptchaConfig.getInstance().captchaMode !== "none") {
            const valid = await CaptchaService.getInstance().verifyCaptcha(request.body.captcha + "", "signup");
            if (!valid) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "CAPTCHA",
                    "The client provided an invalid captcha token",
                );
                return;
            }
        }

        // Check the parameters

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

        const otherAccount = await User.findUser(email);
        if (otherAccount) {
            if (otherAccount.emailVerified) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "EMAIL_IN_USE",
                    "The client provided an email already in use by another account",
                );
                return;
            } else {
                // Not verified account exists, we can remove it
                await otherAccount.delete();
            }
        }

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
                "The client provided an username already in use by another account",
            );
            return;
        }

        const password = (request.body.password || "") + "";

        if (!password || password.length < 6) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WEAK_PASSWORD",
                "The client provided an empty or too weak password",
            );
            return;
        }

        let locale = request.body.locale + "";

        if (!InternationalizationService.getInstance().availableLocales.has(locale)) {
            locale = DEFAULT_LOCALE;
        }

        // Create the new user.

        let createdUser: User;

        try {
            createdUser = await User.registerUser(email, username, password, UserSystemConfig.getInstance().emailValidationDisabled, locale);
        } catch (ex) {
            sendApiError(
                request,
                response,
                INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                ex.message,
            );
            return;
        }

        // Send verification email

        if (!UserSystemConfig.getInstance().emailValidationDisabled) {
            await UsersService.getInstance().sendVerificationEmail(createdUser, request);

            sendApiResult(request, response, { uid: createdUser.id });
        } else {
            const session = await Session.createSession(createdUser, false, getRequestRemoteAddress(request), getUserAgentInfo(request, "os"), getUserAgentInfo(request, "browser"));
            response.cookie("session_id", session.getSession(), { path: "/" });

            sendApiResult(request, response, { uid: createdUser.id, session_id: session.getSession() });
        }
    }

    /**
     * @typedef EmailVerifyRequest
     * @property {string} uid.required - User ID
     * @property {string} verification.required - Verification code
     */

    /**
     * @typedef EmailVerifyForbidden
     * @property {string} code.required - Error code:
     *  - EMAIL_IN_USE: The email is in use and cannot be verified
     */

    /**
     * @typedef EmailVerifyResponse
     * @property {string} status.required - Status:
     *  - VERIFIED: Account was verified
     *  - ALREADY_VERIFIED: Account was already verified
     */

    /**
     * Sends request to verify an account
     * Binding: VerifyEmail
     * @route POST /auth/email/verify
     * @group auth
     * @param {EmailVerifyRequest.model} request.body - Request body
     * @returns {void} 400 - Invalid verification code
     * @returns {EmailVerifyForbidden.model} 403 - Access denied
     * @returns  {EmailVerifyResponse.model} 200 - Success
     */
    public async verifyEmail(request: Express.Request, response: Express.Response) {
        const uid = (request.body.uid || "") + "";
        const verification = (request.body.verification || "") + "";

        const userToVerify = await User.findUserByUID(uid);

        if (userToVerify && userToVerify.email && !userToVerify.emailVerified && secureStringCompare(userToVerify.emailVerificationCode, verification)) {
            userToVerify.emailVerified = true;
            userToVerify.emailVerificationCode = "";

            await userToVerify.save();

            sendApiResult(request, response, { status: "VERIFIED" });
        } else if (userToVerify && userToVerify.emailVerified && userToVerify.emailRequest && secureStringCompare(userToVerify.emailVerificationCode, verification)) {
            const otherAccount = (await User.findUser(userToVerify.emailRequest));
            if (otherAccount) {
                if (otherAccount.emailVerified) {
                    sendApiError(
                        request,
                        response,
                        FORBIDDEN,
                        "EMAIL_IN_USE",
                        "The email is already in use by another account",
                    );
                    return;
                } else {
                    // Not verified account exists, we can remove it
                    await otherAccount.delete();
                }
            }
            userToVerify.email = userToVerify.emailRequest;
            userToVerify.emailRequest = "";
            await userToVerify.save();

            sendApiResult(request, response, { status: "VERIFIED" });
        } else if (userToVerify && userToVerify.emailVerified) {
            sendApiResult(request, response, { status: "ALREADY_VERIFIED" });
        } else {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "INVALID_VERIFICATION_CODE",
                "The client provided an invalid verification code",
            );
        }
    }

    /**
     * @typedef ForgotPasswordRequest
     * @property {string} email.required - User email
     * @property {string} captcha - Captcha (action = "forgot_password")
     */

    /**
     * @typedef ForgotPasswordErrorBadRequest
     * @property {string} code.required - Error Code:
     *  - CAPTCHA: Invalid captcha
     *  - EMAIL_INVALID: Invalid email
     */

    /**
     * @typedef ForgotPasswordResponse
     * @property {string} status.required - Status:
     *  - RESET_PASSWORD_EMAIL_SENT: Email sent
     *  - VERIFY_EMAIL_SENT: Account is not verified yet
     *  - ACCOUNT_VERIFIED: Account was verified, but no email was sent
     */

    /**
     * Request password reset email.
     * Note: if the account is not verified, a verification email will be send instead
     * Binding: RequestPasswordReset
     * @route POST /auth/password/forgot
     * @group auth
     * @param {ForgotPasswordRequest.model} request.body - Request body
     * @returns {ForgotPasswordErrorBadRequest.model} 400 - Bad request
     * @returns {void} 404 - User was not found
     * @returns {ForgotPasswordResponse.model} 200 - Success
     */
    public async sendResetAccountPassword(request: Express.Request, response: Express.Response) {
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

        const user: User = await User.findUser(email);

        if (!user) {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "USER_NOT_FOUND",
                "The user was not found in the database",
            );
            return;
        }

        // Check captcha

        if (CaptchaConfig.getInstance().captchaMode !== "none") {
            const valid = await CaptchaService.getInstance().verifyCaptcha(request.body.captcha + "", "forgot_password");
            if (!valid) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "CAPTCHA",
                    "The client provided an invalid captcha token",
                );
                return;
            }
        }

        if (user.emailVerified) {
            await user.generateResetCode();
            await UsersService.getInstance().sendResetPasswordEmail(user, request);
            sendApiResult(request, response, { status: "RESET_PASSWORD_EMAIL_SENT" });
        } else {
            if (!UserSystemConfig.getInstance().emailValidationDisabled) {
                await UsersService.getInstance().sendVerificationEmail(user, request);
                sendApiResult(request, response, { status: "VERIFY_EMAIL_SENT" });
            } else {
                user.emailVerified = true;
                user.emailVerificationCode = "";
                await user.save();
                sendApiResult(request, response, { status: "ACCOUNT_VERIFIED" });
            }
        }
    }

    /**
     * @typedef ResetPasswordRequest
     * @property {string} uid.required - User ID
     * @property {string} verification.required - Verification code
     * @property {string} password.required - New password
     */

    /**
     * @typedef ResetPasswordErrorBadRequest
     * @property {string} code.required - Error Code:
     *  - WEAK_PASSWORD: Password too short
     */

    /**
     * Resets account password
     * Binding: ResetAccountPassword
     * @route POST /auth/password/reset
     * @group auth
     * @param {ResetPasswordRequest.model} request.body - Request body
     * @returns {ResetPasswordErrorBadRequest.model} 400 - Bad request
     * @returns {void} 404 - Invalid verification code
     * @returns {void} 200 - Success
     */
    public async resetAccountPasswordAction(request: Express.Request, response: Express.Response) {
        const uid = (request.body.uid || "") + "";
        const verification = (request.body.verification || "") + "";
        const password = (request.body.password || "") + "";

        if (!password || password.length < 6) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WEAK_PASSWORD",
                "The client provided an empty or too-weak password",
            );
            return;
        }

        const userToVerify = await User.findUserByUID(uid);

        if (userToVerify && secureStringCompare(userToVerify.passwordResetCode, verification) && userToVerify.passwordResetExpiration > Date.now()) {
            await userToVerify.changePassword(password);
            sendApiSuccess(request, response);
        } else {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "INVALID_RESET_CODE",
                "The client provided an invalid password reset code",
            );
        }
    }
}