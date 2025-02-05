const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      validate: {
        validator: function (value) {
          if (!value) return true;
          const wordCount = value.trim().split(/\s+/).length;
          return wordCount <= 30;
        },
        message: "Title must not exceed 30 words",
      },
    },
    description: {
      type: String,
      validate: {
        validator: function (value) {
          if (!value) return true;
          const wordCount = value.trim().split(/\s+/).length;
          return wordCount <= 120;
        },
        message: "Description must not exceed 120 words",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;


