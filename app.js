require("dotenv").config();
console.log("✅ dotenv loaded");

const express = require("express");
console.log("✅ express loaded");

const cors = require("cors");
console.log("✅ cors loaded");

const cookieParser = require("cookie-parser");
console.log("✅ cookie-parser loaded");

console.log("🔄 Loading database connection...");
const connectDB = require("./models/connexion");

console.log("🔄 Loading routes...");
const userRoutes = require("./routes/user");
console.log("✅ user routes loaded");

const apiRouter = require("./routes/api");
console.log("✅ api routes loaded");

const newsRoutes = require("./routes/news");
console.log("✅ news routes loaded");

const app = express();
console.log("✅ express app created");

app.use(express.json());
console.log("✅ json middleware");

app.use(cors({
  origin: "http://localhost:3001",
  credentials: true,
}));
console.log("✅ cors middleware");

app.use(cookieParser());
console.log("✅ cookie-parser middleware");

app.use(express.urlencoded({ extended: false }));
console.log("✅ urlencoded middleware");

console.log("🔄 Connecting to MongoDB...");
connectDB();
console.log("✅ connectDB() called");

app.get("/", (req, res) => {
  res.send("API Running with MongoDB!");
});

console.log("🔄 Registering routes...");
app.use("/apis", apiRouter);
console.log("✅ /apis route registered");

app.use("/users", userRoutes);
console.log("✅ /users route registered");

app.use("/news", newsRoutes);
console.log("✅ /news route registered");

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});