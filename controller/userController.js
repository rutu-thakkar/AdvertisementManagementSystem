const express = require("express");
const app = express();
const session = require("express-session");
const db = require("../models");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// const validator = require("email-validator");
const { userSchema, loginSchema } = require("../Validation");
const logger = require("./logger");

// console.log(process.env.SESSION_SECRET);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

var transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.User,
    pass: process.env.Pass,
  },
});

exports.home = (req, res) => {
  // res.cookie("user", "Rutu Thakkar");
  // console.log(req.cookies);

  console.log(req.headers.cookie);
  // console.log("demoCookies" + req.rawHeaders.user);
  // console.log("Cookies: ", req.cookies);

  res.json({
    message: "Welcome to the Advertisement Management System",
  });
};

// get all users
exports.getAllUsers = (req, res) => {
  db.users
    .findAll()
    .then((users) => {
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
      logger.advertiseLogger.log("info", "successfully got all users");
    })
    .catch((err) => {
      res.json({ message: err.message });
      logger.advertiseLogger.log("error", "Error displaying users");
    });
};

// sign up or register user
var mailOptions;
exports.signup = (req, res) => {
  // if (validator.validate(req.body.email) === false) {
  //   res.json({ error: "Please emter email in proper format." });
  //   return;
  // }
  const result = userSchema.validate(req.body);
  // res.json(result);
  if (result.error) {
    res.json({ error: result.error.details[0].message });
    return;
  }
  // res.json({ result: result.value.email });
  db.users
    .findOne({
      where: {
        email: result.value.email,
      },
    })
    .then((data) => {
      if (data) {
        res.json({
          message: "Email Id Already Exists",
        });
        return;
      }

      if (
        req.file.mimetype === "image/png" ||
        req.file.mimetype === "image/jpg" ||
        req.file.mimetype === "image/jpeg"
      ) {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            const secretKey = process.env.secret;
            const token = jwt.sign(
              {
                email: result.value.email,
              },
              secretKey
            );
            const link = `http://${req.get("host")}/users/${token}`;
            mailOptions = {
              to: result.value.email,
              subject: "Please Confirm Your email account",
              html:
                "Please click the given link to verify your email account. " +
                "<br>" +
                link,
            };
            db.users
              .create({
                name: req.body.name,
                profile: req.file.filename,
                email: result.value.email,
                password: hash,
                secretkey: token,
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
      } else {
        res.json({ message: "profile must be image" });
      }
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
  db.users
    .findOne({
      sercretkey: token,
    })
    .then((user) => {
      if (!user) {
        return;
      }
      db.users
        .update(
          {
            isActive: 1,
            secretkey: "",
          },
          {
            where: {
              secretkey: token,
            },
          }
        )
        .then((updated) => {
          if (updated === 0) {
            res.json({
              message: "Something Went wrong",
            });
            return;
          }
          res.json({
            result,
            message: "Account Activated! you can Log in.",
          });
        });
    })
    .catch((error) => {
      res.json({ error: error });
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
  // res.json(req.cookies);
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
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          res.json({ message: err.message });
          return;
        }
        if (result) {
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
        } else {
          res.json({
            message: "Incorrect Password",
          });
        }
      });
    })
    .catch((error) => {
      res.json({ error: "Error : " + error.message });
    });
};

exports.getUpdateUser = (req, res) => {
  db.users
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then((user) => {
      if (!user) {
        res.json({ message: "User not found" });
        return;
      }
      res.json({ message: "user data", user });
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
};

exports.updateUser = (req, res) => {
  db.users
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then((data) => {
      if (!data) {
        res.json({
          message: "No User found",
        });
        return;
      }
      db.users
        .update(
          {
            name: req.body.name,
          },
          {
            where: {
              email: req.body.email,
            },
          }
        )
        .then((data) => {
          if (data === 0) {
            res.json({
              message: "No user Updated!",
            });
          } else {
            res.json({
              message: data + " user Updated!",
            });
          }
        })
        .catch((err) => {
          res.json({ error: err.message });
        });
    })
    .catch((err) => {
      res.json({ error: err.message });
    });
};

exports.getForgotPassword = (req, res) => {
  res.render("resetPassword");
};

exports.forgotPassword = (req, res) => {
  db.users
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then((data) => {
      if (!data) {
        res.json({ message: "Email address not found" });
        return;
      }
      const secretKey = process.env.secret + data.password;
      const token = jwt.sign(
        {
          email: data.email,
        },
        secretKey,
        { expiresIn: "15m" }
      );
      const link = `http://${req.get("host")}/users/${data.id}/${token}`;
      mailOptions = {
        to: req.body.email,
        subject: "Reset Password",
        html:
          "<b>Reset Password link</b>, " +
          "<br>" +
          "Click here to reset your password " +
          "<br>" +
          link,
      };
      transport.sendMail(mailOptions, (error, result) => {
        if (error) {
          res.json({
            message: "Something Went wrong! Try Again.",
          });
          return;
        }
        res.json({
          message: "link to reset password sent to your email address",
        });
      });
    })
    .catch((err) => {
      res.json({
        message: err.message,
      });
    });
};

exports.getresetPassord = (req, res) => {
  const { id, token } = req.params;
  // console.log(id, token);
  db.users
    .findOne({
      where: {
        id: id,
      },
    })
    .then((user) => {
      console.log(user);
      if (!user) {
        res.json({
          message: "No user found",
        });
        return;
      }
      const secretKey = process.env.secret + user.password;
      const result = jwt.verify(token, secretKey);
      res.json({
        result,
        message: "Reset Your Password",
      });
    })
    .catch((error) => {
      res.json({
        message: "Error",
      });
    });
};

exports.resetPassword = (req, res) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      db.users
        .update(
          {
            password: hash,
          },
          {
            where: {
              email: req.body.email,
            },
          }
        )
        .then((data) => {
          if (data === 0) {
            res.json({
              message: "No User found",
            });
            return;
          }
          res.json({
            message: data + " data updated successfully.",
          });
        })
        .catch((error) => {
          res.json({
            message: "Error updating password. " + error,
          });
        });
    });
  });
};

exports.demo = (req, res) => {
  res.json({
    message: "",
  });
};
