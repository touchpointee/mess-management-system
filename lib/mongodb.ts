import mongoose from "mongoose";
import { runSaaSMigration } from "./migrations";

const uri = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var -- Next.js hot reload singleton
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (process.env.NODE_ENV !== "production") {
  global.mongooseCache = cache;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (cache.conn) {
    return cache.conn;
  }
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then(async (conn) => {
        // Run background migrations once the database connects
        await runSaaSMigration().catch((err) =>
          console.error("SaaS Migration failed during connectDB:", err)
        );
        return conn;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
