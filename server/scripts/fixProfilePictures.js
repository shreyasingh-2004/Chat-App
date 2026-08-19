import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import { generateProfilePicture } from '../utils/profilePicture.js';

dotenv.config();

const fixProfilePictures = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("📦 Connected to MongoDB");

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let updated = 0;
    for (const user of users) {
      const newProfilePic = generateProfilePicture(
        user.fullName, 
        user.username, 
        user.age
      );
      
      // Only update if different
      if (user.profilePic !== newProfilePic) {
        user.profilePic = newProfilePic;
        await user.save();
        updated++;
        console.log(`✅ Updated ${user.username}`);
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updated} users.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

fixProfilePictures();