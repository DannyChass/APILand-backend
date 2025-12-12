const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    firstname: { type: String },
    lastname: { type: String },
    image: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    birthDate: {type: Date, default:null},
    gender: {type: String, default:''},
    country: {type: String, default:""},
    telephoneNumber: { type: String, default:"" },
    createdApis: [
        { type: mongoose.Schema.Types.ObjectId, ref: "apis" }
    ]
}
)

module.exports = mongoose.model("users", userSchema);