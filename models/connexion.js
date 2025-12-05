const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "APILand",
        })
        console.log("MongoDB connected sucessfully");
    } catch (error) {
        console.error("MongoDB connection error");
        process.exit(1);
    }
}

module.exports = connectDB;