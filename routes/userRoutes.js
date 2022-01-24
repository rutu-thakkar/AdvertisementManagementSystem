const express = require('express');
const route = express.Router();
const userController = require('../controller/userController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + file.originalname + "-" + Date.now() + ".jpg");
    }
});

var upload = multer({ storage: storage });

route.get('/', userController.home);
route.get('/getAllUsers', userController.getAllUsers)
route.post('/signup', upload.single('profile'), userController.signup);
route.post('/login', userController.login);
// route.put('/updateUser', userController.updateUser);

module.exports = route;