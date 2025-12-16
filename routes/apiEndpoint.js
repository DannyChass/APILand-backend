const express = require("express");
const router = express.Router();

const Api = require("../models/api");
const ApiEndpoint = require("../models/apiEndpoint");

router.post("/:apiId/endpoints", async (req, res) => {
    try {
        const { apiId } = req.params;

        console.log("apiId param =", apiId);
        console.log("body =", req.body);

        const api = await Api.findById(apiId);
        if (!api) {
            return res.status(404).json({
                result: false,
                error: "API not found",
            });
        }

        const {
            method,
            path,
            queryParams,
            bodyExample,
            responseExamples,
        } = req.body;

        if (!method || !path) {
            return res.status(400).json({
                result: false,
                error: "method and path are required",
            });
        }

        const endpoint = new ApiEndpoint({
            api: apiId,
            method,
            path,
            queryParams,
            bodyExample,
            responseExamples,
        });

        await endpoint.save();

        res.status(201).json({
            result: true,
            endpoint,
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                result: false,
                error: "This endpoint already exists for this API",
            });
        }

        console.error(error);
        res.status(500).json({
            result: false,
            error: "Internal server error",
        });
    }
});

module.exports = router;