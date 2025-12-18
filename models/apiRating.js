const mongoose = require("mongoose");

const apiRatingSchema = mongoose.Schema(
  {
    api: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "apis",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    value: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  { timestamps: true }
);

apiRatingSchema.index({ api: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("apiRatings", apiRatingSchema);