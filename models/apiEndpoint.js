const mongoose = require("mongoose");

const apiEndpointSchema = new mongoose.Schema(
    {
        api: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "apis",
            required: true,
            index: true,
        },

        method: {
            type: String,
            enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            required: true,
        },

        path: {
            type: String,
            required: true,
        },

        summary: String,
        description: String,

        queryParams: [
            {
                name: String,
                type: String,
                required: Boolean,
                description: String,
            },
        ],

        bodyExample: mongoose.Schema.Types.Mixed,

        responseExamples: [
            {
                status: Number,
                description: String,
                example: mongoose.Schema.Types.Mixed,
            },
        ],
    },
    {
        timestamps: true,
    }
);

apiEndpointSchema.index(
    { api: 1, method: 1, path: 1 },
    { unique: true }
);

module.exports = mongoose.model("api_endpoints", apiEndpointSchema);