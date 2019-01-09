const express = require('express')
const router = express.Router()
const Country = require('../models/country')
const validateCountry = require('../validation/country')
const validateEditCountry = require('../validation/country')

// Rota que adiciona um novo pais
router.post('/add-country', (req, res, next) => {

	const { errors, isValid } = validateCountry(req.body)

	if (!isValid) {
		return res.status(400).json(errors)
	}

	const name = req.body.name
	const flag = req.file

	Country.findOne({ name: name })
	.then(country => {
		if (country) {
			return res.status(400).json({msg: 'Nome de país já cadastrado'})
		} else {
			const country = new Country({
				name: name,
				flag: flag.filename
			})
			country
			.save()
			.then(result => {
				console.log("Pais criado com sucesso")
			})
			.catch(err => {
				console.log(err)
			})
		}
	})
})


// Rota que edita um pais
router.put('/edit-country', (req, res, next) => {

	const { errors, isValid } = validateEditCountry(req.body)

	if (!isValid) {
		return res.status(400).json(errors)
	}

	const countryID = req.body.countryID
	const updatedName = req.body.name
	const updatedFlag = req.file
	 
		Country.findById(countryID)
		.then(country => {
			if (!country) {
				return res.status(404).json({msg: 'Pais não encontrado'})	
			} else {
				country.name = updatedName
				if (updatedFlag) {
					country.flag = updatedFlag.filename
				}
				return country.save()
				.then(result => {
					console.log('País atualizado')
				})
			}
		})
		.catch(err => {
			console.log(err)
		})
		
})

module.exports = router