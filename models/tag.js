const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const Tag = mongoose.model("tags", tagSchema);

module.exports = Tag;