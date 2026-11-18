import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isUsingMemoryStore = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/santhiya_style_stone';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(` MongoDB Connected successfully to: ${conn.connection.host}`);
    return { isUsingMemoryStore: false };
  } catch (error) {
    console.warn(`️ MongoDB local service not running or unreachable: ${error.message}`);
    console.log(` Activating Built-in High-Performance Persistent JSON Database store...`);
    isUsingMemoryStore = true;
    return { isUsingMemoryStore: true };
  }
};

export const getDBStatus = () => ({
  isUsingMemoryStore,
  mongooseConnected: mongoose.connection.readyState === 1
});

