const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('No MONGODB_URI found in environment. Initializing zero-config MongoMemoryServer instance...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`InMemory MongoDB active at: ${uri}`);
    } else {
      console.log(`Attempting connection to MongoDB at: ${uri.split('@').pop()}`);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`Direct MongoDB connection error: ${err.message}. Initializing fallback MongoMemoryServer...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const fallbackUri = mongod.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`Fallback InMemory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error(`Critical MongoDB connection error: ${fallbackError.message}`);
      console.error(`Please provide a MONGODB_URI in server/.env (e.g. from MongoDB Atlas) or ensure local MongoDB is running.`);
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, closeDB };
