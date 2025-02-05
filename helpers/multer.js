const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, path.join(__dirname, "../public/image"));
    } else if (file.mimetype === "video/mp4") {
      cb(null, path.join(__dirname, "../public/video"));
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/svg+xml", "video/mp4"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, SVG images, and MP4 videos are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB limit for videos
});

module.exports = upload;