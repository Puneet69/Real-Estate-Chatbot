const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: { type: String, required: true },      // can be email or username
  propertyId: { type: String, required: true } // property id
});

module.exports = mongoose.model('Favorite', favoriteSchema);
