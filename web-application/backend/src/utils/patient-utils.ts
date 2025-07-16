import { MongoClient } from "mongodb";

const MONGO_URL = process.env.DB_MONGO_URL || "mongodb://root:root@mongo:27017";
const DB_NAME = "pacientes_db";
const COLLECTION = "patients";

export async function insertPatientMongo(patient: any) {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION).insertOne(patient);
    await client.close();
}

export async function updatePatientMongo(id: string, patient: any) {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION).updateOne({ id }, { $set: patient }, { upsert: true });
    await client.close();
}

export async function deletePatientMongo(id: string) {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION).deleteOne({ id });
    await client.close();
}