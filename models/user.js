const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true },
    username: { type: String, required: true, unique: true },
    firstname: { type: String },
    lastname: { type: String },
    image: { type: String, default:'https://res.cloudinary.com/der6j42x7/image/upload/v1766136487/Users_Avatar/d9bsyqzxi6zpygibljct.png' },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    birthDate: {type: Date, default:null},
    gender: {type: String, default:''},
    country: {type: String, default:""},
    description: {type: String, default:""},
    githubLink: {type: String, default:""},
    telephoneNumber: { type: String, default:"" },
    createdApis: [
        { type: mongoose.Schema.Types.ObjectId, ref: "apis" }
    ]
}
)

module.exports = mongoose.model("users", userSchema);