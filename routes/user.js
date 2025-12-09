const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/blacklistedToken");
const { hashToken } = require("../utils/hashToken");
const checkToken = require("../middlewares/checkToken");

router.post("/signup", async (req, res) => {
    try {

        const { username, firstname, lastname, email, password, telephoneNumber } = req.body;

        if (!username || !email || !password) {
            return res.json({ result: false, error: "Missing fields" });
        }

        const existtingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existtingUser) {
            return res.json({
                result: false, error: "Username or email already used"
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username,
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashPassword,
            telephoneNumber: telephoneNumber,
        })

        await newUser.save();

        const accessToken = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign({
            id: newUser._id,
        },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        )

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            result: true,
            accessToken,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        res.json({ result: false, error: error.message })
    }
})

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ result: false, error: "Missing fields" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ result: false, error: "Invalid email or password" });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            return res.json({ result: false, error: "Invalid email or password" });
        }

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            result: true,
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        });

    } catch (error) {
        res.json({ result: false, error: error.message });
    }
});

router.post("/signout", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.json({ result: false, error: "No token provided" });
        }

        const token = authHeader.replace("Bearer ", "");

        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.json({ result: false, error: "Invalid or expired token" });
        }

        const hashed = await hashToken(token);

        const blacklisted = new BlacklistedToken({ tokenHash: hashed });
        await blacklisted.save();

        return res.json({ result: true, message: "User logged out successfully" });

    } catch (error) {
        return res.json({ result: false, error: error.message });
    }
})

router.get("/me", checkToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ result: false, error: "User not found" });
        }

        res.json({
            result: true,
            user
        })

    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
})

router.patch("/me", checkToken, async (req, res) => {
    try {

        const allowedFields = ["username", "firstname", "lastname", "email", "email", "telephoneNumber"];

        const updates = {};

        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ result: false, error: "No valid field provided" });
        }

        if (updates.email) {
            const existingEmailUser = await User.findOne({ email: updates.email });
            if (existingEmailUser && existingEmailUser._id.toString() !== req.user.id) {
                return res.status(400).json({ result: false, error: "Email already in use" });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true }
        ).select("-password");

        res.json({
            result: true,
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
})

module.exports = router;