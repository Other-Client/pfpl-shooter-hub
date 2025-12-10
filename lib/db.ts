// src/lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env.local");
}

let cached = (global as any)._mongoose;
if (!cached) {
  cached = (global as any)._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

if (!cached.promise) {
  cached.promise = mongoose
    .connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || "vr_shooting" })
    .then((mongooseInstance) => {
      console.log("✅ Connected to MongoDB");
      return mongooseInstance;
    });
}

  cached.conn = await cached.promise;
  return cached.conn;
}
