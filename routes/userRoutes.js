const express = require("express");
const route = express.Router();
const userController = require("../controller/userController");
const multer = require("multer");
const app = express();
const session = require("express-session");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var upload = multer({ storage: storage, filefilter: filefilter });
// var upload = multer({ storage: storage });
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

route.get("/demo", userController.demo);
route.get("/", userController.home);
route.get("/getAllUsers", userController.getAllUsers);
route.post("/signup", upload.single("profile"), userController.signup);
route.get("/:token", userController.verify);
route.post("/login", userController.login);
route.delete("/deleteUser", userController.deleteUser);
route.put("/updateUser", userController.updateUser);
route.get("/password/getForgotPassword", userController.getForgotPassword);
route.post("/updateUser", userController.getUpdateUser);
route.post("/forgotPassword", userController.forgotPassword);
route.get("/:id/:token", userController.getresetPassord);
route.post("/resetPassord", userController.resetPassword);

module.exports = route;
