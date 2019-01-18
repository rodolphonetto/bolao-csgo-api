const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: 'Country',
    required: true,
  },
});

module.exports = mongoose.model('Player', playerSchema);
