const express = require("express");
const router = express.Router();

const News = require("../models/news");
const Api = require("../models/api");

const checkToken = require("../middlewares/checkToken");

router.post("/", checkToken, async (req, res) => {
    try {
        const { title, content, image, apiId } = req.body;

        if (!title || !content || !apiId) {
            return res.json({
                result: false,
                error: "Missing required fields",
            });
        }

        const api = await Api.findById(apiId);
        if (!api) {
            return res.json({
                result: false,
                error: "API not found",
            });
        }

        if (api.user.toString() !== req.user.id) {
            return res.json({
                result: false,
                error: "You are not allowed to post news for this API",
            });
        }

        const news = new News({
            title,
            content,
            image,
            api: apiId,
            author: req.user.id,
        });

        await news.save();

        return res.json({
            result: true,
            news,
        });
    } catch (error) {
        console.error("CREATE NEWS ERROR:", error);
        return res.json({
            result: false,
            error: "Server error",
        });
    }
});

module.exports = router;