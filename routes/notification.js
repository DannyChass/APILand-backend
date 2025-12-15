const express = require("express");
const router = express.Router();

const Notification = require("../models/notification");
const checkToken = require("../middlewares/checkToken");

router.get("/", checkToken, async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user.id,
        })
            .sort({ createdAt: -1 })
            .populate("sender", "username image")
            .populate("api", "name");

        res.json({ result: true, notifications });
    } catch (error) {
        console.error("Fetch notifications error:", error);
        res.status(500).json({ result: false, error: error.message });
    }
});

module.exports = router;