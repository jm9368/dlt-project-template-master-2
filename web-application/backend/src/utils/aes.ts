// AES encryption

import Crypto from "crypto";

"use strict";

export function encrypt(text: string | Buffer, password: string) {
    const iv = Buffer.from(Crypto.randomBytes(16));
    const hash = Crypto.createHash('sha256');
    hash.update(password);
    const cipher = Crypto.createCipheriv('aes-256-ctr', hash.digest(), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("base64");
}

export function decrypt(text: string, password: string): Buffer {
    const colonIndex = text.indexOf(":");
    const iv = Buffer.from(text.substr(0, colonIndex), 'hex');
    const cipherText = Buffer.from(text.substr(colonIndex + 1), 'base64');
    const hash = Crypto.createHash('sha256');
    hash.update(password);
    const decipher = Crypto.createDecipheriv('aes-256-ctr', hash.digest(), iv);
    let data = decipher.update(cipherText);
    data = Buffer.concat([data, decipher.final()]);
    return data;
}
