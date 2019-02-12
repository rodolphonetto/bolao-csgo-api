const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teamSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: 'Country',
    required: true,
  },
  players: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Player',
    },
  ],
});

module.exports = mongoose.model('Team', teamSchema);
