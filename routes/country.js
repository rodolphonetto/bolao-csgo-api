const express = require('express')
const router = express.Router()
const Country = require('../models/country')
const validateCountry = require('../validation/country')
const validateEditCountry = require('../validation/country')
const isEmpty = require('../validation/is-empty')

// Rota que devolve os paises
router.get('/', (req, res) => {
	Country.find()
	.then(countries => {
		if (isEmpty(countries)) {
			return res.status(404).json({msg: 'Nenhum país encontrado'})	 
		}
		return res.json(countries)
	})
	.catch (err => {
		console.log(err)
	})
})

// Função busca de países
router.post('/search-country', (req,res) => {
	const countryName = req.body.countryName
	Country.find({
		name: new RegExp(countryName, 'i')
	})
	.then(countries => {
		if (isEmpty(countries)) {
			return res.status(404).json({msg: 'Nenhum país encontrado'})	 
		}
		return res.json(countries)
	})
	.catch(err => {
		console.log(err)
	})
})

// Rota que adiciona um novo pais
router.post('/add-country', (req, res) => {

	const { errors, isValid } = validateCountry(req.body)

	if (!isValid) {
		return res.status(400).json(errors)
	}

	const countryFields = {}
	const countryID = req.body.countryID
	if (req.body.name) countryFields.name = req.body.name
	if (req.file) countryFields.flag = req.file.filename

	Country.findById(countryID) 
	.then(country => {
		if (country) {
			Country.findOneAndUpdate(
			{ _id: countryID },
			{ $set: countryFields },
			{ new: true }
			)
			.then(country => res.json(country))
		} else {
			Country.findOne({ name: countryFields.name })
			.then(country => {
				if (country) {
					return res.status(400).json({msg: 'Nome de país já cadastrado'})
				} else {
					new Country(countryFields)
					.save()
					.then(result => {
						return res.json(result)
					})
					.catch(err => {
						console.log(err)
					})
				}
			})
		}
	})


})

// Rota devolve pais para edição
router.get('/edit-country/:countryID', (req, res) => {
	const countryID = req.params.countryID;
	Country.findById(countryID)
	  .then(country => {
		if (!country) {
			return res.status(404).json({msg: 'Pais não encontrado'})
		}
		return res.json(country)
	  })
	  .catch(err => console.log(err));
})

// Rota que deleta um país
router.post('/del-country', (req, res) => {
	const countryID = req.body.countryID
	Country.findByIdAndRemove(countryID)
	.then((country) => {
		if (!country) {
			return res.status(404).json({msg: 'Pais não encontrado'})	 
		}
		return res.json({msg: 'Pais excluido com sucesso'})
	})
	.catch (err => {
		console.log(err)
	})
})

module.exports = router