const { MongoClient } = require('mongodb');

const uri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/merch4change';

let client;
let db;

async function connectToDatabase() {
  if (db) {
    return db;
  }

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(); // uses database name from URI path

  console.log('Connected to MongoDB');

  return db;
}

function getDb() {
  if (!db) {
    throw new Error(
      'Database has not been initialized. Call connectToDatabase() first.'
    );
  }

  return db;
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectToDatabase,
  getDb,
  closeDatabase,
};

