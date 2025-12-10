require("dotenv").config();
const express = require("express");
const connectDB = require("./models/connexion");
const userRoutes = require("./routes/user");
const cors = require("cors");

const app = express();
var cookieParser = require('cookie-parser');
var apiRouter = require('./routes/api');

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

connectDB();

app.get("/", (req, res) => {
  res.send("API Running with MongoDB!");
});

app.use('/apis', apiRouter);
app.use("/users", userRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports = app;