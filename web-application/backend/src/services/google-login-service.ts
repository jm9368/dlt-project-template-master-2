// Internationalization service

"use strict";

import { Request, RequestResponse } from "../utils/request";
import { User } from "../models/users/user";
import { Monitor } from "../monitor";
import { ThirdPartyUser } from "../models/users/user-tp";
import { UserSystemConfig } from "../config/config-users";
import { Config } from "../config/config";

/**
 * Login result (Google)
 */
export interface GoogleLoginResult {
    /**
     * Third party user
     */
    userTP?: ThirdPartyUser;

    /**
     * User
     */
    user?: User;
}

const SCOPE = ['email', 'profile', 'openid'];

/**
 * Internationalization service
 */
export class GoogleLoginService {
    /* Singleton */

    public static instance: GoogleLoginService = null;

    public static getInstance(): GoogleLoginService {
        if (GoogleLoginService.instance) {
            return GoogleLoginService.instance;
        } else {
            GoogleLoginService.instance = new GoogleLoginService();
            return GoogleLoginService.instance;
        }
    }

    constructor() {

    }

    /**
     * Gets redirect URI
     * Frontend URL + /login/tp/google
     * @returns The redirect URL
     */
    public getRedirectUri(): string {
        return Config.getInstance().getFrontendURI("/login/tp/google");
    }

    /**
     * Gets the login with Google URL
     * @returns The URL
     */
    public getLoginWithGoogleURL(): string {
        return "https://accounts.google.com/o/oauth2/v2/auth" +
            "?client_id=" + encodeURIComponent(UserSystemConfig.getInstance().google.clientId) +
            "&scope=" + encodeURIComponent(SCOPE.join(" ")) +
            "&prompt=" + encodeURIComponent(['select_account', 'consent'].join(" ")) +
            "&response_type=code" +
            "&redirect_uri=" + encodeURIComponent(this.getRedirectUri());
    }

    /**
     * Login with Google
     * @param code The OAuth 2.0 one-time-use code
     * @returns The user
     */
    public async loginWithOpenAuth2(code: string): Promise<GoogleLoginResult> {
        if (!code) {
            return {};
        }

        Monitor.debug("Google Login Init", { code: code });

        return new Promise<GoogleLoginResult>((resolve, reject) => {
            Request.post("https://www.googleapis.com/oauth2/v4/token",
                {
                    headers: {
                        Accept: "application/json",
                    },
                    form: {
                        client_id: UserSystemConfig.getInstance().google.clientId,
                        client_secret: UserSystemConfig.getInstance().google.clientSecret,
                        redirect_uri: this.getRedirectUri(),
                        grant_type: "authorization_code",
                        code,
                    },
                    timeout: 30000,
                },
                async (error: any, response2: RequestResponse, body: string) => {
                    Monitor.debug("Google Login Round 2", { body: body });
                    if (error || response2.statusCode !== 200) {
                        Monitor.error("[Google OAUTH] Cannot get access token.");
                        resolve({});
                        return;
                    }

                    try {
                        const accessToken = JSON.parse(body).access_token;

                        Request.get("https://people.googleapis.com/v1/people/me" + "?access_token=" + encodeURIComponent(accessToken) + "&personFields=names,emailAddresses",
                            { headers: { "User-Agent": "Global-Intelligence-Web-Application" } },
                            async (errorUser, responseUser, bodyUser) => {
                                if (errorUser || responseUser.statusCode !== 200) {
                                    Monitor.error("[Google OAUTH] Cannot get user information.");
                                    resolve({});
                                    return;
                                }

                                Monitor.debug("Google Login Round 3", { body: bodyUser });

                                try {
                                    const userInfo = JSON.parse(bodyUser);

                                    const googleId = userInfo.resourceName || "";
                                    const email = ((userInfo.emailAddresses && userInfo.emailAddresses.length) ? userInfo.emailAddresses[0].value : "");
                                    const name = userInfo.names[0].displayName;

                                    let userTP: ThirdPartyUser = await ThirdPartyUser.find("google", googleId);

                                    if (!userTP) {
                                        // Register the user
                                        userTP = await ThirdPartyUser.create("google", googleId, email, name);
                                    }

                                    const user = await userTP.findUser();

                                    if (!user) {
                                        // User not registered yet
                                        resolve({ userTP: userTP });
                                        return;
                                    }

                                    resolve({ userTP: userTP, user: user });
                                } catch (err) {
                                    Monitor.error("[Google OAUTH] Cannot get user information: " + err.message + "\n" + err.stack);
                                    resolve({});
                                }
                            });
                    } catch (err) {
                        Monitor.error("[Google OAUTH] Cannot get access token: " + err.message + "\n" + err.stack);
                        resolve({});
                    }
                },
            );
        });
    }
}