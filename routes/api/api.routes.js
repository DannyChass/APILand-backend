const express = require("express");
const router = express.Router();

const checkToken = require("../../middlewares/checkToken");
const Api = require("../../models/api");
const Tag = require("../../models/tag");
const User = require("../../models/user");

router.post("/create", checkToken, async (req, res) => {
    try {
        const {
            name,
            description,
            officialLink,
            documentationLink,
            category,
            image,
            tags,
        } = req.body;

        if (!name || name.trim() === "") {
            return res.json({ result: false, error: "Missing compulsory field" });
        }

        const existingApi = await Api.findOne({ name });
        if (existingApi) {
            return res.json({ result: false, error: "API already exists" });
        }

        const tagIds = [];

        for (const tagName of tags || []) {
            let tag = await Tag.findOne({ name: tagName });

            if (!tag) {
                tag = await Tag.create({ name: tagName });
            }

            tagIds.push(tag._id);
        }

        const api = await Api.create({
            name,
            description,
            officialLink,
            documentationLink,
            category,
            image,
            user: req.user.id,
            tags: tagIds,
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: { createdApis: api._id },
        });

        return res.json({ result: true, api });
    } catch (error) {
        console.error("Create API error:", error);
        return res.status(500).json({ result: false, error: error.message });
    }
});

router.get("/user/:userId", async (req, res) => {
    try {
        const apis = await Api.find({ user: req.params.userId });

        if (!apis.length) {
            return res.json({
                result: false,
                error: "No API created by this user",
            });
        }

        res.json({ result: true, apis });
    } catch (error) {
        console.error("Get user APIs error:", error);
        res.json({ result: false, error: error.message });
    }
});

router.get("/:name", async (req, res) => {
    try {
        const api = await Api.findOne({ name: req.params.name })
            .populate("user", "username image");

        if (!api) {
            return res.json({ result: false, error: "API not found" });
        }

        res.json({ result: true, api });
    } catch (error) {
        console.error("Get API error:", error);
        res.status(500).json({ result: false, error: error.message });
    }
});

router.put("/:id", checkToken, async (req, res) => {
    try {
        if (!req.body.name || req.body.name.trim() === "") {
            return res.json({ result: false, error: "Missing compulsory field" });
        }

        const api = await Api.findById(req.params.id);
        if (!api) {
            return res.json({ result: false, error: "API not found" });
        }

        if (api.user.toString() !== req.user.id) {
            return res.json({
                result: false,
                error: "Unauthorized: not the API owner",
            });
        }

        const updateData = {
            name: req.body.name,
            image: req.body.image || null,
            description: req.body.description || null,
            officialLink: req.body.officialLink || null,
            documentationLink: req.body.documentationLink || null,
            category: req.body.category || null,
            tags: req.body.tags || [],
        };

        await Api.updateOne({ _id: req.params.id }, updateData);

        res.json({ result: true, message: "API successfully updated" });
    } catch (error) {
        console.error("Update API error:", error);
        res.status(500).json({ result: false, error: error.message });
    }
});

router.delete("/", async (req, res) => {
    try {
        if (!req.body.name) {
            return res.json({ result: false, error: "Missing API name" });
        }

        const result = await Api.deleteOne({ name: req.body.name });

        if (!result.deletedCount) {
            return res.json({ result: false, message: "API not found" });
        }

        res.json({ result: true, message: "API deleted" });
    } catch (error) {
        console.error("Delete API error:", error);
        res.status(500).json({ result: false, error: error.message });
    }
});

module.exports = router;