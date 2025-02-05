const User = require("../models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const isAuthorize = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, msg: "Authentication failed. Token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded._id, token });

    if (user) {
      req.user = user;
      req.userId = decoded._id;
    } else {
      return res
        .status(401)
        .json({
          success: false,
          msg: "Authentication failed. User not found.",
        });
    }

    next();
  } catch (error) {
    console.log("Error in authentication middleware", error);
    return res
      .status(401)
      .json({ success: false, msg: "Authentication failed. Invalid token." });
  }
};

module.exports = {
  isAuthorize,
};
