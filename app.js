require("dotenv").config();
const express = require("express");
const connectDB = require("./models/connexion");

const app = express();

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("API Running with MongoDB!");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});