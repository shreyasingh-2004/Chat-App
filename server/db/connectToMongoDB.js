import mongoose from 'mongoose';
import dns from 'dns';

// Set DNS servers to bypass problematic DNS
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectToMongoDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

export default connectToMongoDB;