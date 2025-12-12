var express = require("express");
var router = express.Router();

require("../models/connexion");
const Api = require("../models/api");
const Tag = require("../models/tag");
const checkToken = require("../middlewares/checkToken");
const User = require("../models/user");
const ApiFollower = require("../models/apiFollower");
const Comment = require("../models/comment");
const News = require("../models/news");
router.use("/", require("./api/api.routes"));

router.post("/follow/:apiId", checkToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const apiId = req.params.apiId;

    const api = await Api.findById(apiId);
    if (!api) {
      return res.json({ result: false, error: "API not found" });
    }

    const existingFollow = await ApiFollower.findOne({ user: userId, api: apiId });

    if (existingFollow) {
      await ApiFollower.deleteOne({ _id: existingFollow._id });

      return res.json({
        result: true,
        message: "Unfollowed",
        isFollowed: false
      });
    }

    const follow = await ApiFollower.create({ user: userId, api: apiId });

    return res.json({
      result: true,
      message: "Followed",
      isFollowed: true
    });

  } catch (error) {
    console.error("Follow toggle error:", error);
    return res.json({ result: false, error: error.message });
  }
});

router.get("/created/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId).populate("createdApis");

  if (!user) {
    return res.json({ result: false, error: "User no found" })
  }

  res.json({ result: true, apis: user.createdApis });
})

router.get('/allApi/:text', async (req, res) => {
  const text = req.params.text;

  try {
    const api = await Api.find({ name: { $regex: text, $options: 'i' } })

    res.json(api)
  } catch (error) {
    res.status(500).json({ result: false, error: error })
  }
})

router.get('/allApiSearch/:search', async (req, res) => {
  const searchString = req.params.search;
  console.log("Search String:", searchString);
  const keywords = searchString.trim().split(/\s+/);

  const search = keywords.map(keyword => {
    const regex = new RegExp(keyword, 'i');
    return {
      $or: [
        { name: { $regex: regex } },
        { category: { $regex: regex } }
      ]
    }
  });

  try {
    const apiSearch = await Api.find({ $or: search })

    const calculateMatchScore = (api) => {
      let score = 0;
      keywords.forEach(keyword => {
        const searchRegex = new RegExp(keyword, 'i');
        if (
          (api.name && searchRegex.test(api.name)) ||
          (api.category && searchRegex.test(api.category))
        ) {
          score++;
        }
      });
      return score;
    };
    const sortedApiSearch = [...apiSearch].sort((a, b) => {
      const scoreA = calculateMatchScore(a);
      const scoreB = calculateMatchScore(b);

      return scoreB - scoreA;

    });
    res.json(sortedApiSearch);
    console.log(sortedApiSearch);
  } catch (error) {
    res.status(500).json({ result: false, error: error })
  }
})

router.get("/allApi", async (req, res) => {
  try {
    const data = await Api.find();


    res.status(200).json({ result: true, allAPI: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ result: false });
  }
});

router.get("/top", async (req, res) => {
  try {
    const topApis = await Api.find().sort({ notation: -1 }).limit(10);
    res.json({ result: true, apis: topApis });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
})

router.get("/:apiId/news", async (req, res) => {
  try {
    const news = await News.find({ api: req.params.apiId })
      .sort({ createdAt: -1 })
      .populate("author", "username image");

    res.json({ result: true, news });
  } catch (error) {
    console.error("Fetch news error:", error);
    res.json({ result: false, error: "Cannot fetch news" });
  }
});

router.post("/:apiId/comments", checkToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.json({ result: false, error: "Empty comment" });
    }

    const api = await Api.findById(req.params.apiId);
    if (!api) {
      return res.json({ result: false, error: "API not found" });
    }

    const comment = await Comment.create({
      api: req.params.apiId,
      author: req.user.id,
      content,
      parentComment: null
    });

    return res.json({ result: true, comment });

  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ result: false, error: error.message });
  }
})

router.get("/:apiId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({
      api: req.params.apiId,
      parentComment: null
    })
      .populate("author", "username image")
      .populate({
        path: "replies",
        populate: { path: "author", select: "username image" }
      })
      .sort({ createdAt: -1 });

    res.json({ result: true, comments });
  } catch (error) {
    console.error("Error fetching comments", error);
    res.status(500).json({ result: false, error: error.message });
  }
})

router.get("/follow/:apiId/status", checkToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const apiId = req.params.apiId;

    const follow = await ApiFollower.findOne({ user: userId, api: apiId });

    return res.json({
      result: true,
      isFollowed: !!follow
    });

  } catch (error) {
    console.error("Error checking follow:", error);
    res.json({ result: false, error: error.message });
  }
});

module.exports = router;