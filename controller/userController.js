const express = require('express');
const app = express();
const db = require("../models")
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.use(cookieParser());

var transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.User,
        pass: process.env.Pass
    }
});


exports.home = (req,res) => {
    res.json({
        message: 'Welcome to the Advertisement Management System'
    })
}

// get all users
exports.getAllUsers = (req, res) => {
    db.users.findAll().then(users => {
        if(Object.keys(users).length === 0) {
            res.json({
                message : "No user found"
            });
            return;
        }
        res.json({
            success : 1,
            data : users
        })
    });
}

// sign up or register user
var mailOptions;
exports.signup = (req, res) => {

    db.users.findOne({ 
        where: {
            email: req.body.email
        }
    }).then((data) => {
        if(data){
            res.json({
                message: "Email Id Already Exists"
            })
            return;
        }
        db.users.findOne({ 
            where: {
                username: req.body.username
            }
        }).then((data) => {
            if(data){
                res.json({
                    message: "Username Already Exists"
                })
                return;
            }

            const secretKey = process.env.secret + req.body.email + req.body.password;
            const token = jwt.sign({
                username: req.body.username,
                email: req.body.email
            }, secretKey)
            const link = `http://${req.get('host')}/${token}`
            mailOptions = {
                to : req.body.email,
                subject : "Please Confirm Your email account",
                html : "Please click the given link to verify your email account. " + link 
            }

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    db.users.create({
                        name : req.body.name,
                        profile : req.file.filename,
                        username : req.body.username,
                        email : req.body.email,
                        password : hash,
                        secretkey: secretKey
                    }).then((data) => {
                        if(!data) {
                            res.json({ 
                                message: "Something Went Wrong!"
                            })
                            return;
                        }
                        transport.sendMail(mailOptions, (error, response) => {
                            if(error) {
                                res.json({error});
                            } else {
                                res.status(200).json({
                                    message : "Sign up successful kindly verify your email to activate your account.",
                                    data
                                }); 
                            }
                        })
                    });
                });
            });
        }).catch((err) => {
            res.status(500).json({
                message: "Error: " + err.message + " ahi thi aave error"
            })
        });
    }).catch((err) => {
        res.json({
            message : "Error: " + err
        });
    });
}

// login user
exports.login = (req, res) => {
      db.users.findOne({
          where: { 
              email: req.body.email
          }
      }).then((data) => {
        if (data == null) {
            res.json({
            message: 'User account not found. Kindly Register.'
            });
            return;
        }

        res.json({data});

        // if(data.isActive == false) {
        //     res.json({
        //         message: 'Kindly verify your email account.'
        //     })   
        // } else {
            // bcrypt.compare(req.body.password, data.password, (err, result) => {
            //     if(result) {
            //         res.json({
            //             message: 'Login successful'
            //         })
            //         return;
            //     }
            //     res.json({
            //         message: 'Invalid Credentials'
            //     });
            // });
    // }
        }).catch((err) => {
          res.json({
              message: err.message
          })
      });
}

