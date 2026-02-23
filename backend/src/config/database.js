// MongoDB connection
import mongoose from 'mongoose';
import env from './env.js';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✓ Already connected to MongoDB');
    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI);

    isConnected = true;
    console.log('✓ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('✗ MongoDB disconnection failed:', error.message);
  }
};

export { connectDB, disconnectDB };
