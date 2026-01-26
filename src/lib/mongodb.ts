import mongoose from "mongoose"

/**
 * Read env var and FAIL FAST.
 * TS now knows this is a string forever.
 */
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`❌ Environment variable ${name} not set`)
  }
  return value
}

const MONGODB_URI = requireEnv("MONGODB_URI")

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalAny = global as any

if (!globalAny.mongoose) {
  globalAny.mongoose = {
    conn: null,
    promise: null,
  } as MongooseCache
}

const cached: MongooseCache = globalAny.mongoose

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m)
  }

  cached.conn = await cached.promise
  return cached.conn
}



