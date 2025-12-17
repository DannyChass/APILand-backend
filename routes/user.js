const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const checkToken = require("../middlewares/checkToken");
const apiFollower = require("../models/apiFollower");
const cloudinary = require("../configs/cloudinary");
const multer = require("multer");
const { OAuth2Client } = require("google-auth-library");
const authRoutes = require("./user/auth.routes");
router.use("/", authRoutes);

const storage = multer.diskStorage({});
const upload = multer({ storage });

router.get("/me", checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    res.json({
      result: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.put("/me", checkToken, upload.single("image"), async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      email,
      telephoneNumber,
      birthDate,
      gender,
      country,
      description,
      githubLink,
    } = req.body;

    if (req.file) {
      let imageUrl = null;
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "Users_Avatar",
      });
      imageUrl = result.secure_url;
    }

    //const updates = req.body

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        email,
        telephoneNumber,
        birthDate,
        image: imageUrl,
        gender,
        country,
        description,
        githubLink,
      },
      //{$set: updates},
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ result: false, error: "User not found" });
    }
    res.json({ result: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.patch("/me", checkToken, async (req, res) => {
  try {
    const allowedFields = [
      "username",
      "firstname",
      "lastname",
      "email",
      "email",
      "telephoneNumber",
    ];

    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ result: false, error: "No valid field provided" });
    }

    if (updates.email) {
      const existingEmailUser = await User.findOne({ email: updates.email });
      if (
        existingEmailUser &&
        existingEmailUser._id.toString() !== req.user.id
      ) {
        return res
          .status(400)
          .json({ result: false, error: "Email already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json({
      result: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.delete("/me", checkToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      res.status(404).json({ result: false, error: "User not found" });
    }

    res.json({ result: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.get("/follow/:userId", checkToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = req.params.id;

    const follow = await apiFollower.find({ user: userId }).populate({
      path: "api",
      populate: { path: "user", select: "username email" }, // ici on va chercher le créateur de l’API
    });

    console.log(follow);

    if (!follow) {
      return res.json({
        result: false,
        isFollowed: false,
        error: "API not found",
      });
    }

    res.json({ result: true, isFollowed: true, data: follow });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId: sub,
        username: name?.split(" ")[0] || "",
        firstname: name?.split(" ")[0] || "",
        lastname: name?.split(" ")[1] || "",
        image: picture,
        email,
      });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      result: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

router.get("/github", (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`;
  res.redirect(redirectUri);
});

<<<<<<< Updated upstream
<<<<<<< Updated upstream
router.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;

  try {
    
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) {
      return res.status(400).json({ result: false, error: "No access token from GitHub" });
    }

    
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await userRes.json();

    
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const emails = await emailsRes.json();
    const primaryEmail = Array.isArray(emails) ? emails.find(e => e.primary)?.email : null;

    const { id, login, avatar_url } = userData;
    const email = userData.email || primaryEmail || `${login}@github.local`;

    
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        githubId: id,
        username: login,
        email,
        image: avatar_url,
      });
    }

    
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    
    res.json({
      result: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("GitHub login error:", error);
    res.status(500).json({ result: false, error: error.message });
  }
});



module.exports = router;
=======
module.exports = router;
>>>>>>> Stashed changes
=======
module.exports = router;
>>>>>>> Stashed changes
