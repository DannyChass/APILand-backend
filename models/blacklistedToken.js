const mongoose = require("mongoose");

const blacklistedTokenSchema = new mongoose.Schema({
    tokenHash: String,
    createdAt: {
        type: Date,
        expires: "7d",
        default: Date.now
    }
});

module.exports = mongoose.model("blacklistedTokens", blacklistedTokenSchema);    