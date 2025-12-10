var express = require("express");
var router = express.Router();

require("../models/connexion");
const Api = require("../models/api");
const checkToken = require("../middlewares/checkToken");

router.post("/", checkToken, (req, res) => {
  console.log(req.body);
  if (!req.body || !req.body.name || req.body.name === "") {
    res.json({ result: false, error: "missing compulsory field" });
  } else {
    Api.findOne({ name: req.body.name }).then((data) => {
      if (data) {
        return res.json({ result: false, error: "Api already exist" });
      } else {
        const newApi = new Api({
          name: req.body.name,
          image: req.body.image,
          description: req.body.description,
          officialLink: req.body.officialLink,
          category: req.body.category,
          documentationLink: req.body.documentationLink,
          user: req.user.id,
          tags: req.body.tags || []
        });
        newApi.save().then((apiData) => {
          return res.json({ result: true, apiData: apiData });
        });
      }
    });
  }
});

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

router.get("/:name", (req, res) => {
  Api.findOne({ name: req.params.name }).then((data) => {
    if (data) {
      res.json({ result: true, api: data });
    } else {
      res.json({ result: false, error: "API not found" });
    }
  });
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

module.exports = router;
