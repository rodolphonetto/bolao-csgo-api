const express = require('express')
const router = express.Router()
const Evento = require('../models/events')
const Team = require('../models/team')
const isEmpty = require('../validation/is-empty')
const validators = require('../validation/events')
const fileDelete = require('../config/file')

// Adicionar/editar novo evento
router.post('/add-event', (req, res) => {
	const eventFields = {}
	const eventID = req.body.eventID
	if (req.file) eventFields.logo = req.file.filename
	if (req.body.name)  eventFields.name = req.body.name
	if (req.body.country)  eventFields.country = req.body.country

	Evento.findById(eventID)
	.then(event => {
		if (event) {
		// Validação
		const { errors, isValid } = validators.validateEditEvent(eventFields)
		if (!isValid) {
			fileDelete.deleteFile(eventFields.logo)
			return res.status(400).json(errors)
		}
		// 
			Evento.findOneAndUpdate(
				{ _id: eventID },
				{ $set: eventFields },
				{ new: true },
			)
			.then(event =>{
				fileDelete.deleteFile(event.logo)
				res.json(event)
			})
			.catch(err => {
				fileDelete.deleteFile(eventFields.logo)
				console.log(err)
			})
		} else {
			// Validação
			const { errors, isValid } = validators.validateEvent(eventFields)
			if (!isValid) {
				fileDelete.deleteFile(eventFields.logo)
				return res.status(400).json(errors)
			}
			// 		
			new Evento(eventFields)
			.save()
			.then(event => {
				return res.json(event)
			})
			.catch(err => {	
				fileDelete.deleteFile(eventFields.logo)
				console.log(err)
			})
		}
	})
	.catch(err => {
		console.log(err)
	})
})

module.exports = router