const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },

        type: {
            type: String,
            enum: ["comment", "reply", "like", "follow"],
            required: true,
        },

        api: { type: mongoose.Schema.Types.ObjectId, ref: "apis" },
        ccomment: { type: mongoose.Schema.Types.ObjectId, ref: "comments" },
        message: { type: String },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("notifications", notificationSchema);