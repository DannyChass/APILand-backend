const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/blacklistedToken");
const { compareToken } = require("../utils/hashToken");

module.exports = async function (req, res, next) {
    console.log("CHECKTOKEN CALLED");
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ result: false, error: "No access token provided" });
        }

        const token = authHeader.replace("Bearer ", "");

        const blackListedTokens = await BlacklistedToken.find({});
        for (const entry of blackListedTokens) {
            const match = await compareToken(token, entry.tokenHash);
            if (match) {
                return res.status(401).json({ result: false, error: "Token invalidated" });
            }
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("DECODED USER:", decoded);

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({ result: false, error: "Invalid or expired access token" });
    }
};