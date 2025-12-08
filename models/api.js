const mongoose = require('mongoose');

const apiSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: File,
  description: String,
  officialLink: String,
  category: String,
  documentationLink: String,
  notation: Number,
  user:{type:mongoose.Schema.Types.ObjectId, ref:'users'},
  tag: {type:mongoose.Schema.Types.ObjectId, ref:'tags'}
});

const Api = mongoose.model('api', apiSchema);

module.exports = Api;