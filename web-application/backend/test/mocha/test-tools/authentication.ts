// API authentication

"use strict";

import { RequestParams } from "@asanrom/request-axios";

export class APIAuthentication {
    public static Unauthenticated(): APIAuthentication{
        return new APIAuthentication("");
    }

    public static WithSession(session: string): APIAuthentication {
        return new APIAuthentication(session);
    }

    private session: string;

    constructor(session: string) {
        this.session = session;
    }

    public getSession(): string {
        return this.session;
    }

    public applyToRequestParams<T>(params: RequestParams<T>): RequestParams<T> {
        const headers = Object.create(null);

        if (params.headers) {
            for (let key of Object.keys(params.headers)) {
                headers[key] = params.headers[key];
            }
        }

        headers["x-session-id"] = this.session;

        return {
            method: params.method,
            url: params.url,
            headers: headers,
            json: params.json,
            form: params.form,
            handleError: params.handleError,
        };
    }
}
