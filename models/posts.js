"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.users.hasMany(posts);
      // define association here
    }
  }
  posts.init(
    {
      postTitle: DataTypes.STRING,
      postDescription: DataTypes.STRING,
      postLikes: DataTypes.INTEGER,
      userEmail: DataTypes.STRING,
      postImage: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "posts",
    }
  );
  return posts;
};
