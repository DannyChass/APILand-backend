const bcrypt = require("bcrypt");

async function hashToken(token) {
    return await bcrypt.hash(token, 10);
}

async function compareToken(token, hashedToken) {
    return await bcrypt.compare(token, hashedToken);
}

module.exports = { hashToken, compareToken }