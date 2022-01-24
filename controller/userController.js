const express = require("express");
const app = express();
const db = require("../models");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.use(cookieParser());

var transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.User,
    pass: process.env.Pass,
  },
});

exports.home = (req, res) => {
  res.json({
    message: "Welcome to the Advertisement Management System",
  });
};

// get all users
exports.getAllUsers = (req, res) => {
  db.users.findAll().then((users) => {
    if (Object.keys(users).length === 0) {
      res.json({
        message: "No user found",
      });
      return;
    }
    res.json({
      success: 1,
      data: users,
    });
  });
};

// sign up or register user
var mailOptions;
exports.signup = (req, res) => {
  db.users
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then((data) => {
      if (data) {
        res.json({
          message: "Email Id Already Exists",
        });
        return;
      }
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          const secretKey = process.env.secret;
          const token = jwt.sign(
            {
              email: req.body.email,
            },
            secretKey
          );
          const link = `http://${req.get("host")}/users/${token}`;
          mailOptions = {
            to: req.body.email,
            subject: "Please Confirm Your email account",
            html:
              "Please click the given link to verify your email account. " +
              link,
          };
          db.users
            .create({
              name: req.body.name,
              profile: req.file.filename,
              email: req.body.email,
              password: hash,
              secretkey: secretKey,
            })
            .then((data) => {
              if (!data) {
                res.json({
                  message: "Something Went Wrong!",
                });
                return;
              }
              transport.sendMail(mailOptions, (error, response) => {
                if (error) {
                  res.json({ error });
                } else {
                  res.cookie(data.email);
                  res.status(200).json({
                    message:
                      "Sign up successful kindly verify your email to activate your account.",
                    data,
                  });
                }
              });
            });
        });
      });
    })
    .catch((err) => {
      res.json({
        message: "Error: " + err,
      });
    });
};

// Verify email account

exports.verify = (req, res) => {

  const { token } = req.params;
  const result = jwt.verify(token, process.env.secret);
  res.json({
    result,
    message: "Now you can Log in",
  });
};

// login user
exports.login = (req, res) => {
  db.users
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then((data) => {
      if (data == null) {
        res.json({
          message: "User account not found. Kindly Register.",
        });
        return;
      }

      //   res.json({ data });

      if (data.isActive == 0) {
        res.json({
          message: "Kindly verify your email account.",
        });
      } else {
        bcrypt.compare(req.body.password, data.password, (err, result) => {
          if (result) {
            res.cookie(data.email);
            res.json({
              message: "Login successful",
            });
            return;
          }
          res.json({
            message: "Invalid Credentials",
          });
        });
      }
    })
    .catch((err) => {
      res.json({
        message: err.message,
      });
    });
};

//delete User by email
exports.deleteUser = (req, res) => {
  db.users
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then((user) => {
      if (!user) {
        res.json({
          message: "User not found",
        });
        return;
      }
      db.users
        .destroy({
          where: {
            email: user.email,
          },
        })
        .then((data) => {
          if (data === 0) {
            res.json({
              message: "Something went wrong! No User Deleted!",
            });
          } else {
            res.json({
              message: data + " user deleted successfully!",
            });
          }
        })
        .catch((error) => {
          res.json({ error: "Error : " + error.message });
        });
    })
    .catch((error) => {
      res.json({ error: "Error : " + error.message });
    });
};
