const mongoose = require('mongoose')
const Schema = mongoose.Schema

const matchSchema = new Schema({
    desc: {
        type: String,
        required: true 
    },
    
    teamA: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true 
    },
    
    teamB: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true 
    },
    
    event: {
		type: Schema.Types.ObjectId,
		ref: 'Evento',
		required: true
    },

    maps: [
        {
            teamA: {
                team: {            
                    type: Schema.Types.ObjectId,
                    ref: 'Team',
                    required: true
                },
                result: {
                    type: Number,
                    required: true
                }
            },
            teamB: {
                team: {            
                    type: Schema.Types.ObjectId,
                    ref: 'Team',
                    required: true
                },
                result: {
                    type: Number,
                    required: true
                }
            },
        }
    ]

})

module.exports = mongoose.model('Match', matchSchema)