import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI ist nicht definiert! Setze die Umgebungsvariable.");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, legacyIndexCleaned: false };
}

/**
 * Establishes and reuses a cached Mongoose connection.
 * Automatically recovers if a previous connection was dropped or paused.
 */
async function dbConnect() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      dbName: process.env.DATABASE_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(async (mongooseInstance) => {
        if (!cached.legacyIndexCleaned) {
          cached.legacyIndexCleaned = true;
          try {
            // Drop legacy global unique index on Temporaryuser.username if it still exists
            // so usernames only have to be unique per game ({ username: 1, yourgame: 1 }).
            await mongooseInstance.connection
              .collection("temporaryusers")
              .dropIndex("username_1");
          } catch {
            // Index already removed or does not exist
          }
        }
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        cached.conn = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Executes both a low-level admin ping and a lightweight collection read
 * so MongoDB Atlas registers active cluster usage and prevents auto-pausing.
 */
export async function keepAliveDatabase() {
  const conn = await dbConnect();
  const start = Date.now();

  await conn.connection.db.admin().ping();
  await conn.connection.db
    .collection("games")
    .findOne({}, { projection: { _id: 1 } });

  return {
    ok: true,
    readyState: conn.connection.readyState,
    latencyMs: Date.now() - start,
    timestamp: new Date().toISOString(),
  };
}

export default dbConnect;
