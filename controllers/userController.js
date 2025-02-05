require("dotenv").config({ path: `${process.cwd()}/.env` });
const path = require("path");
const jwt = require("jsonwebtoken");
const sendEmail = require("../helpers/nodemailer");
const User = require("../models/user");
const Video = require("../models/video");
const bcrypt = require("bcryptjs");


const generateToken = (_id) => {
  try {
    if (!_id) throw new Error("User ID is required to generate a token");

    const token = jwt.sign({ _id }, process.env.JWT_SECRET, {
      expiresIn: "360h",
    });
    return token;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to generate token");
  }
};

const generatePassword = (firstName, lastName, phone) => {
  if (firstName.length < 2 || lastName.length < 2 || phone.length < 4) {
    throw new Error("Invalid input for password generation");
  }
  return `${firstName.slice(0, 2)}${lastName.slice(-2)}${phone.slice(-4)}`;
};

const sendStyledEmail = (email, password) => {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
      <h2 style="color: #4CAF50;">Thank You for Registering!</h2>
      <p style="font-size: 16px; color: #333;">Your account has been successfully created.</p>
      <p style="font-weight: bold;">Here is your password:</p>
      <div style="background-color: #e7f3fe; padding: 10px; border-left: 5px solid #2196F3; margin: 10px 0; font-size: 18px;">
        ${password}
      </div>
      <p style="color: #777;">Please change your password after logging in for the first time.</p>
    </div>
  `;

  sendEmail(email, "Account Created", emailContent);
};

const createAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!phoneRegex.test(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number format. Must be 10 digits." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email or phone already exists" });
    }

    const password = generatePassword(firstName, lastName, phone);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    sendStyledEmail(email, password);

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { firstName, password } = req.body;

    if (!firstName || !password) {
      return res
        .status(400)
        .json({ message: "First name and password are required" });
    }

    const user = await User.findOne({ firstName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    user.token = token;
    await user.save();

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const uploadProfilePic = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);


    if (!user) return res.status(404).json({ error: "User not found" });
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const profileImage = path.join("image", req.file.filename);
    const completeProfileImage = `${
      process.env.BASE_URL
    }/${profileImage.replace(/\\/g, "/")}`;

    user.profile_pic = completeProfileImage;
    await user.save();

    return res
      .status(200)
      .json({
        message: "Profile picture updated successfully",
        profilePicUrl: completeProfileImage,
      });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const addBio = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const { bio } = req.body;
    if (!bio) return res.status(400).json({ error: "Bio is required" });

    const wordCount = bio.trim().split(/\s+/).length;
    if (wordCount > 500)
      return res.status(400).json({ error: "Bio must not exceed 500 words" });

    user.bio = bio;
    await user.save();

    return res
      .status(200)
      .json({ message: "Bio updated successfully", bio: user.bio });
  } catch (error) {
    console.error("Error updating bio:", error);
    return res.status(500).json({ error: "Server error" });
  }
};



const uploadVideo = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const { title, description } = req.body;

    if (!title || !description ) {
      return res.status(400).json({ message: "title and description  are required" });
    }
 
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    if (req.file.mimetype !== "video/mp4") {
      return res.status(400).json({ error: "Only MP4 format is allowed" });
    }

    const videoPath = path.join("video", req.file.filename);

    const completeVideoPath = `${
      process.env.BASE_URL
    }/${videoPath.replace(/\\/g, "/")}`;


    const newVideo = new Video({
      user: user._id,
      video: completeVideoPath,
      title,
      description,
    });

    await newVideo.save();

    res.status(201).json({ 
      message: "Video uploaded successfully!",
      data:newVideo
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};



const getUserInfo = async (req, res) => {
  try {
   const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      message: "User information retrieved successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profile_pic: user.profile_pic,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error("Error retrieving user info:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};


const getProfilePic = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.profile_pic) 
      return res.status(404).json({ error: "No profile picture found" });

    res.status(200).json({
      message: "Profile picture retrieved successfully",
      profilePicUrl: user.profile_pic
    });
  } catch (error) {
    console.error("Error retrieving profile picture:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};


const getBio = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.bio) 
      return res.status(404).json({ error: "No bio found" });

    res.status(200).json({
      message: "Bio retrieved successfully",
      bio: user.bio
    });
  } catch (error) {
    console.error("Error retrieving bio:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};


const getAllUsersWithContent = async (req, res) => {
  try {

    const users = await User.find().select('firstName profile_pic');
    
    const usersWithVideos = await Promise.all(users.map(async (user) => {
      const videos = await Video.find({ user: user._id }).select('title video');
      return {
        _id: user._id,
        firstName: user.firstName,
        profilePic: user.profile_pic || null,
        videoCount: videos.length,
        videos: videos.map(video => ({
          title: video.title,
          videoUrl: video.video
        }))
      };
    }));

    res.status(200).json({
      message: "Users retrieved successfully",
      users: usersWithVideos
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

module.exports = {
  createAccount,
  login,
  uploadProfilePic,
  addBio,
  uploadVideo,
  getUserInfo,
  getProfilePic,
  getBio,
  getAllUsersWithContent
  
};
