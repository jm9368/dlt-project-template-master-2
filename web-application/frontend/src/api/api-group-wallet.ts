// API bindings: wallet (Auto generated)

"use strict";

import { RequestErrorHandler, RequestParams, CommonAuthenticatedErrorHandler } from "@asanrom/request-browser";
import { getApiUrl } from "./utils";
import { WalletInfo, WalletCreateBody, WalletEditBody, WalletChangePasswordBody, WalletExportResponse, WalletExportBody } from "./definitions";

export class ApiWallet {
    /**
     * Method: GET
     * Path: /wallet
     * List wallets
     * @returns The request parameters
     */
    public static ListWallets(): RequestParams<WalletInfo[], CommonAuthenticatedErrorHandler> {
        return {
            method: "GET",
            url: getApiUrl(`/wallet`),
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
     * Path: /wallet
     * Create wallet
     * @param body Body parameters
     * @returns The request parameters
     */
    public static CreateWallet(body: WalletCreateBody): RequestParams<WalletInfo, CreateWalletErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/wallet`),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(400, "INVALID_PRIVATE_KEY", handler.badRequestInvalidPrivateKey)
                    .add(400, "WEAK_PASSWORD", handler.badRequestWeakPassword)
                    .add(400, "TOO_MANY_WALLETS", handler.badRequestTooManyWallets)
                    .add(400, "INVALID_NAME", handler.badRequestInvalidName)
                    .add(400, "*", handler.badRequest)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: GET
     * Path: /wallet/{id}
     * Get wallet
     * @param id Wallet ID
     * @returns The request parameters
     */
    public static GetWallet(id: string): RequestParams<WalletInfo, GetWalletErrorHandler> {
        return {
            method: "GET",
            url: getApiUrl(`/wallet/${encodeURIComponent(id)}`),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /wallet/{id}
     * Edit wallet
     * @param id Wallet ID
     * @param body Body parameters
     * @returns The request parameters
     */
    public static ModifyWallet(id: string, body: WalletEditBody): RequestParams<void, ModifyWalletErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/wallet/${encodeURIComponent(id)}`),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(400, "INVALID_NAME", handler.badRequestInvalidName)
                    .add(400, "*", handler.badRequest)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: DELETE
     * Path: /wallet/{id}
     * Deletes a wallet
     * @param id Wallet ID
     * @returns The request parameters
     */
    public static DeleteWallet(id: string): RequestParams<void, CommonAuthenticatedErrorHandler> {
        return {
            method: "DELETE",
            url: getApiUrl(`/wallet/${encodeURIComponent(id)}`),
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
     * Path: /wallet/{id}/password
     * Change wallet password
     * @param id Wallet ID
     * @param body Body parameters
     * @returns The request parameters
     */
    public static ChangeWalletPassword(id: string, body: WalletChangePasswordBody): RequestParams<void, ChangeWalletPasswordErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/wallet/${encodeURIComponent(id)}/password`),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(400, "WRONG_PASSWORD", handler.badRequestWrongPassword)
                    .add(400, "WEAK_PASSWORD", handler.badRequestWeakPassword)
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
     * Path: /wallet/{id}/export
     * Export wallet private key
     * @param id Wallet ID
     * @param body Body parameters
     * @returns The request parameters
     */
    public static ExportPrivatekey(id: string, body: WalletExportBody): RequestParams<WalletExportResponse, ExportPrivatekeyErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/wallet/${encodeURIComponent(id)}/export`),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(400, "WRONG_PASSWORD", handler.badRequestWrongPassword)
                    .add(400, "*", handler.badRequest)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }
}

/**
 * Error handler for CreateWallet
 */
export type CreateWalletErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid wallet name
     */
    badRequestInvalidName: () => void;

    /**
     * You have too many wallets
     */
    badRequestTooManyWallets: () => void;

    /**
     * Password too weak
     */
    badRequestWeakPassword: () => void;

    /**
     * Invalid private key provided
     */
    badRequestInvalidPrivateKey: () => void;
};

/**
 * Error handler for GetWallet
 */
export type GetWalletErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for ModifyWallet
 */
export type ModifyWalletErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid wallet name
     */
    badRequestInvalidName: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for ChangeWalletPassword
 */
export type ChangeWalletPasswordErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Password too weak
     */
    badRequestWeakPassword: () => void;

    /**
     * Wrong current password
     */
    badRequestWrongPassword: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for ExportPrivatekey
 */
export type ExportPrivatekeyErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Wrong current password
     */
    badRequestWrongPassword: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

