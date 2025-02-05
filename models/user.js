const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit phone number!`
      }
    },
    profile_pic: {
      type: String,
      validate: {
        validator: function (value) {
          if (!value) return true;
          const base64Size = Buffer.byteLength(value, "base64");
          const maxSize = 1 * 1024 * 1024; // 1MB
          return base64Size <= maxSize;
        },
        message: "Profile picture size must be less than or equal to 1MB",
      },
    },
    bio: {
      type: String,
      validate: {
        validator: function (value) {
          if (!value) return true;
          const wordCount = value.trim().split(/\s+/).length;
          return wordCount <= 500;
        },
        message: "Bio must not exceed 500 words",
      },
    },
    token: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


userSchema.index({ email: 1, phone: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

module.exports = User;