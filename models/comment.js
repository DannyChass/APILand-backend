const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        api: { type: mongoose.Schema.Types.ObjectId, ref: "apis", required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },

        content: { type: String, required: true },

        parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "comments", default: null },
        replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }],

        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }]
    },

    { timestamp: true }

);

module.exports = mongoose.model("comments", commentSchema);