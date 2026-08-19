import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import { generateProfilePicture } from '../utils/profilePicture.js';

export const signup = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, age } = req.body;

    // Validation
    if (!fullName || !username || !password || !confirmPassword || !age) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Age validation
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return res.status(400).json({ error: "Please enter a valid age (13-120)" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      age: ageNum,
      profilePic: generateProfilePicture(fullName, username, ageNum),
    });

    const token = generateToken(newUser._id, res);

    await newUser.save();

    const publicUser = {
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      profilePic: newUser.profilePic,
      bio: newUser.bio,
      age: newUser.age,
    };

    req.app.get('io')?.emit('userCreated', publicUser);

    res.status(201).json({
      ...publicUser,
      token: token,
    });
  } catch (error) {
    console.error("Error in signup controller:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(400).json({ error: `${field} already exists` });
    }

    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0]?.message || "Invalid user data";
      return res.status(400).json({ error: message });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Login attempt for username:", username);

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      console.log("User not found:", username);
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      console.log("Invalid password for user:", username);
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = generateToken(user._id, res);

    console.log("Login successful for:", username);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
      age: user.age,
      token: token,
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};