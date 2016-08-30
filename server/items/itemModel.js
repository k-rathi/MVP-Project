var Q = require('q');
var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  date: Date,
  location: String,
  time: String,
  lat: String,
  long: String,
  text: String
});

module.exports = mongoose.model('items', ItemSchema);