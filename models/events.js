const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventoSchema = new Schema({
  name: {
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
  matches: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Matches',
    },
  ],
});

module.exports = mongoose.model('Evento', eventoSchema);
