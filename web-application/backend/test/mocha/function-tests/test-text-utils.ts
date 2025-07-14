// Function tests

"use strict";

import assert from "assert";
import { base64ToPEM, certToBase64, createRandomSemiAuthToken, createRandomToken, createRandomUID, escapeDoubleQuotes, escapeHTML, escapeRegExp, escapeSingleQuotes, normalizeString, padNumber, secureStringCompare, splitSemiAuthTokens, validateEmail, validateURL } from "../../../src/utils/text-utils";

// Test group
describe("Text utilities", () => {
    it('normalizeString', async () => {
        const tests: { input: string, output: string }[] = [
            { input: "test", output: "test" },
            { input: "tést", output: "test" },
            { input: "araña", output: "arana" },
            { input: "TeST", output: "TeST" },
            { input: "TÉST", output: "TEST" },
            { input: "ArAÑa", output: "ArANa" },
        ];

        for (let test of tests) {
            assert.equal(test.output, normalizeString(test.input));
        }
    });

    it('escapeHTML', async () => {
        const tests: { input: string, output: string }[] = [
            { input: "Example", output: "Example" },
            { input: "<p>Example</p>", output: "&lt;p&gt;Example&lt;&#x2f;p&gt;" },
            { input: "test\"<p>Example</p>", output: "test&quot;&lt;p&gt;Example&lt;&#x2f;p&gt;" },
        ];

        for (let test of tests) {
            assert.equal(test.output, escapeHTML(test.input));
        }
    });


    it('escapeSingleQuotes', async () => {
        const tests: { input: string, output: string }[] = [
            { input: "test", output: "test" },
            { input: "'test'", output: "\\'test\\'" },
        ];

        for (let test of tests) {
            assert.equal(test.output, escapeSingleQuotes(test.input));
        }
    });

    it('escapeDoubleQuotes', async () => {
        const tests: { input: string, output: string }[] = [
            { input: "test", output: "test" },
            { input: "\"test\"", output: "\\\"test\\\"" },
        ];

        for (let test of tests) {
            assert.equal(test.output, escapeDoubleQuotes(test.input));
        }
    });

    it('validateEmail', async () => {
        assert.equal(validateEmail("test"), false);
        assert.equal(validateEmail("test@example.com"), true);
    });

    it('escapeRegExp', async () => {
        const tests: { input: string, output: string }[] = [
            { input: "test", output: "test" },
            { input: "[test]", output: "\\[test\\]" },
        ];

        for (let test of tests) {
            assert.equal(test.output, escapeRegExp(test.input));
        }
    });

    it('padNumber', async () => {
        assert.equal(padNumber(11, 4), "0011");
        assert.equal(padNumber(12, 3), "012");
        assert.equal(padNumber(13, 2), "13");
        assert.equal(padNumber(14, 1), "14");
    });

    it('createRandomUID', async () => {
        const randomId = createRandomUID();
        assert.equal(randomId.length, 32);
    });

    it('createRandomToken', async () => {
        const token = createRandomToken();
        assert.equal(token.length, 64);
    });

    it('createRandomSemiAuthToken', async () => {
        const token = createRandomSemiAuthToken();
        assert.equal(token.length, 43);
    });

    it('splitSemiAuthTokens', async () => {
        const id = createRandomSemiAuthToken();
        const secret = createRandomSemiAuthToken();

        const spl = splitSemiAuthTokens(id + secret);

        assert.equal(spl.id, id);
        assert.equal(spl.secret, secret);
    });

    it('secureStringCompare', async () => {
        assert.equal(secureStringCompare("test1", "test2"), false);
        assert.equal(secureStringCompare("test_1", "test_100"), false);
        assert.equal(secureStringCompare("test", "test"), true);
    });

    it('validateURL', async () => {
        assert.equal(validateURL("random"), false);
        assert.equal(validateURL("ssh://localhost:22"), false);
        assert.equal(validateURL("http://example.com/"), true);
        assert.equal(validateURL("http://example.com/test"), true);
        assert.equal(validateURL("https://example.com/"), true);
        assert.equal(validateURL("https://example.com/test"), true);
    });

    const testCertificate = [
        "-----BEGIN CERTIFICATE-----",
        "MQswCQYDVQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZpY2VzIExM",
        "MIIEizCCA3OgAwIBAgIQT06MA9SkB6gS0AJAsD5t9TANBgkqhkiG9w0BAQsFADBG",
        "QzETMBEGA1UEAxMKR1RTIENBIDFDMzAeFw0yMzA3MTcwODIzMTlaFw0yMzEwMDkw",
        "ODIzMThaMBYxFDASBgNVBAMMCyouZ29vZ2xlLmVzMFkwEwYHKoZIzj0CAQYIKoZI",
        "zj0DAQcDQgAElZSnCnR3XjcKS9uoyfWgzhdo8lNKJXEU7OkHMRX7hy4bCEkSpZ9F",
        "FJXahIC8fPhvbsDBjKx8a4d2m4MyurwGlqOCAm4wggJqMA4GA1UdDwEB/wQEAwIH",
        "gDATBgNVHSUEDDAKBggrBgEFBQcDATAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBTS",
        "LnQEYFGcEf0flKQeguvVzTABYzAfBgNVHSMEGDAWgBSKdH+vhc3ulc09nNDiRhTz",
        "cTUdJzBqBggrBgEFBQcBAQReMFwwJwYIKwYBBQUHMAGGG2h0dHA6Ly9vY3NwLnBr",
        "aS5nb29nL2d0czFjMzAxBggrBgEFBQcwAoYlaHR0cDovL3BraS5nb29nL3JlcG8v",
        "Y2VydHMvZ3RzMWMzLmRlcjAhBgNVHREEGjAYggsqLmdvb2dsZS5lc4IJZ29vZ2xl",
        "LmVzMCEGA1UdIAQaMBgwCAYGZ4EMAQIBMAwGCisGAQQB1nkCBQMwPAYDVR0fBDUw",
        "MzAxoC+gLYYraHR0cDovL2NybHMucGtpLmdvb2cvZ3RzMWMzL1FxRnhiaTlNNDhj",
        "LmNybDCCAQMGCisGAQQB1nkCBAIEgfQEgfEA7wB2AHoyjFTYty22IOo44FIe6YQW",
        "cDIThU070ivBOlejUutSAAABiWMpVVEAAAQDAEcwRQIgXAcm0SzrXjiuX4neKi8s",
        "uaj8TOeG9C+H/GIskaVi7OQCIQD2iB50C+Psh/4HGMVCXejZKFNOvaQ2eWdFlUqE",
        "6eYUvgB1AK33vvp8/xDIi509nB4+GGq0Zyldz7EMJMqFhjTr3IKKAAABiWMpVU8A",
        "AAQDAEYwRAIgAyiU7ub7CL6FxEQja4ews7dLCHwMCMkJ0rOUOGKV3lgCIHVdbaf3",
        "VdIQa5RzVITyXoe7WOPU7sPxT4gWH5abED+jMA0GCSqGSIb3DQEBCwUAA4IBAQAW",
        "QJs8v6YemLfjwrmQsuU1Z9fjlTImtgLZa2v7+TkBwr1GibpJqL/IsfFNMWoIi4fS",
        "sKE6A5asXSpxVkiX/WYAYKwCnbFRqGCJo9QWlNY6PStc53460Ac4U3uG/chCLf6p",
        "mO02zYJ21yW7LWtTB3kxw0I4YN4G9AFhQ2VRF+7dV7W8vwi9HoP99eDIgXRUSeVY",
        "d5rT60kzXiRiFX8PJFxnLRP/KBJVxhNQy9GzSvGjn4gexMWvH97jJdPS2tHlz8Uk",
        "lQ2AVJmshV4Y09i+nqiE4HaRTcaiVzauhKlrWwTqxfHkbuB7dwWRvCy518jT2Acy",
        "9eRI+CUI66CnNcjP9hZB",
        "-----END CERTIFICATE-----"
    ].join("\n");

    it('certToBase64 & base64ToPEM', async () => {
        const base64 = certToBase64(testCertificate);

        const buf = Buffer.from(base64, "base64");

        const certBack = base64ToPEM(buf.toString("base64"));

        assert.equal(certBack, testCertificate);
    });
});