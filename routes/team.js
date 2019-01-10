const express = require('express')
const router = express.Router()
const Country = require('../models/country')
const Team = require('../models/team')
const validateTeam = require('../validation/team')
const validateEditTeam = require('../validation/team')
const isEmpty = require('../validation/is-empty')

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


// Adicionar novo time
router.post('/add-team', (req, res) => {

	const { errors, isValid } = validateTeam(req.body)
	if (!isValid) {
		return res.status(400).json(errors)
	}

	const name = req.body.name
	const logo = req.file
	const country = req.body.country

	Team.findOne({name: name})
	.then(team => {
		if (team) {
			return res.status(400).json({msg: 'Nome de time já cadastrado'})
		}
		Country.findById(country)
		.then(country => {
			if (!country) {
				return res.status(404).json({msg: 'País não encontrado'})
			}
			const countryFlag = country.flag
			const countryName = country.name
			const team = new Team({
				name: name,
				logo: logo.filename,
				countryName: countryName,
				countryFlag: countryFlag,
				country: country
		})
		team.save()
		})
		.then(result => {
			return res.json({msg: 'Time cadastrado com sucesso'})
		})	
	})
	.catch(err => {
		console.log(err)
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

// Rota que edita um time
router.put('/edit-team', (req, res) => {
	
	const { errors, isValid } = validateEditTeam(req.body)
	if (!isValid) {
		return res.status(400).json(errors)
	}

	const teamID = req.body.teamID
	const countryID = req.body.country
	const updatedName = req.body.name
	const updatedLogo = req.file

	Country.findById(countryID)
	.then(country => {
		if (!country) {
			return res.status(404).json({msg: 'País não encontrado'})
		}
		Team.findById(teamID)
		.then(team => {
			if (!team) {
				return res.status(404).json({msg: 'Time não encontrado'})
			}
			team.country = country
			team.name = updatedName
			if (updatedLogo) {
				team.logo = updatedLogo.filename
			}
		return team.save()
		.then(result => {
			return res.status(404).json(result)
		})
		}) 
	})
	.catch(err => {
		console.log(err)
	})
})

// Deletar Time
router.post('/del-team', (req, res) => {
	const teamID = req.body.teamID

	Team.findByIdAndRemove(teamID)
	.then((team) => {	
		if (!team) {
			return res.status(404).json({msg: 'Time não encontrado'})
		}
			return res.json({msg: 'Time excluido com sucesso'})
		})
	.catch(err => {
		console.log(err)
	})
})

module.exports = router