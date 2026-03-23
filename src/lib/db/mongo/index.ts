import { MongoClient, Db } from "mongodb";

const hasReplica = Boolean(
  process.env.MONGO_REPLICA && process.env.MONGO_REPLICA.trim() !== ""
);

const host = hasReplica
  ? process.env
      .MONGO_HOST!.split(",")
      .map((h) => `${h}:${process.env.MONGO_PORT}`)
      .join(",")
  : `${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`;

const uri = `mongodb://${encodeURIComponent(
  process.env.MONGO_USER!
)}:${encodeURIComponent(process.env.MONGO_PASS!)}@${host}/${
  process.env.MONGO_NAME
}?authSource=admin${
  hasReplica ? `&replicaSet=${process.env.MONGO_REPLICA}` : ""
}`;

let client: MongoClient;
let db: Db;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export const getMongoClient = async (): Promise<MongoClient> => {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
};

export const getMongoDatabase = async (): Promise<Db> => {
  if (!db) {
    const mongoClient = await getMongoClient();
    db = mongoClient.db(process.env.MONGO_NAME);
  }
  return db;
};
