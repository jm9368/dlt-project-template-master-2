# Tests

Tests are scripts that run to ensure the backend codebase works as intended.

Tests are located in the [test/mocha](../test/mocha/) folder.

The test framework used by this project is [Mocha](https://mochajs.org/#getting-started). Make sure to read its documentation to get familiar with the framework.

In order to run all the tests, run the following command:

```sh
npm test
```

## Unit tests

Unit tests or function tests are located inside the [test/mocha/function-tests](../test/mocha/function-tests/).

The function tests are used to test functions, ensuring they work as intended.

In order to run only the function tests, run the following command:

```sh
npm run unit-tests
```

In order to white function tests, run the functions with some example parameters and check the result is the expected one with [chai](https://www.chaijs.com/) or [assert](https://nodejs.org/api/assert.html).

Example:

```ts
// Function tests

"use strict";

import Crypto from "crypto";
import { expect } from 'chai';
import { encrypt, decrypt } from "../../../src/utils/aes";

// Test group
describe("AES", () => {
    const message = "Test message " + Crypto.randomBytes(8).toString("hex");
    const password = Crypto.randomBytes(24).toString("hex");

    let encrypted: string;

    it('Should be able to encrypt a message', async () => {
        encrypted = encrypt(message, password);
    });

    it('Should be able to decrypt a message', async () => {
        const decryptedMessage = decrypt(encrypted, password).toString("utf-8");

        expect(decryptedMessage).to.be.equal(message);
    });
});
```

## API tests

API tests are located inside the [test/mocha/api-tests](../test/mocha/api-tests/).

API tests run a test server instance and make HTTP request to it in order to ensure the API works as intended.

In order to run only the api tests, run the following command:

```sh
npm run api-tests
```

When writing API tests, make sure you update the API bindings with the following command:

```sh
npm run update-api-bindings
```

You can use the API bindings and the tools located inside the [test/mocha/test-tools](../test/mocha/test-tools/) folder in order to reduce the complexity of the tests.

Example:

```ts
// API tests

"use strict";

import assert from "assert";
import Crypto from "crypto";
import { APITester } from '../test-tools/api-tester';
import { PreparedUser, TestUsers } from '../test-tools/models/users';
import { ApiWallet } from '../test-tools/api-bindings/api-group-wallet';
import { privateKeyToAddress } from '@asanrom/smart-contract-wrapper';


// Test group
describe("API/Wallets", () => {
    let testUser1: PreparedUser;

    before(async () => {
        // Setup test server (REQUIRED)
        await APITester.Initialize();

        // Setup test users
        testUser1 = await TestUsers.NewRegularUser();
    });

    // Tests

    const randomPassword = Crypto.randomBytes(8).toString("hex");
    let wallet1: string;

    it('Should be able to create a wallet', async () => {
        const r = await APITester.Test(ApiWallet.CreateWallet({ name: "Wallet 1", password: randomPassword }), testUser1.auth);

        assert.equal(r.name, "Wallet 1");

        wallet1 = r.id;
    });

    // ...
});
```

### Requirements for running the API tests

In order to run the API tests, you need:

 - A test MongoDB database. You must specify its connection URL in the `TEST_DB_MONGO_URL` environment variable.
 - A test Ethereum node. You must specify the connection details in the [blockchain configuration](../CONFIG.md#blockchain-configuration).

### Skipping code for tests

When running on test mode, the flag `Config.IS_TEST` will be true.

Check for this flag in order to skip code that cannot be tested. For example, calls to external services.
