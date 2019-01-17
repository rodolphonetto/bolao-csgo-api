const express = require('express')

const router = express.Router()
const Team = require('../models/team')
const validators = require('../validation/team')
const isEmpty = require('../validation/is-empty')
const fileDelete = require('../config/file')

// Retornar times cadastrados
router.get('/', (req, res) => {
	Team.find()
	.then(teams => {
		if (isEmpty(teams)) {
			return res.status(404).json({msg: 'Nenhum time encontrado'})
		}
		return res.json(teams)
	})
	.catch(err => {
		console.log(err)
	})
})

// Pesquisa de times
router.post('/search-team', (req,res) => {
	const teamName = req.body.teamName
	Team.find({
		name: new RegExp(teamName, 'i')
	})
	.then(teams => {
		if (isEmpty(teams)) {
			return res.status(404).json({msg: 'Nenhum time encontrado'})	 
		}
		return res.json(teams)
	})
	.catch(err => {
		console.log(err)
	})
})

// Detalha times
router.get('/edit-team/:teamID', (req, res) => {
	const teamID = req.params.teamID
	Team.findById(teamID)
	.populate({
		path: 'players',
		populate: { path: 'country' }
	})
	.then(team => {
		if (!team) {
			return res.status(404).json({msg: 'Time não encontrado'})
		}
		return res.json(team)
	})
})

// Adicionar/Editar novo time
router.post('/add-team', (req, res) => {

	const teamFields = {}
	const teamID = req.body.teamID
	if (req.body.name) teamFields.name = req.body.name
	if (req.file) teamFields.logo = req.file.filename
	if (req.body.country) teamFields.country = req.body.country

	Team.findById(teamID) 
	.then(team => {
		if (team) {
			// Validação
			const { errors, isValid } = validators.validateEditTeam(teamFields)
			if (!isValid) {
				fileDelete.deleteFile(teamFields.logo)
				return res.status(400).json(errors)
			}
			// 
			Team.findOneAndUpdate(
				{ _id: teamID },
				{ $set: teamFields },
				{ new: true }
			)
			.then(team => {
				fileDelete.deleteFile(team.logo)
				res.json(team)}
			)
		} else {
			Team.findOne({name: teamFields.name})
			.then(team => {
				if (team) {
					return res.status(400).json({msg: 'Nome de time já cadastrado'})	
				} else {
					// Validação
					const { errors, isValid } = validators.validateTeam(teamFields)
					if (!isValid) {
						fileDelete.deleteFile(teamFields.logo)
						return res.status(400).json(errors)
					}
					// 
					new Team(teamFields)
					.save()
					.then(team =>{
						return res.json(team)
					})
					.catch(err => {
						fileDelete.deleteFile(teamFields.logo)
						console.log(err)
					})
				}
			})
		}
	})



})

// Devolver time para edição
router.get('/edit-team/:teamID', (req, res) => {
	const teamID = req.params.teamID
	Team.findById(teamID)
	.then(team => {
		if (!team) {
			return res.status(404).json({msg: 'Time não encontrado'})
		}
		return res.json(team)
	})
})

// Deletar Time
router.post('/del-team', (req, res) => {
	const teamID = req.body.teamID

	Team.findById(teamID)
	.then(team => {	
		if (!team) {
			return res.status(404).json({msg: 'Time não encontrado'})
		}
		fileDelete.deleteFile(team.logo)
		Team.remove({ _id: teamID })
		.then(team => {
			return res.json({msg: 'Time excluido com sucesso'})
		})
		})
	.catch(err => {
		console.log(err)
	})
})

// *** Gerenciamento de players *** //

// Adicionar player ao time
router.post('/add-player', (req, res) => {
	const teamID = req.body.teamID
	const playerID = req.body.playerID

	Team.findById(teamID)
	.then(team => {
		if (!team || !playerID) {
			return res.status(404).json({msg: 'Time ou jogador não encontrado'})
		}
		team.players.unshift(playerID)
		team.save()
		.then(team => {
			res.json(team)
		})
	})
})

// Remover player ao time
router.post('/remove-player', (req, res) => {
	const teamID = req.body.teamID
	const playerID = req.body.playerID

	Team.findById(teamID)
	.then(team => {
		if (!team) {
			return res.status(404).json({msg: 'Time não encontrado'})
		}
		const PlayerIndex = team.players
		.map(player => player._id.toString())
		.indexOf(playerID)

		team.players.splice(PlayerIndex, 1)

		team.save()
		.then(team => {
			res.json(team)
		})
		.catch(err => {
			console.log(err)
		})
	})
})

module.exports = router