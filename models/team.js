const mongoose = require('mongoose')
const Schema = mongoose.Schema

const teamSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	logo: {
		type: String,
		required: true
	},
	country: {
		type: Schema.Types.ObjectId,
		ref: 'Country',
		required: true
	}
})

module.exports = mongoose.model('Team', teamSchema)