const express = require("express");
const cors = require("cors");
require("dotenv").config();
const YAML = require("yamljs");
const swaggerUI = require("swagger-ui-express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const db = require("./models");
const port = process.env.PORT || 3000;
const JSDoc = YAML.load("./api.yaml");

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(JSDoc));

db.users
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
