const express = require('express');
const router = express.Router();
const userController =  require("../controllers/userController")
const upload = require("../helpers/multer");
const {isAuthorize} = require("../middlewares/authMiddleware");

router.post('/createAccount', userController.createAccount);
router.post('/login', userController.login);
router.patch(
    "/uploadProfilePicture",
    isAuthorize,
    upload.single("image"),
    userController.uploadProfilePic
  );
router.patch('/addBio',  isAuthorize, userController.addBio);

router.post("/upload-video", isAuthorize, upload.single("video"), userController.uploadVideo);
router.get("/getUserInfo", isAuthorize, userController.getUserInfo);
router.get("/getProfilePic", isAuthorize, userController.getProfilePic);
router.get("/getBio", isAuthorize, userController.getBio);
router.get("/getAllUsersWithContent", userController.getAllUsersWithContent);

module.exports = router;