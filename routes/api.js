var express = require("express");
var router = express.Router();

require("../models/connexion");
const Api = require("../models/api");
const Tag = require("../models/tag");
const checkToken = require("../middlewares/checkToken");

router.post("/create", checkToken, async (req, res) => {
  try {
    const { name, description, officialLink, documentationLink, category, image, tags } = req.body;

    if (!name || name === "") {
      return res.json({ result: false, error: "missing compulsory field" });
    }

    const existing = await Api.findOne({ name });
    if (existing) {
      return res.json({ result: false, error: "Api already exist" });
    }

    const tagIds = [];

    for (const tagName of tags || []) {
      let tag = await Tag.findOne({ name: tagName });

      if (!tag) {
        tag = new Tag({ name: tagName });
        await tag.save();
      }

      tagIds.push(tag._id);
    }

    const newApi = new Api({
      name,
      description,
      officialLink,
      documentationLink,
      category,
      image,
      user: req.user.id,
      tags: tagIds,
    })

    const apiData = await newApi.save();

    return res.json({ result: true, api: apiData });

  } catch (error) {
    console.error("Error craeting API:", error);
    return res.status(500).json({ result: false, error: error.message });
  }
})

router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId

  try {
    const apis = await Api.find({ user: userId });

    if (apis.length === 0) {
      res.json({ result: false, error: "Aucune API créée pour cet utilisateur" });
    }

    res.json({ result: true, apis });

  } catch (error) {
    console.log(error)
    res.json({ result: false, error: error.message })
  }
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

router.get("/allApi", async (req, res) => {
  try {
    const data = await Api.find();


    res.status(200).json({ result: true, allAPI: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ result: false });
  }
});

router.put("/:id", checkToken, async (req, res) => {
  if (!req.body.name || req.body.name === "") {
    return res.json({ result: false, error: "missing compulsory field" });
  }
  const apiToUpdate = await Api.findById(req.params.id);
  // if (!apiToUpdate) {
  //     return res.json({ result: false, error: 'Api not found' })
  // }
  if (apiToUpdate.user.toString() !== req.user.id) {
    return res.json({
      result: false,
      error: "Unauthorized: You are not the owner of this API.",
    });
  }
  const updateData = {
    name: req.body.name,
    image: req.body.image || null,
    description: req.body.description || null,
    officialLink: req.body.officialLink || null,
    category: req.body.category || null,
    documentationLink: req.body.documentationLink || null,
    tags: req.body.tags || []
  };

  const updatedApi = await Api.updateOne({ _id: req.params.id }, updateData);
  console.log(updatedApi);
  return res.json({ result: true, message: "API successfully updated." });
});

router.delete("/", (req, res) => {
  if (!req.body.name) {
    return res.json({ result: false, error: "Missing API name" });
  }
  Api.deleteOne({ name: req.body.name }).then((data) => {
    if (data.deletedCount) {
      res.json({ result: true, message: "API deleted" });
    } else {
      res.json({ result: false, message: "API not found" });
    }
  });
});

router.get("/top", async (req, res) => {
  try {
    const topApis = await Api.find().sort({ notation: -1 }).limit(10);
    res.json({ result: true, apis: topApis });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
})

router.get("/:name", (req, res) => {
  Api.findOne({ name: req.params.name }).then((data) => {
    if (data) {
      res.json({ result: true, api: data });
    } else {
      res.json({ result: false, error: "API not found" });
    }
  });
});

module.exports = router;
