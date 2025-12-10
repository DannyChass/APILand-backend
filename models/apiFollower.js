const mongoose = require("mongoose");

const apiFollowerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    api: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "apis",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

apiFollowerSchema.index({ user: 1, api: 1 }, { unique: true });

module.exports = mongoose.model("api_followers", apiFollowerSchema);