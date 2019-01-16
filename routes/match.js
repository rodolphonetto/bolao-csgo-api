const express = require('express')
const router = express.Router()
const Match = require('../models/match')
const validators = require('../validation/match')

// Adicionar/Editar nova partida
router.post('/add-match', (req, res) => {
	const matchFields = {}
	const matchID = req.body.matchID
	if (req.body.desc)  matchFields.desc = req.body.desc
	if (req.body.teamA)  matchFields.teamA = req.body.teamA
    if (req.body.teamB)  matchFields.teamB = req.body.teamB
    if (req.body.event)  matchFields.event = req.body.event
    
	Match.findById(matchID)
	.then(match => {
		if (match) {
		// Validação
		const { errors, isValid } = validators.validateMatch(matchFields)
		if (!isValid) {
			return res.status(400).json(errors)
		}
		// 
            Match.findOneAndUpdate(
				{ _id: matchID },
				{ $set: matchFields },
				{ new: true },
			)
			.then(match => {
				res.json(match)
			})
			.catch(err => {
				console.log(err)
			})
		} else {
			// Validação
			const { errors, isValid } = validators.validateMatch(matchFields)
			if (!isValid) {
				return res.status(400).json(errors)
			}
			// 		
			new Match(matchFields)
			.save()
			.then(match => {
				return res.json(match)
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

// Deletar match
router.post('/del-match', (req, res) => {
	const matchID = req.body.matchID

	Match.findById(matchID)
	.then(match => {
		if (!match) {
			return res.status(404).json({msg: 'Partida não encontrada'})
		}
		match.remove({ _id: matchID })
		.then(match => {
			return res.json({msg: 'Partida excluida com sucesso'})
		})
		
	})
	.catch(err => {
		console.log(err)
	})
})

module.exports = router