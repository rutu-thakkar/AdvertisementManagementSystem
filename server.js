const express = require("express");
const cors = require("cors");
require("dotenv").config();
const YAML = require("yamljs");
const swaggerUI = require("swagger-ui-express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const db = require("./models");
const port = process.env.PORT || 3000;
const JSDoc = YAML.load("./api.yaml");
const Sequelize = require("sequelize");

app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(JSDoc));

// const Country = sequelize.define("Country", {
//   countryName: {
//     type: "string",
//     unique: true,
//   },
// });

// const Capital = sequelize.define("Capital", {
//   capitalName: {
//     type: "string",
//     unique: true,
//   },
// });

db.users
  .sync()
  .then(() => {
    db.posts
      .sync()
      .then(() => {
        app.listen(port, () => {
          console.log(`listening on http://localhost:${port}`);
        });
      })
      .catch((err) => {
        console.error(err);
      });
  })
  .catch((err) => {
    console.error(err);
  });
