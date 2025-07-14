// Function tests

"use strict";

import HTTP from "http";
import assert from 'assert';
import { Request } from "../../../src/utils/request";
import { AddressInfo } from "net";


interface RequestLog {
    method: string;
    path: string;
    headers: { [header: string]: string | string[] | undefined };
    body: string;
}

function resolveURL(base: string, path: string): string {
    const url = new URL(path, base);
    return url.toString();
}

const TEST_RESPONSE_BODY = "Example test response body";

// Test group
describe("Request", () => {

    let testServerBaseURL: string = "http://127.0.0.1/";

    let server: HTTP.Server;
    const requestLogs: RequestLog[] = [];

    before(async () => {
        // Setup test server
        return new Promise<void>((resolve) => {
            server = HTTP.createServer((req, res) => {
                const method = req.method;
                const path = req.url;
                const headers = req.headers;

                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", () => {
                    requestLogs.push({
                        method: method || "",
                        path: path || "",
                        headers: headers,
                        body: body,
                    });
                    res.writeHead(200);
                    res.end(TEST_RESPONSE_BODY);
                });
            });

            server.listen(0, "127.0.0.1", () => {
                const port = (server.address() as AddressInfo).port;
                testServerBaseURL = `http://127.0.0.1:${port}/`;
                resolve();
            });
        });
    });

    it('OPTIONS', async () => {
        return new Promise<void>((resolve, reject) => {
            Request.options(
                resolveURL(testServerBaseURL, "/test?q=test"),
                {
                    headers: {
                        "test-header": "test-value",
                    }
                },
                (err, response, body) => {
                    if (err) {
                        return reject(err);
                    }

                    try {
                        assert.equal(response.statusCode, 200);
                        assert.equal(body, TEST_RESPONSE_BODY);

                        const lastRequest = requestLogs.pop();

                        assert(!!lastRequest);

                        assert.equal(lastRequest.method, "OPTIONS");
                        assert.equal(lastRequest.path, "/test?q=test");
                        assert.equal(lastRequest.headers["test-header"], "test-value");
                        assert.equal(lastRequest.body, "");
                    } catch (ex) {
                        return reject(ex);
                    }

                    resolve();
                }
            );
        });
    });

    it('GET', async () => {
        return new Promise<void>((resolve, reject) => {
            Request.get(
                resolveURL(testServerBaseURL, "/test?q=test"),
                {
                    headers: {
                        "test-header": "test-value",
                    }
                },
                (err, response, body) => {
                    if (err) {
                        return reject(err);
                    }

                    try {
                        assert.equal(response.statusCode, 200);
                        assert.equal(body, TEST_RESPONSE_BODY);

                        const lastRequest = requestLogs.pop();

                        assert(!!lastRequest);

                        assert.equal(lastRequest.method, "GET");
                        assert.equal(lastRequest.path, "/test?q=test");
                        assert.equal(lastRequest.headers["test-header"], "test-value");
                        assert.equal(lastRequest.body, "");
                    } catch (ex) {
                        return reject(ex);
                    }

                    resolve();
                }
            );
        });
    });

    it('POST', async () => {
        return new Promise<void>((resolve, reject) => {
            Request.post(
                resolveURL(testServerBaseURL, "/test?q=test"),
                {
                    headers: {
                        "test-header": "test-value",
                    },
                    body: "Test Body",
                },
                (err, response, body) => {
                    if (err) {
                        return reject(err);
                    }

                    try {
                        assert.equal(response.statusCode, 200);
                        assert.equal(body, TEST_RESPONSE_BODY);

                        const lastRequest = requestLogs.pop();

                        assert(!!lastRequest);

                        assert.equal(lastRequest.method, "POST");
                        assert.equal(lastRequest.path, "/test?q=test");
                        assert.equal(lastRequest.headers["test-header"], "test-value");
                        assert.equal(lastRequest.body, "Test Body");
                    } catch (ex) {
                        return reject(ex);
                    }

                    resolve();
                }
            );
        });
    });

    it('PUT', async () => {
        return new Promise<void>((resolve, reject) => {
            Request.put(
                resolveURL(testServerBaseURL, "/test?q=test"),
                {
                    headers: {
                        "test-header": "test-value",
                    },
                    body: "Test Body",
                },
                (err, response, body) => {
                    if (err) {
                        return reject(err);
                    }

                    try {
                        assert.equal(response.statusCode, 200);
                        assert.equal(body, TEST_RESPONSE_BODY);

                        const lastRequest = requestLogs.pop();

                        assert(!!lastRequest);

                        assert.equal(lastRequest.method, "PUT");
                        assert.equal(lastRequest.path, "/test?q=test");
                        assert.equal(lastRequest.headers["test-header"], "test-value");
                        assert.equal(lastRequest.body, "Test Body");
                    } catch (ex) {
                        return reject(ex);
                    }

                    resolve();
                }
            );
        });
    });

    it('DELETE', async () => {
        return new Promise<void>((resolve, reject) => {
            Request.delete(
                resolveURL(testServerBaseURL, "/test?q=test"),
                {
                    headers: {
                        "test-header": "test-value",
                    }
                },
                (err, response, body) => {
                    if (err) {
                        return reject(err);
                    }

                    try {
                        assert.equal(response.statusCode, 200);
                        assert.equal(body, TEST_RESPONSE_BODY);

                        const lastRequest = requestLogs.pop();

                        assert(!!lastRequest);

                        assert.equal(lastRequest.method, "DELETE");
                        assert.equal(lastRequest.path, "/test?q=test");
                        assert.equal(lastRequest.headers["test-header"], "test-value");
                        assert.equal(lastRequest.body, "");
                    } catch (ex) {
                        return reject(ex);
                    }

                    resolve();
                }
            );
        });
    });

    after(async () => {
        if (server) {
            server.close();
        }
    });
});
