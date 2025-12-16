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

router.delete("/:id", checkToken, async (req, res) => {
    try {
        const deleted = await Notification.deleteOne({
            _id: req.params.id,
            recipient: req.user.id,
        });

        if (deleted.deletedCount === 0) {
            return res
                .status(404)
                .json({ result: false, error: "Notification not found" });
        }

        res.json({ result: true });
    } catch (error) {
        console.error("Delete notification error:", error);
        res.status(500).json({ result: false, error: error.message });
    }
});

router.patch("/:id/read", checkToken, async (req, res) => {
    try {
        const updated = await Notification.updateOne(
            { _id: req.params.id, recipient: req.user.id },
            { read: true }
        );

        if (updated.matchedCount === 0) {
            return res.status(404).json({ result: false, error: "Notification not found" });
        }

        res.json({ result: true });
    } catch (error) {
        console.error("Read notification error:", error);
        res.status(500).json({ result: false, error: error.message });
    }
})

module.exports = router;