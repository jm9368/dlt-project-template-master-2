// API bindings: auth (Auto generated)

"use strict";

import { RequestErrorHandler, RequestParams, CommonAuthenticatedErrorHandler, CommonErrorHandler } from "@asanrom/request-browser";
import { getApiUrl, generateURIQuery } from "./utils";
import { AuthenticationContext, LoginResponse, LoginRequest, ThirdPartyLoginService, ThirdPartyLoginResponse, ThirdPartyLoginBody, SignupTPResponse, SignupTPRequest, TFALoginRequest, SignupResponse, SignupRequest, EmailVerifyResponse, EmailVerifyRequest, ForgotPasswordResponse, ForgotPasswordRequest, ResetPasswordRequest } from "./definitions";

export class ApiAuth {
    /**
     * Method: GET
     * Path: /auth/context
     * Authentication context
     * @returns The request parameters
     */
    public static GetContext(): RequestParams<AuthenticationContext, CommonAuthenticatedErrorHandler> {
        return {
            method: "GET",
            url: getApiUrl(`/auth/context` + generateURIQuery({ _time: Date.now() })),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /auth/login
     * Login with username and password
     * @param body Body parameters
     * @returns The request parameters
     */
    public static Login(body: LoginRequest): RequestParams<LoginResponse, LoginErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/auth/login` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(403, "USER_BANNED", handler.forbiddenUserBanned)
                    .add(403, "INVALID_CREDENTIALS", handler.forbiddenInvalidCredentials)
                    .add(403, "CAPTCHA", handler.forbiddenCaptcha)
                    .add(403, "*", handler.forbidden)
                    .add(400, "INVALID_CREDENTIALS", handler.badRequestInvalidCredentials)
                    .add(400, "CAPTCHA", handler.badRequestCaptcha)
                    .add(400, "*", handler.badRequest)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: GET
     * Path: /auth/tp
     * Get Third party login information
     * @returns The request parameters
     */
    public static ThirdPartyLoginDetails(): RequestParams<ThirdPartyLoginService[], CommonErrorHandler> {
        return {
            method: "GET",
            url: getApiUrl(`/auth/tp` + generateURIQuery({ _time: Date.now() })),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /auth/login/tp
     * Login with a third party service
     * @param body Body parameters
     * @returns The request parameters
     */
    public static ThirdPartyLogin(body: ThirdPartyLoginBody): RequestParams<ThirdPartyLoginResponse, ThirdPartyLoginErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/auth/login/tp` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(400, "BANNED", handler.badRequestBanned)
                    .add(400, "OAUTH_ERROR", handler.badRequestOauthError)
                    .add(400, "NO_CODE", handler.badRequestNoCode)
                    .add(400, "SERVICE_INVALID", handler.badRequestServiceInvalid)
                    .add(400, "*", handler.badRequest)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /auth/signup/tp
     * Creates an account using a third party user provider
     * @param body Body parameters
     * @returns The request parameters
     */
    public static ThirdPartyRegister(body: SignupTPRequest): RequestParams<SignupTPResponse, ThirdPartyRegisterErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/auth/signup/tp` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(400, "WEAK_PASSWORD", handler.badRequestWeakPassword)
                    .add(400, "EMAIL_IN_USE", handler.badRequestEmailInUse)
                    .add(400, "USERNAME_IN_USE", handler.badRequestUsernameInUse)
                    .add(400, "USERNAME_INVALID", handler.badRequestUsernameInvalid)
                    .add(400, "TOKEN_INVALID", handler.badRequestTokenInvalid)
                    .add(400, "ID_INVALID", handler.badRequestIdInvalid)
                    .add(400, "*", handler.badRequest)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /auth/tfa
     * Two factor authentication login. Input the one-use code
     * @param body Body parameters
     * @returns The request parameters
     */
    public static LoginTFA(body: TFALoginRequest): RequestParams<void, LoginTFAErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/auth/tfa` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(403, "INVALID_CODE", handler.forbiddenInvalidCode)
                    .add(403, "*", handler.forbidden)
                    .add(400, "CAPTCHA", handler.badRequestCaptcha)
                    .add(400, "*", handler.badRequest)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /auth/logout
     * Logout
     * @returns The request parameters
     */
    public static Logout(): RequestParams<void, CommonAuthenticatedErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/auth/logout` + generateURIQuery({ _time: Date.now() })),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /auth/signup
     * Creates an account using email + password
     * @param body Body parameters
     * @returns The request parameters
     */
    public static Signup(body: SignupRequest): RequestParams<SignupResponse, SignupErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/auth/signup` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(400, "WEAK_PASSWORD", handler.badRequestWeakPassword)
                    .add(400, "USERNAME_IN_USE", handler.badRequestUsernameInUse)
                    .add(400, "USERNAME_INVALID", handler.badRequestUsernameInvalid)
                    .add(400, "EMAIL_IN_USE", handler.badRequestEmailInUse)
                    .add(400, "EMAIL_INVALID", handler.badRequestEmailInvalid)
                    .add(400, "CAPTCHA", handler.badRequestCaptcha)
                    .add(400, "*", handler.badRequest)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /auth/email/verify
     * Sends request to verify an account
     * @param body Body parameters
     * @returns The request parameters
     */
    public static VerifyEmail(body: EmailVerifyRequest): RequestParams<EmailVerifyResponse, VerifyEmailErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/auth/email/verify` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(403, "EMAIL_IN_USE", handler.forbiddenEmailInUse)
                    .add(403, "*", handler.forbidden)
                    .add(400, "*", handler.badRequest)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /auth/password/forgot
     * Request password reset email.
     * Note: if the account is not verified, a verification email will be send instead
     * @param body Body parameters
     * @returns The request parameters
     */
    public static RequestPasswordReset(body: ForgotPasswordRequest): RequestParams<ForgotPasswordResponse, RequestPasswordResetErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/auth/password/forgot` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(400, "EMAIL_INVALID", handler.badRequestEmailInvalid)
                    .add(400, "CAPTCHA", handler.badRequestCaptcha)
                    .add(400, "*", handler.badRequest)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /auth/password/reset
     * Resets account password
     * @param body Body parameters
     * @returns The request parameters
     */
    public static ResetAccountPassword(body: ResetPasswordRequest): RequestParams<void, ResetAccountPasswordErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/auth/password/reset` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(400, "WEAK_PASSWORD", handler.badRequestWeakPassword)
                    .add(400, "*", handler.badRequest)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }
}

/**
 * Error handler for Login
 */
export type LoginErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid captcha
     */
    badRequestCaptcha: () => void;

    /**
     * Invalid username or empty password
     */
    badRequestInvalidCredentials: () => void;

    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * Invalid captcha
     */
    forbiddenCaptcha: () => void;

    /**
     * Invalid credentials
     */
    forbiddenInvalidCredentials: () => void;

    /**
     * User is banned
     */
    forbiddenUserBanned: () => void;
};

/**
 * Error handler for ThirdPartyLogin
 */
export type ThirdPartyLoginErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid service ID
     */
    badRequestServiceInvalid: () => void;

    /**
     * No code provided
     */
    badRequestNoCode: () => void;

    /**
     * OAuth 2.0 error (probably an invalid code)
     */
    badRequestOauthError: () => void;

    /**
     * User is banned
     */
    badRequestBanned: () => void;
};

/**
 * Error handler for ThirdPartyRegister
 */
export type ThirdPartyRegisterErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid ID
     */
    badRequestIdInvalid: () => void;

    /**
     * Invalid token
     */
    badRequestTokenInvalid: () => void;

    /**
     * Invalid username
     */
    badRequestUsernameInvalid: () => void;

    /**
     * Username in use
     */
    badRequestUsernameInUse: () => void;

    /**
     * The email is in use by other account
     */
    badRequestEmailInUse: () => void;

    /**
     * Password too short
     */
    badRequestWeakPassword: () => void;
};

/**
 * Error handler for LoginTFA
 */
export type LoginTFAErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid captcha
     */
    badRequestCaptcha: () => void;

    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * Invalid code provided
     */
    forbiddenInvalidCode: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for Signup
 */
export type SignupErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid captcha
     */
    badRequestCaptcha: () => void;

    /**
     * Invalid email
     */
    badRequestEmailInvalid: () => void;

    /**
     * Email is in use
     */
    badRequestEmailInUse: () => void;

    /**
     * Invalid username
     */
    badRequestUsernameInvalid: () => void;

    /**
     * Username in use
     */
    badRequestUsernameInUse: () => void;

    /**
     * Password too short
     */
    badRequestWeakPassword: () => void;
};

/**
 * Error handler for VerifyEmail
 */
export type VerifyEmailErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * The email is in use and cannot be verified
     */
    forbiddenEmailInUse: () => void;
};

/**
 * Error handler for RequestPasswordReset
 */
export type RequestPasswordResetErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid captcha
     */
    badRequestCaptcha: () => void;

    /**
     * Invalid email
     */
    badRequestEmailInvalid: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for ResetAccountPassword
 */
export type ResetAccountPasswordErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Password too short
     */
    badRequestWeakPassword: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

