const cloudinary = require("cloudinary").v2;
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log(process.env.CLOUDINARY_API_KEY)
const storage = multer.diskStorage({});
const upload = multer({ storage });

module.exports = cloudinary;