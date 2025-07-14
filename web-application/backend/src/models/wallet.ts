// Wallets

"use strict";

import Crypto from "crypto";
import { DataModel, GenericRow, DataSource, DataFinder, DataFilter, TypedRow } from "tsbean-orm";
import { decrypt, encrypt } from "../utils/aes";
import { createRandomUID } from "../utils/text-utils";
import { privateKeyToAddress } from "@asanrom/smart-contract-wrapper";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "wallets";
const PRIMARY_KEY = "id";

const SALT_LENGTH_BYTES = 16;

export class Wallet extends DataModel {

    public static finder = new DataFinder<Wallet>(DATA_SOURCE, TABLE, PRIMARY_KEY, (data: GenericRow) => { return new Wallet(data); });

    public static async findById(id: string): Promise<Wallet> {
        return Wallet.finder.findByKey(id);
    }

    public static async findByUser(uid: string): Promise<Wallet[]> {
        return Wallet.finder.find(DataFilter.equals("uid", uid));
    }

    public static async createRandom(uid: string, name: string, password: string): Promise<Wallet> {
        const salt = randomSalt();
    
        const wallet = new Wallet({
            id: createRandomUID(),
            uid: uid,
            name: name,
        });

        const privateKey = Crypto.randomBytes(32);
        const address = privateKeyToAddress(privateKey);

        wallet.address = address;
        wallet.passwordSalt = salt;
        wallet.passwordHash = computePasswordHash(password, salt);
        wallet.encryptedKey = encryptPrivateKey(privateKey, password);

        await wallet.insert();
        return wallet;
    }

    public static async createFromPrivateKey(uid: string, name: string, password: string, privatekeyHex: string): Promise<Wallet> {
        const salt = randomSalt();
    
        const wallet = new Wallet({
            id: createRandomUID(),
            uid: uid,
            name: name,
        });

        const privateKey = Buffer.from(privatekeyHex, "hex");
        const address = privateKeyToAddress(privateKey);

        wallet.address = address;
        wallet.passwordSalt = salt;
        wallet.passwordHash = computePasswordHash(password, salt);
        wallet.encryptedKey = encryptPrivateKey(privateKey, password);

        await wallet.insert();
        return wallet;
    }


    public id: string;

    /* db-index: uid */
    public uid: string;
    
    public name: string;
    public address: string;

    /* db-type: text */
    public encryptedKey: string;
    
    public passwordHash: string;
    public passwordSalt: string;

    constructor(data: TypedRow<Wallet>) {
        // First, we call DataModel constructor 
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        // Second, we set the class properties
        // The recommended way is to set one by one to prevent prototype pollution
        // You can also enforce the types if you do not trust the data source
        // In that case you can use the enforceType utility function

        this.id = data.id || "";
        this.uid = data.uid || "";
        this.name = data.name || "";
        this.address = data.address || "";
        this.encryptedKey = data.encryptedKey || "";
        this.passwordHash = data.passwordHash || "";
        this.passwordSalt = data.passwordSalt || "";

        // Finally, we must call init()
        this.init();
    }

    public checkPassword(password: string): boolean {
        return checkPassword(this.passwordHash, this.passwordSalt, password);
    }

    public async changePassword(password: string, oldPassword: string) {
        if (!this.checkPassword(oldPassword)) {
            throw new Error("Invalid password");
        }

        const privateKey = decryptPrivateKey(this.encryptedKey, oldPassword);

        this.passwordSalt = randomSalt();
        this.passwordHash = computePasswordHash(password, this.passwordSalt);
        this.encryptedKey = encryptPrivateKey(privateKey, password);
        await this.save();
    }

    /**
     * Unlocks the wallet
     * @param password The wallet password
     * @returns The private key
     */
    public unlock(password: string): Buffer {
        if (!this.checkPassword(password)) {
            throw new Error("Invalid password");
        }

        return decryptPrivateKey(this.encryptedKey, password);
    }
}

/**
 * Generates a random salt.
 * @returns A random salt.
 */
function randomSalt(): string {
    return Crypto.randomBytes(SALT_LENGTH_BYTES).toString("hex");
}

/**
 * Computes the hash of a password.
 * @param password The password.
 * @param salt The salt.
 * @returns The password hash
 */
function computePasswordHash(password: string, salt: string): string {
    const hash = Crypto.createHash("sha256");
    hash.update(password, "utf8");
    hash.update(salt, "utf8");
    const hash2 = Crypto.createHash("sha256");
    hash2.update(hash.digest());
    return hash2.digest().toString("hex");
}

/**
 * Checks a password.
 * @param passwordHash The password hash.
 * @param passwordSalt The salt.
 * @param password The input password.
 * @returns true if the password is valid, false if it is invalid.
 */
function checkPassword(passwordHash: string, passwordSalt: string, password: string): boolean {
    try {
        return Crypto.timingSafeEqual(Buffer.from(computePasswordHash(password, passwordSalt), 'hex'), Buffer.from(passwordHash, 'hex'));
    } catch (ex) {
        return false;
    }
}

function encryptPrivateKey(pk: Buffer, password: string): string {
    return encrypt(pk, password);
}

function decryptPrivateKey(encryptedKey: string, password: string): Buffer {
    if (!encryptedKey || !encryptedKey.includes(":")) {
        throw new Error("Invalid wallet key");
    }
    return decrypt(encryptedKey, password);
}

