const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bets: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Bet',
    },
  ],
  admin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', userSchema);
