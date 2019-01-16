const express = require('express')
const router = express.Router()
const Match = require('../models/match')

// Adicionar/Editar novo mapa

router.post('/add-map', (req, res) => {
	const mapFields = {
            teamA: {

            },
            teamB: {
                
            }
    }
	const matchID = req.body.matchID
	if (req.body.teamA)  mapFields.teamA.team = req.body.teamA
	if (req.body.resultA)  mapFields.teamA.result = req.body.resultA
    if (req.body.teamB)  mapFields.teamB.team = req.body.teamB
	if (req.body.resultB)  mapFields.teamB.result = req.body.resultB
	Match.findById(matchID)
	.then(match => {
		if (match) {
            const arrayNovo = [...match.maps]
            arrayNovo.push(mapFields)

            Match.findOneAndUpdate(
				{ _id: matchID },
				{ $set: { maps: arrayNovo }  },
				{ new: true },
			)
			.then(match => {
				res.json(match)
			})
			.catch(err => {
				console.log(err)
			})
		}
	})
	.catch(err => {
		console.log(err)
	})
})

module.exports = router