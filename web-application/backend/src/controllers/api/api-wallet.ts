// Reserved for license

"use strict";

import Express from "express";
import { Wallet } from "../../models/wallet";
import { UsersService } from "../../services/users-service";
import { BAD_REQUEST, ensureObjectBody, noCache, NOT_FOUND, sendApiError, sendApiResult, sendApiSuccess, sendUnauthorized } from "../../utils/http-utils";
import { Controller } from "../controller";

const MAX_WALLETS_PER_USER = 10;

/**
 * Wallet API
 * @group wallet
 */
export class WalletController extends Controller {
    public registerAPI(prefix: string, application: Express.Express): any {
        application.get(prefix + "/wallet", ensureObjectBody(noCache(this.listWallets.bind(this))));
        application.get(prefix + "/wallet/:id", ensureObjectBody(noCache(this.getWallet.bind(this))));

        application.post(prefix + "/wallet", ensureObjectBody(this.createWallet.bind(this)));
        application.post(prefix + "/wallet/:id", ensureObjectBody(this.editWallet.bind(this)));
        application.post(prefix + "/wallet/:id/password", ensureObjectBody(this.changePassword.bind(this)));
        application.post(prefix + "/wallet/:id/export", ensureObjectBody(this.exportPrivateKey.bind(this)));

        application.delete(prefix + "/wallet/:id", ensureObjectBody(this.deleteWallet.bind(this)));
    }

    /**
     * @typedef WalletInfo
     * @property {string} id.required - Wallet ID
     * @property {string} name - Wallet name
     * @property {string} address - Wallet address
     */

    /**
     * List wallets
     * Binding: ListWallets
     * @route GET /wallet
     * @group wallet
     * @returns {Array.<WalletInfo>} 200 - List
     * @security AuthToken
     */
    public async listWallets(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const wallets = await Wallet.findByUser(user.id);

        sendApiResult(request, response, wallets.map(w => {
            return {
                id: w.id,
                name: w.name,
                address: w.address,
            };
        }));
    }


    /**
     * Get wallet
     * Binding: GetWallet
     * @route GET /wallet/{id}
     * @group wallet
     * @param {string} id.path.required - Wallet ID
     * @returns {void} 404 - Not found
     * @returns {WalletInfo.model} 200 - Wallet
     * @security AuthToken
     */
    public async getWallet(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const wallet = await Wallet.findById(request.params.id);

        if (!wallet || wallet.uid !== user.id) {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "WALLET_NOT_FOUND",
                "Wallet not found",
            );
            return;
        }

        sendApiResult(request, response, {
            id: wallet.id,
            name: wallet.name,
            address: wallet.address,
        });
    }

    /**
     * @typedef WalletCreateBody
     * @property {string} name.required - Wallet name (max 80 chars)
     * @property {string} password.required - Password to protect the wallet
     * @property {string} private_key - Private key (HEX). If not provided, a random one is generated.
     */

    /**
     * @typedef WalletCreateBadRequest
     * @property {string} code.required - Error Code:
     *  - INVALID_NAME: Invalid wallet name
     *  - TOO_MANY_WALLETS: You have too many wallets
     *  - WEAK_PASSWORD: Password too weak
     *  - INVALID_PRIVATE_KEY: Invalid private key provided
     */

    /**
     * Create wallet
     * Binding: CreateWallet
     * @route POST /wallet
     * @group wallet
     * @param {WalletCreateBody.model} request.body - Request body
     * @returns {WalletInfo.model} 200 - Wallet
     * @returns {WalletCreateBadRequest.model} 400 - Bad request
     * @security AuthToken
     */
    public async createWallet(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const wallets = await Wallet.findByUser(user.id);

        if (wallets.length >= MAX_WALLETS_PER_USER) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "TOO_MANY_WALLETS",
                "The user already has too many wallets in their account",
            );
            return;
        }

        const walletName = (request.body.name || "") + "";

        if (walletName.length > 80) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "INVALID_NAME",
                "The client provided an invalid wallet name (too long)",
            );
            return;
        }

        const password = (request.body.password || "") + "";

        if (password.length < 8) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WEAK_PASSWORD",
                "The client provided an empty or too weak password",
            );
            return;
        }

        const pkHex = (request.body.private_key || "") + "";

        let pk: Buffer;

        try {
            if (pkHex) {
                pk = Buffer.from(pkHex, 'hex');
                if (pk.length !== 32) {
                    throw new Error("Invalid private key length");
                }
            } else {
                pk = null;
            }
        } catch (ex) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "INVALID_PRIVATE_KEY",
                "The client provided an invalid private key. Error: " + ex.message,
            );
            return;
        }

        let w: Wallet;

        if (pk) {
            w = await Wallet.createFromPrivateKey(user.id, walletName, password, pk.toString("hex"));
        } else {
            w = await Wallet.createRandom(user.id, walletName, password);
        }

        sendApiResult(request, response, {
            id: w.id,
            name: w.name,
            address: w.address,
        });
    }


    /**
     * @typedef WalletEditBody
     * @property {string} name.required - Wallet name (max 80 chars)
     */

    /**
     * @typedef WalletEditBadRequest
     * @property {string} code.required - Error Code:
     *  - INVALID_NAME: Invalid wallet name
     */

    /**
     * Edit wallet
     * Binding: ModifyWallet
     * @route POST /wallet/{id}
     * @group wallet
     * @param {string} id.path.required - Wallet ID
     * @param {WalletEditBody.model} request.body - Request body
     * @returns {void} 404 - Not found
     * @returns {void} 200 - Success
     * @returns {WalletEditBadRequest.model} 400 - Bad request
     * @security AuthToken
     */
    public async editWallet(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const wallet = await Wallet.findById(request.params.id);

        if (!wallet || wallet.uid !== user.id) {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "WALLET_NOT_FOUND",
                "Wallet not found",
            );
            return;
        }

        const walletName = (request.body.name || "") + "";

        if (walletName.length > 80) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "INVALID_NAME",
                "The client provided an invalid wallet name (too long)",
            );
            return;
        }

        wallet.name = walletName;
        await wallet.save();

        sendApiSuccess(request, response);
    }

    /**
     * @typedef WalletChangePasswordBody
     * @property {string} password.required - Current password
     * @property {string} new_password.required - New password
     */

    /**
     * @typedef WalletChangePasswordBadRequest
     * @property {string} code.required - Error Code:
     *  - WEAK_PASSWORD: Password too weak
     *  - WRONG_PASSWORD: Wrong current password
     */

    /**
     * Change wallet password
     * Binding: ChangeWalletPassword
     * @route POST /wallet/{id}/password
     * @group wallet
     * @param {string} id.path.required - Wallet ID
     * @param {WalletChangePasswordBody.model} request.body - Request body
     * @returns {void} 404 - Not found
     * @returns {void} 200 - Success
     * @returns {WalletChangePasswordBadRequest.model} 400 - Bad request
     * @security AuthToken
     */
    public async changePassword(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const wallet = await Wallet.findById(request.params.id);

        if (!wallet || wallet.uid !== user.id) {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "WALLET_NOT_FOUND",
                "Wallet not found",
            );
            return;
        }

        const password = (request.body.password || "") + "";

        if (!wallet.checkPassword(password)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WRONG_PASSWORD",
                "The client provided a wrong password for the wallet",
            );
            return;
        }

        const newPassword = (request.body.new_password || "") + "";

        if (newPassword.length < 8) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WEAK_PASSWORD",
                "The client provided an empty or too weak password",
            );
            return;
        }

        await wallet.changePassword(newPassword, password);

        sendApiSuccess(request, response);
    }

    /**
     * @typedef WalletExportBody
     * @property {string} password.required - Current password
     */

    /**
     * @typedef WalletExportBadRequest
     * @property {string} code.required - Error Code:
     *  - WRONG_PASSWORD: Wrong current password
     */

    /**
     * @typedef WalletExportResponse
     * @property {string} private_key.required - Private key (HEX)
     */

    /**
     * Export wallet private key
     * Binding: ExportPrivatekey
     * @route POST /wallet/{id}/export
     * @group wallet
     * @param {string} id.path.required - Wallet ID
     * @param {WalletExportBody.model} request.body - Request body
     * @returns {void} 404 - Not found
     * @returns {WalletExportResponse.model} 200 - Success
     * @returns {WalletExportBadRequest.model} 400 - Bad request
     * @security AuthToken
     */
    public async exportPrivateKey(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const wallet = await Wallet.findById(request.params.id);

        if (!wallet || wallet.uid !== user.id) {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "WALLET_NOT_FOUND",
                "Wallet not found",
            );
            return;
        }

        const password = (request.body.password || "") + "";

        if (!wallet.checkPassword(password)) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "WRONG_PASSWORD",
                "The client provided a wrong password for the wallet",
            );
            return;
        }

        const privateKey = wallet.unlock(password);

        sendApiResult(request, response, { private_key: privateKey.toString("hex").toUpperCase() });
    }


    /**
     * Deletes a wallet
     * Binding: DeleteWallet
     * @route DELETE /wallet/{id}
     * @group wallet
     * @param {string} id.path.required - Wallet ID
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async deleteWallet(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const wallet = await Wallet.findById(request.params.id);

        if (!wallet || wallet.uid !== user.id) {
            sendApiSuccess(request, response);
            return;
        }

        await wallet.delete();

        sendApiSuccess(request, response);
    }
}
