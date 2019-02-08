const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const matchSchema = new Schema({
  desc: {
    type: String,
    required: true,
  },
  teamA: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  resultA: {
    type: Number,
    required: true,
  },
  teamB: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  resultB: {
    type: Number,
    required: true,
  },

  bets: [
    {
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
    },
  ],
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Evento',
    required: true,
  },
  open: {
    type: Boolean,
    default: true,
  },
  finished: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Match', matchSchema);
