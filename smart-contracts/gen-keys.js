/* Keys generation */

'use strict';

const Path = require("path");
const FS = require("fs");
const Crypto = require("crypto");

const accounts = [];

for (let i = 0; i < 10; i++) {
    accounts.push(Crypto.randomBytes(32).toString("hex").toUpperCase());
}

FS.writeFileSync(Path.resolve(__dirname, "key"), accounts.join("\n"));

console.log("Random private keys generated and saved into keys file.")
