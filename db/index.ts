import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL as string;

mongoose.connect(MONGODB_URL);

const db = mongoose.connection;

db.on('error', err => {
  console.error('db connection error:', err);
});
