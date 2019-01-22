const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const betSchema = new Schema({
  resultA: {
    type: Number,
    required: true,
  },
  resultB: {
    type: Number,
    required: true,
  },
  match: {
    type: Schema.Types.ObjectId,
    ref: 'Match',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('Bet', betSchema);
