const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const User = require("../models/user");
const jwt = require("jsonwebtoken");

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

        const token = jwt.sign({
            id: newUser._id,
            email: newUser.email,
        },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.json({
            result: true,
            token,
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
            return res.json({ result: false, error: "User not found" });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.json({ result: false, error: "Invalid password" });
        }

        const token = jwt.sign({
            id: user._id,
            email: user.email,
        },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            result: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        })
    } catch (error) {
        res.json({ result: false, error: error.message });
    }
});

module.exports = router;