# Controllers

Controllers are classes used to handle requests from the clients. They are located in the [src/controllers](../src/controllers/) folder.

There are different types of controllers, made to handle different request types:

 - API controllers: To handle API requests
 - WebSocket controllers: To handle WebSocket connections
 - WebHooks: To handle requests from third party services.
 - Other controllers: To handle other HTTP requests.

## API controllers

API controllers are located at the [src/controllers/api](../src/controllers/api/).

An API controller must be a class extending [Controller](../src/controllers/controller.ts).

You must define a `public async` method for each route pattern you want to handle. The method takes as arguments the [Request](https://expressjs.com/en/api.html#req) and the [Response](https://expressjs.com/en/api.html#res) objects provided by Express.

You must define the routes in the `registerAPI` method, which takes as argument the Express application object. Read the [official documentation](https://expressjs.com/en/guide/routing.html) to understand how to add routes using Express.

Here is an example controller, you can use it as template:

```ts
// Example controller

"use strict";

import Express from "express";
import { noCache } from "../../utils/http-utils";
import { Controller } from "../controller";

/**
 * Example API
 * @group example
 */
export class ExampleController extends Controller {
    public registerAPI(prefix: string, application: Express.Express): any {
        // Define routes here
        application.get(prefix + "/example/echo", noCache(this.example.bind(this)));
    }

    /**
     * @typedef ExampleResponse
     * @property {string} message - The message
     */

    /**
     * Example method
     * Binding: Echo
     * @route GET /example/echo
     * @group example
     * @param {string} message.query.required - Message to be echoed
     * @returns {ExampleResponse.model} 200 - Success
     */
    public async example(request: Express.Request, response: Express.Response) {
        sendApiResult(request, response, { message: request.query.message || "" });
    }
}
```

### API documentation

This backend project uses an analyzer to generate the API documentation from the comments attached to the controller methods.

The format is the following:

 - The first lines are the summary and description of the API.
 - You can set a name for the API binding method by using the `Binding` prefix. Otherwise the route will be used to generate the name.
 - Then, the route must be set with the `@route` keyword. The route works very similar to Express, with a difference: **The path parameters must be enclosed in curly brackets**.
 - After that, the API group must be set with the `@group` keyword.
 - After that, the parameters must be specified, with the `@param` keyword.
 - After that, the responses must be specified, with the `@returns` keyword.

```ts
export class ExampleController extends Controller {
    public registerAPI(prefix: string, application: Express.Express): any {
        // Define routes here
        application.get(prefix + "/example/echo/:message", noCache(this.example.bind(this)));
    }

    /**
     * Example method
     * Binding: Echo
     * @route GET /example/echo/{message}
     * @group example
     * @param {string} message.path.required - Message to be echoed
     * @returns {ExampleResponse.model} 200 - Success
     */
    public async example(request: Express.Request, response: Express.Response) {
        sendApiResult(request, response, { message: request.query.message || "" });
    }
}
```

### Types

When defining parameters or responses, you need to define their type.

There are some primitive types, similar to javascript types:

 - `string` - A string
 - `integer` - An integer
 - `number` - A floating point number
 - `boolean` - A boolean

If you need to specify an enumeration of strings or numbers, use the `enum` type, specifying the **complete list of possible values** aster an ` - eg:` prefix:

```ts
    /**
     * ...
     * @param {enum} kind.query.required - Kind of request - eg: kind_a,kind_b,kind_c
     */
```

You can also define structured types, using the `@typedef` and the `@property` keywords:

```ts
 /**
  * @typedef ExampleResponse
  * @property {string} message - The message
  */
```

The structured type definitions must eb inside the controllers, but separated from the methods by empty lines. Usually it's recommended to place the definitions needed for a method on top of it.

You can use a structured type by specifying its name followed by `.model`

```ts
    /**
     * ...
     * @param {ExampleBody.model} request.body.required - Request body
     * @returns {ExampleResponse.model} 200 - Success
     */

```

The structured types names must be unique across files, so they can be reused if needed.

If you need to use arrays, use the following syntax: `Array<TYPE>`.

When using arrays of structured types, use just its name with no `.model`.

```ts
    /**
     * ...
     * @param {Array.<string>} request.body.required - Request body
     * @returns {Array.<ExampleResponse>} 200 - Success
     */
```

### Path parameters

When your API needs path parameters, they must be specified with the `:` prefix for the `registerAPI` method, and enclosed in curly brackets for route, in the documentation.

Each parameter requires a `@param` line for the documentation, with the following format:

```ts
/**
 * ...
 * @param {TYPE} NAME.path.required - Description
 */
```

Replace `NAME` with the parameter name (must match both the `@route` and the Express routing definitions).

If you want to get a path parameter from the `Request`, use the `params` property:

```ts
const param = request.params.NAME + "";
```

### Query parameters

For required query parameters, use the following format:

```ts
/**
 * ...
 * @param {TYPE} NAME.query.required - Description
 */
```

For optional query parameters, use the following format:

```ts
/**
 * ...
 * @param {TYPE} NAME.query - Description
 */
```

Query parameters do not support arrays or structured types. You can use `string`, `number`, `integer`, `boolean` or `enum`.

You can fetch query parameters from the `Request` object using its `query` property:

```ts
const paramString = (request.query.NAME || "") + "";
const paramNumber = Number(request.query.NAME);
const paramBoolean = Boolean(request.query.NAME);
```

### Header parameters

For custom headers, use the following format

```ts
/**
 * ...
 * @param {TYPE} NAME.header.required - Description of required header
 * @param {TYPE} NAME.header - Description of optional header
 */
```

For headers, only `string` and `enum` types are supported.

You can fetch query parameters from the `Request` object using its `headers` property:

```ts
const paramHeader = (request.headers["NAME"] || "") + "";
```

### Body parameters (JSON)

For `POST` and `PUT` request, you can define a request body type and specify it as parameter:

```ts
/**
 * ...
 * @param {TYPE} request.body.required - Request body
 */
```

Usually `TYPE` is a custom structured type, but can also be an array or a primitive type.

In order to access the body from the `Request` object, use the `body` property, which is already parsed.

```ts
const body = request.body;
```

Note: You cannot trust the body will be the type specified by the documentation. You must check it using `typedef` or sanitize it using [javascript-object-sanitizer](https://github.com/AgustinSRG/javascript-object-sanitizer), which is already imported to this project.

### Uploading files

In order to upload files, you must use the `getFileUploadMiddleware` function inside [http-utils](../src/utils/http-utils.ts), in order to add a middleware to handle file upload.

You must also add `@consumes multipart/form-data` on top of the parameters documentation.

When uploading files, body parameters are not allowed. Instead, use `formData`.

In order to specify a file parameter, use the `file` type.

To get the uploaded files from the `Request` object, use the `files` property. You can then use the `moveUploadedFileToTempFile` to get a path to handle the file.

```ts
// Example controller

"use strict";

import Express from "express";
import { ensureObjectBody, getFileUploadMiddleware } from "../../utils/http-utils";
import { Controller } from "../controller";
import fileUpload from "express-fileupload";
import { moveUploadedFileToTempFile } from "../../utils/file-utils";

/**
 * Example API
 * @group example
 */
export class ExampleController extends Controller {
    public registerAPI(prefix: string, application: Express.Express): any {
        // Define routes here
        application.post(prefix + "/example/upload", getFileUploadMiddleware(), ensureObjectBody(this.example.bind(this)));
    }

    /**
     * Example method
     * Binding: Upload
     * @route POST /example/upload
     * @group example
     * @consumes multipart/form-data
     * @param {string} message.formData.required - An example parameter
     * @param {file} image.formData.required - An image to upload
     * @returns {ExampleResponse.model} 200 - Success
     */
    public async example(request: Express.Request, response: Express.Response) {
        const message = request.body.message + "";

        let image: fileUpload.UploadedFile;
        
        if (request.files && request.files.image) {
            if (Array.isArray(request.files.image)) {
                image = request.files.image[0];
            } else {
                image = request.files.image;
            }
        }

        if (!image) {
            // No image (error)
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "NO_IMAGE",
                "The client did not provide an image file"
            );
            return;
        }

        const imagePath = await moveUploadedFileToTempFile(image);

        // Note: Remember to delete imagePath after you are done, 
        // or it will remain as a temporal file until the server restart
        
        // ...
    }
}
```

### Response

You can send a JSON response to the client with the `sendApiResult` function in the [http-utils](../src/utils/http-utils.ts) file:

```ts
sendApiResult(request, response, {
    example: "value",
});
```

In order to document the type of the response, you must use the following format:

```ts
/**
 * ...
 * @returns {TYPE} 200 - Response description
 */
```

The `TYPE` can be anything. It will be serialized as JSON.

### Errors

If you want to return an error, use both the `sendApiError` function inside [http-utils](../src/utils/http-utils.ts).

```ts
    if (!REQUIRED_CONDITION) {
        sendApiError(
            request,
            response,
            BAD_REQUEST,
            "",
            "The client did not met the condition" // message fo logging purposes
        );
        return;
    }
```

You can document the error using the following format:

```ts
/**
 * ...
 * @returns {TYPE} STATUS - Error description
 */
```

Replace `STATUS` with the status code for the error.

You can find constants for the common error status codes inside [http-utils](../src/utils/http-utils.ts).

If you want to be more specific, having multiple error cases for the same status, you can use a `code` property in the response type to specify an error code:

```ts
    if (!REQUIRED_CONDITION) {
        sendApiError(
            request,
            response,
            BAD_REQUEST,
            "ERROR_CODE",
            "The client did not met the condition" // message fo logging purposes
        );
        return;
    }
```

To define an error response type, you must define a `code` string field, having inside its description a list of error codes. Here is an example:

```ts
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
```

You can also specify a list of error codes without descriptions, using the `ErrorResponse` definition as the type:

```ts
/**
 * ...
 * @returns {ErrorResponse.model} 400 - Bad request: CAPTCHA, EMAIL_INVALID, EMAIL_IN_USE, USERNAME_INVALID, USERNAME_IN_USE, WEAK_PASSWORD
 */
```

### Cache

For `GET` API requests, make sure to encapsulate the handler using the `noCache` function, to prevent browsers from catching the response.

```ts
application.get(prefix + "/example/echo/:message", noCache(this.example.bind(this)));
```

### Authentication

In order to handle authentication, use the [UsersService](../src/service/users-service.ts) singleton class. You can call the `auth` method to get the `session` and the `user` from the request.

```ts
const auth = await UsersService.getInstance().auth(request);
if (!auth.isRegisteredUser()) {
    sendUnauthorized(request, response);
    return;
}

const user = auth.user;
```

When an API requires authentication, add `@security AuthToken` to its documentation:

```ts
/**
 * ...
 * @security AuthToken
 */
```

### API binding generation

After you make changes un the API documentation, call the following command to update the API bindings:

```sh
npm run update-api-bindings
```

API bindings are used both for tests and for the frontend to make requests to the API.

### Logs

You can log a message associated with a request by using the `logger` property of the `Request` object. Examples:

```ts
request.logger.error("Error message");
request.logger.warning("Warning message");
request.logger.info("Info message");
request.logger.debug("Debug message");
request.logger.trace("Trace message");
```

An unique request identifier (`requestId`) will be added to the logs metadata, making it easier to trace when using tools like Kibana.

## WebSocket controllers

You can find the websocket controller in [src/controllers/websocket/websocket.ts](../src/controllers/websocket/websocket.ts).

The WebSocket controller can be used to keep a persistent connection, exchanging messages with the client in real time.

To connect to a websocket, the client must connect to the `/websocket` path.

You can change this in [app.ts](../src/app.ts), changing the `WEBSOCKET_PATH` constant.

For more information, read the [library documentation](https://github.com/websockets/ws?tab=readme-ov-file#table-of-contents).

## WebHook controllers

WebHook controllers are placed inside the [src/controllers/webhooks](../src/controllers/webhooks/) folder, and must extend the [Controller](../src/controllers/controller.ts) class.

They are used to handle requests coming from internal or third party services, not from clients. Examples of these are required for payment services like Stripe or PayPal.

## Other controllers

Any other controllers are placed in the [src/controllers](../src/controllers/) folder, and must extend the [Controller](../src/controllers/controller.ts) class.

They are very similar to API controllers, but without documentation, as they do not expose any API. You can use for redirect, server files or other tasks.
