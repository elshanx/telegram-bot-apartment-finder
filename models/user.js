const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  viewedApartments: { type: mongoose.SchemaTypes.Array },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
