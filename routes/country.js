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

// Rota que edita um pais
router.put('/edit-country', (req, res) => {

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
					return res.json({msg: 'Pais atualizado com sucesso'})
				})
			}
		})
		.catch(err => {
			console.log(err)
		})
		
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