const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");
const BlacklistedToken = require("../../models/blacklistedToken");
const { hashToken } = require("../../utils/hashToken");

router.post("/signup", async (req, res) => {
    try {
        const { username, firstname, lastname, email, password } = req.body;

        if (!username || !email || !password) {
            return res.json({ result: false, error: "Missing fields" });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.json({
                result: false,
                error: "Username or email already used",
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            firstname,
            lastname,
            email,
            password: hashPassword,
        });

        const accessToken = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const refreshToken = jwt.sign(
            { id: newUser._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            result: true,
            accessToken,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.json({ result: false, error: error.message });
    }
});

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ result: false, error: "Missing fields" });
        }

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.json({
                result: false,
                error: "Invalid email or password",
            });
        }

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
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
        await hashToken(token).then((hashed) =>
            BlacklistedToken.create({ tokenHash: hashed })
        );

        res.json({ result: true, message: "User logged out successfully" });
    } catch (error) {
        res.json({ result: false, error: error.message });
    }
});

router.post("/refresh", async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.json({ result: false, error: "No refresh token provided" });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const accessToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.json({ result: true, accessToken });
    } catch (error) {
        res.json({ result: false, error: error.message });
    }
});

module.exports = router;