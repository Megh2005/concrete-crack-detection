import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose | null> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!MONGO_URI) {
    console.error('MongoDB Error: MONGO_URI environment variable is missing.');
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'restructor',
      autoIndex: true,
    };

    cached.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((mongooseInstance) => {
        console.log('Connected to MongoDB');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err?.message ? err.message : err);
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: any) {
    console.error('MongoDB connection failed:', error?.message ? error.message : error);
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

export function getOrCreateModel<T>(modelName: string, schema: mongoose.Schema<T>): mongoose.Model<T> {
  if (process.env.NODE_ENV !== 'production' && mongoose.models[modelName]) {
    delete mongoose.models[modelName];
  }
  return (mongoose.models[modelName] as mongoose.Model<T>) || mongoose.model<T>(modelName, schema);
}
