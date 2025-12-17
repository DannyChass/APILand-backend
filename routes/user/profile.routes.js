const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../../configs/cloudinary");
const User = require("../../models/user");
const checkToken = require("../../middlewares/checkToken");

const upload = multer({ storage: multer.diskStorage({}) });

router.get("/me", checkToken, async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ result: false });
    res.json({ result: true, user });
});

router.put("/me", checkToken, upload.single("image"), async (req, res) => {
    let image;
    if (req.file) {
        const r = await cloudinary.uploader.upload(req.file.path, {
            folder: "Users_Avatar",
        });
        image = r.secure_url;
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { ...req.body, image },
        { new: true }
    );

    res.json({ result: true, user });
});

router.patch("/me", checkToken, async (req, res) => {
    const allowed = ["username", "firstname", "lastname", "email", "telephoneNumber"];
    const updates = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
    }).select("-password");

    res.json({ result: true, user });
});

router.delete("/me", checkToken, async (req, res) => {
    await User.findByIdAndDelete(req.user.id);
    res.json({ result: true });
});

module.exports = router;