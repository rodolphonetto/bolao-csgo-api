const express = require('express')
const router = express.Router()
const Player = require('../models/player')
const validators = require('../validation/player')
const isEmpty = require('../validation/is-empty')
const fileDelete = require('../config/file')

// Retornar players cadastrados
router.get('/', (req, res) =>{
	Player.find()
	.then(players => {
		if (isEmpty(players)) {
			return res.status(404).json({msg: 'Nenhum player encontrado'})
		}
		return res.json(players)
	})
	.catch(err => {
		console.log(err)
	})
})

// Pesquisa de Players
router.post('/search-player', (req, res) => {
	const playerName = req.body.name
	Player.find({
		name: new RegExp(playerName, 'i')
	})
	.then(players =>{
		if (isEmpty(players)) {
			return res.status(404).json({msg: 'Nenhum player encontrado'})
		}
		return res.json(players)
	})
	.catch(err => {
		console.log(err)
	})
})

// Adicionar/Editar novo jogador
router.post('/add-player', (req, res) => {
	const playerFields = {}
	const playerID = req.body.playerID
	if (req.file) playerFields.photo = req.file.filename
	if (req.body.name)  playerFields.name = req.body.name
	if (req.body.country)  playerFields.country = req.body.country

	Player.findById(playerID)
	.then(player => {
		if (player) {
			if (playerFields.photo) {
				fileDelete.deleteFile(player.photo)
			} 
		// Validação
		const { errors, isValid } = validators.validateEditPlayer(playerFields)
		if (!isValid) {
			return res.status(400).json(errors)
		}
		// 
			Player.findOneAndUpdate(
				{ _id: playerID },
				{ $set: playerFields },
				{ new: true },
			)
			.then(player => res.json(player))
		} else {
			// Validação
			const { errors, isValid } = validators.validatePlayer(playerFields)
			if (!isValid) {
				return res.status(400).json(errors)
			}
			// 		
			new Player(playerFields)
			.save()
			.then(player => {
				return res.json(player)
			})
		}
	})
	.catch(err => {
		console.log(err)
	})
})

// Devolver player para edição
router.get('/edit-player/:playerID', (req, res) => {
	const playerID = req.params.playerID
	Player.findById(playerID)
	.then(player => {
		if (!player) {
			return res.status(404).json({msg: 'Player não encontrado'})
		}
		return res.json(player)
	})
})

// Deletar player
router.post('/del-player', (req, res) => {
	const playerID = req.body.playerID

	Player.findById(playerID)
	.then(player => {
		if (!player) {
			return res.status(404).json({msg: 'Player não encontrado'})
		}
		fileDelete.deleteFile(player.photo)
		Player.remove()
		return res.json({msg: 'Player excluido com sucesso'})
	})
	.catch(err => {
		console.log(err)
	})
})

module.exports = router