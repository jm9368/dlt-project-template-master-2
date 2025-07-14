// Tools to test the API

"use strict";

import { APIAuthentication } from "./authentication";
import { setupTestServer } from "./server-setup";
import { Request, RequestParams } from "@asanrom/request-axios";

/**
 * API tester
 */
export class APITester {
    /**
     * Initializes API tester
     * Must call this before any API tests
     */
    public static async Initialize() {
        await setupTestServer();
    }

    /**
     * Tests an API, expecting a successful result
     * @param apiDefinition The API to call (use bindings)
     * @param auth The authentication to use
     * @returns The expected response body, depending on the called API
     */
    public static Test<T = any>(apiDefinition: RequestParams<T>, auth: APIAuthentication): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            Request.Do(auth ? auth.applyToRequestParams(apiDefinition): apiDefinition)
            .onSuccess(t => {
                resolve(t);
            }).onRequestError(err => {
                console.log(err);
                reject(err);
            }).onCancel(() => {
                reject(new Error("Request was cancelled"));
            }).onUnexpectedError(err => {
                reject(err);
            });
        });
    }

    /**
     * Tests an API, expecting it to fail
     * Use this, for example, to check for parameter validation or access checks
     * @param apiDefinition The API to call (use bindings)
     * @param auth The authentication to use
     * @param expectedStatusCode The expected status code. Example: 400
     * @param expectedErrorCode The expected error code. Example: INVALID_AMOUNT
     * @returns A successful promise if the error matches. It will reject otherwise.
     */
    public static TestError(apiDefinition: RequestParams<any>, auth: APIAuthentication, expectedStatusCode: number, expectedErrorCode?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Request.Do(auth ? auth.applyToRequestParams(apiDefinition): apiDefinition)
            .onSuccess(() => {
                reject(new Error("Request ended with 200 OK, but was expected to fail"));
            }).onRequestError(err => {
                if (err.status !== expectedStatusCode) {
                    return reject(new Error(`Unexpected status code. Expected ${expectedStatusCode}, but got ${err.status}`));
                }

                if (expectedErrorCode) {
                    const data = err.body;
                    let errorCode: string;

                    if (data) {
                        try {
                            let parsedData: any;
            
                            if (typeof data === "string") {
                                parsedData = JSON.parse(data);
                            } else {
                                parsedData = data;
                            }
            
                            errorCode = parsedData.code || "";
                        } catch (err) {
                            return reject(new Error(`Unexpected error code. Expected ${expectedErrorCode}, but got none (Invalid JSON response).`));
                        }

                        if (errorCode !== expectedErrorCode) {
                            return reject(new Error(`Unexpected error code. Expected ${expectedErrorCode}, but got ${errorCode || "none"}.`));
                        }

                        resolve();
                    } else {
                        return reject(new Error(`Unexpected error code. Expected ${expectedErrorCode}, but got none.`));
                    }
                }

                resolve();
            }).onCancel(() => {
                reject(new Error("Request was cancelled"));
            }).onUnexpectedError(err => {
                reject(err);
            });
        });
    }
}
