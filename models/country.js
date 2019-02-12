const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const countrySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  flag: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model('Country', countrySchema);
