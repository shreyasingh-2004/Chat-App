import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const redactMongoUri = (uri) => uri.replace(/\/\/([^:]+):([^@]+)@/, '//<username>:<password>@');

const testConnection = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  console.log('='.repeat(50));
  console.log('Testing MongoDB Atlas Connection');
  console.log('='.repeat(50));

  if (!uri) {
    console.log('\nNo MongoDB URI found in .env file.');
    process.exitCode = 1;
    return;
  }

  console.log('\nConnection String:', redactMongoUri(uri));

  try {
    console.log('\nAttempting to connect to MongoDB Atlas...');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 15000,
      family: 4,
    });

    console.log('\nSUCCESS! Connected to MongoDB Atlas.');
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name || 'default'}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Collections: ${collections.map((collection) => collection.name).join(', ') || 'none'}`);
  } catch (error) {
    console.error('\nCONNECTION FAILED!');
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

testConnection();
