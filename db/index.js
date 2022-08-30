const MONGODB_URL = process.env.MONGODB_URL;
const mongoose = require('mongoose');

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', err => {
  console.error('db connection error:', err);
});
