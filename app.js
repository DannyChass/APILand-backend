require("dotenv").config();
const express = require("express");
const connectDB = require("./models/connexion");
const userRoutes = require("./routes/user");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", userRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("API Running with MongoDB!");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});