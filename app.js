require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./models/connexion");

const userRoutes = require("./routes/user");
const apiRouter = require("./routes/api");
const newsRoutes = require("./routes/news");
const notificationsRouter = require("./routes/notification");
const apiEndpointRoutes = require("./routes/apiEndpoint");
const commentsRoute = require("./routes/comment");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  "https://api-land-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== "test") {
  connectDB();
}

app.get("/", (req, res) => {
  res.send("API Running with MongoDB!");
});

app.use("/apis", apiRouter);
app.use("/users", userRoutes);
app.use("/news", newsRoutes);
app.use("/notifications", notificationsRouter);
app.use("/api", apiEndpointRoutes);
app.use("/comments", commentsRoute);

module.exports = app;