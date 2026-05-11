import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'JWT_SECRET',
  'MONGO_URI',
  'PORT'
];

export const validateEnv = () => {
  const missing = [];
  
  // Accept either MONGODB_URI or MONGO_URI for compatibility.
  if (!process.env.MONGO_URI && process.env.MONGODB_URI) {
    process.env.MONGO_URI = process.env.MONGODB_URI;
  }

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please check your .env file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
};

export default validateEnv;