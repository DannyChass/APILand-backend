const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    content: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    api: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "apis",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("news", newsSchema);