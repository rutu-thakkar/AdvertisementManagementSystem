const express = require("express");
const app = express();
const db = require("../models");
const cookieParser = require("cookie-parser");

app.use(cookieParser());

exports.home = (req, res) => {
  res.cookie("sky", "blue");
  res.json({
    message: "This is post home",
  });
  console.log(req.cookies);
};

exports.getAllPosts = (req, res) => {
  res.cookie("Rutu", "Rutu Thakkar");
  db.posts
    .findAll()
    .then((posts) => {
      if (Object.keys(posts).length === 0) {
        res.json({ message: "No posts found." });
        return;
      }
      res.json({ message: "This is all POSTS", posts });
    })
    .catch((error) => {
      res.json({ message: "Error : " + error.message });
    });
};

exports.demo = (req, res) => {
  res.json({ data: req.cookies.Rutu });
};

exports.addPost = (req, res) => {
  // res.json({ message: "ADVERTISE!" });
  db.posts
    .create({
      postTitle: req.body.postTitle,
      postDescription: req.body.postDescription,
      postLikes: 0,
      userEmail: req.body.userEmail,
      postImage: req.file.originalname,
    })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ error: err.message });
    });
};
