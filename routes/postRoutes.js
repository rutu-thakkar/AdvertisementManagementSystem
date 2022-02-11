const express = require("express");
const multer = require("multer");
const route = express.Router();
const postController = require("../controller/postController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/posts");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname +
        "-" +
        file.originalname +
        "-" +
        Date.now().toString() +
        ".jpg"
    );
  },
});

var upload = multer({ storage });

route.get("/", postController.home);
route.get("/demo", postController.demo);
route.get("/getAllPosts", postController.getAllPosts);
route.post("/addPost", upload.single("postImage"), postController.addPost);
// route.post("/signup", upload.single("profile"), userController.signup);

module.exports = route;
