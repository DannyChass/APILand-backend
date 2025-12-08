const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    firstname: { type: String },
    lastname: { type: String },
    image: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    telephoneNumber: { type: String },
}
)

module.exports = mongoose.model("User", userSchema);