const express = require('express')
const router = express.Router()
const Country = require('../models/country')
const Team = require('../models/team')
const validateTeam = require('../validation/team')
const isEmpty = require('../validation/is-empty')

// Adicionar novo time
router.post('/add-team', (req, res) => {

	const { errors, isValid } = validateTeam(req.body)
	
	console.log(errors)
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

module.exports = router