const express = require("express");
const router = express.Router();

const Api = require("../models/api");
const ApiEndpoint = require("../models/apiEndpoint");
const checkToken = require("../middlewares/checkToken");

router.post("/:apiId/endpoints", checkToken, async (req, res) => {
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

router.get("/:apiId/endpoints", async (req, res) => {
    try {
        const { apiId } = req.params;

        const endpoints = await ApiEndpoint.find({ api: apiId })
            .sort({ createdAt: 1 });

        res.json({
            result: true,
            endpoints,
        });
    } catch (error) {
        console.error("Error fetching endpoints:", error);
        res.status(500).json({
            result: false,
            error: "Internal server error",
        });
    }
});

router.delete("/:apiId/endpoints/:endpointId", checkToken, async (req, res) => {
    try {
        const { apiId, endpointId } = req.params;


        const deleted = await ApiEndpoint.findOneAndDelete({
            _id: endpointId,
            api: apiId,
        });

        if (!deleted) {
            res.status(404).json({ result: false, error: "Endpoint not found" });
        }

        res.json({ result: true, deleted });

    } catch (error) {
        res.status(500).json({ result: false, error: "Internal server error" });
    }
})


module.exports = router;