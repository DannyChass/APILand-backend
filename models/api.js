const mongoose = require('mongoose');

const apiSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: String,
  description: String,
  officialLink: String,
  category: String,
  documentationLink: String,
  notation: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tags' }]
});

const Api = mongoose.model('apis', apiSchema);

module.exports = Api;